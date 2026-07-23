import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendBookingNotification } from './_lib/notify.js';

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

        // bookings columns (confirmed live): student_name, student_email, phone,
        // level, subject, session_type, status, stripe_session_id,
        // stripe_payment_intent, amount, meta, created_at
        const insertRow = {
          student_name: meta.student_name || null,
          student_email: meta.student_email || session.customer_email || null,
          phone: meta.phone || null,
          level: meta.level || null,
          subject: meta.subject || null,
          session_type: meta.session_type || null,
          status: 'confirmed',
          stripe_session_id: session.id,
          stripe_payment_intent:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
          amount:
            typeof session.amount_total === 'number' ? session.amount_total / 100 : null,
          meta: {
            currency: session.currency || 'gbp',
            customer_email: session.customer_email || null,
          },
        };

        const { error } = await supabase.from('bookings').insert([insertRow]);
        if (error) {
          console.error('Supabase insert error (bookings):', error);
        } else {
          console.log('Booking inserted for session:', session.id);
          // Best-effort owner notification — never let a mail failure break the webhook.
          try {
            await sendBookingNotification({
              student_name: insertRow.student_name,
              student_email: insertRow.student_email,
              phone: insertRow.phone,
              level: insertRow.level,
              subject: insertRow.subject,
              session_type: insertRow.session_type,
              status: insertRow.status,
              amount: insertRow.amount,
            });
          } catch (notifyErr) {
            console.warn('Paid booking notification failed (ignored):', notifyErr?.message || notifyErr);
          }
        }
      }
    }

    // Handle other event types here if needed.
  } catch (err) {
    console.error('Error handling webhook event:', err);
    // Still acknowledge so Stripe does not retry endlessly on unexpected errors.
  }

  return res.status(200).json({ received: true });
}
