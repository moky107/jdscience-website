import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * Vercel serverless function: Stripe webhook handler.
 * Listens for `checkout.session.completed` and records the booking in Supabase.
 *
 * Required environment variables:
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

// Disable body parsing so the raw payload can be used for Stripe signature
// verification. (Recognised by Next.js; harmless on the Vercel Node runtime,
// where getRawBody below reads the untouched request stream.)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Read the raw request body as a Buffer. If the platform has already buffered
// the body (string/Buffer), reuse it; otherwise stream it in.
async function getRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);

  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error(
      'Webhook misconfigured — missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.'
    );
    return res.status(500).send('Webhook not configured');
  }

  const stripe = new Stripe(secretKey);

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('Missing Stripe signature');

  let event;
  try {
    const raw = await getRawBody(req); // Buffer
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const meta = session.metadata || {};

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        console.error(
          'Cannot record booking — missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.'
        );
      } else {
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // Align with the existing bookings table. Prefer payment_id when present;
        // fall back to a minimal row if optional columns are missing.
        const baseRow = {
          student_name: meta.student_name || null,
          student_email: meta.student_email || session.customer_email || null,
          phone: meta.phone || null,
          level: meta.level || null,
          subject: meta.subject || null,
          session_type: meta.session_type || null,
          status: 'confirmed',
        };

        const withPayment = {
          ...baseRow,
          payment_id: session.id,
          meta: {
            stripe_session_id: session.id,
            amount_total:
              typeof session.amount_total === 'number' ? session.amount_total / 100 : null,
            currency: session.currency || 'gbp',
          },
        };

        let { error } = await supabase.from('bookings').insert([withPayment]);

        if (error) {
          // Retry without optional columns that may not exist in the schema.
          console.warn('bookings insert with optional cols failed, retrying minimal:', error.message);
          const minimal = { ...baseRow };
          ({ error } = await supabase.from('bookings').insert([minimal]));
        }

        if (error) console.error('Supabase insert error (bookings):', error);
        else console.log('Booking inserted for session:', session.id);
      }
    }

    // Handle other event types here if needed.
  } catch (err) {
    console.error('Error handling webhook event:', err);
    // Still acknowledge so Stripe does not retry endlessly on unexpected errors.
  }

  return res.status(200).json({ received: true });
}
