import Stripe from 'stripe';

/**
 * Vercel serverless function: create a Stripe Checkout session.
 * Called by the booking form (POST /api/create-checkout-session).
 *
 * Required environment variable: STRIPE_SECRET_KEY
 * Optional environment variable: SITE_URL (falls back to the request host)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate the Stripe secret key is actually available at runtime. Without
  // this guard, the Stripe SDK throws the cryptic "You did not provide an API
  // key" error. A missing key almost always means the env var is not set in
  // Vercel, or a redeploy was not triggered after adding it.
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not set in the environment.');
    return res.status(500).json({
      error:
        'Payment is not configured yet. Please contact info@jdscience.co.uk. (Server missing STRIPE_SECRET_KEY.)',
    });
  }

  const stripe = new Stripe(secretKey);

  // Vercel usually parses JSON bodies automatically, but be defensive in case
  // the body arrives as a raw string.
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const { name, email, phone, level, subject, sessionType } = body;

  // Basic validation so a malformed request returns a clear 400 instead of a
  // 500 (e.g. calling `.includes` on an undefined level).
  if (!name || !email || !level || !subject) {
    return res
      .status(400)
      .json({ error: 'Missing required fields (name, email, level, subject).' });
  }

  try {
    const isPremium =
      level.includes('A-Level') || level.includes('T-Level') || level.includes('BTEC');
    const isPackage = sessionType === 'package';

    let unitAmount;
    if (isPackage) {
      unitAmount = isPremium ? 40000 : 30000; // £400 or £300 in pence
    } else {
      unitAmount = isPremium ? 4500 : 3500; // £45 or £35 in pence
    }

    // Build the base site URL. Prefer SITE_URL, otherwise derive from the
    // incoming request so success/cancel URLs are always valid.
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = (process.env.SITE_URL || (host ? `${proto}://${host}` : '')).replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${level} ${subject} - ${isPackage ? '10 Sessions' : 'Single Session'}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        student_name: name,
        student_email: email,
        phone: phone || '',
        level,
        subject,
        session_type: isPackage ? 'package' : 'single',
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session creation failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to create checkout session' });
  }
}
