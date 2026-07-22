import { createClient } from '@supabase/supabase-js';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Disable Next.js automatic body parsing so we can verify Stripe signatures.
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('Missing Stripe signature');

  let event;
  try {
    const raw = await getRawBody(req); // Buffer
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message || err);
    return res.status(400).send(`Webhook Error: ${err.message || err}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const meta = session.metadata || {};

      const insertRow = {
        student_name: meta.student_name || null,
        student_email: meta.student_email || session.customer_email || null,
        phone: meta.phone || null,
        level: meta.level || null,
        subject: meta.subject || null,
        session_type: meta.session_type || null,
        status: 'confirmed',
        payment_id: session.id,
        amount_total: typeof session.amount_total === 'number' ? session.amount_total / 100 : null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('bookings').insert([insertRow]);
      if (error) console.error('Supabase insert error (bookings):', error);
      else console.log('Booking inserted for session:', session.id);
    }

    // Handle other event types here if needed
  } catch (err) {
    console.error('Error handling webhook event:', err);
    // don't return 500 for Stripe — still acknowledge so Stripe won't retry endlessly on unexpected errors
  }

  res.status(200).json({ received: true });
}
