import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendBookingNotification, sendShopOrderNotifications } from './_lib/notify.js';
import { isMissingShopTable } from './_lib/shop.js';
import { recordServerAnalyticsEvent } from './_lib/analytics.js';

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
      } else if (meta.order_type === 'shop') {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        let items = [];
        try {
          items = JSON.parse(meta.items_json || '[]');
        } catch {
          items = [];
        }

        const shipping = session.shipping_details || session.customer_details || {};
        const shippingAddress = shipping.address || {};

        const orderRow = {
          stripe_session_id: session.id,
          customer_email: meta.customer_email || session.customer_email || null,
          customer_name: meta.customer_name || shipping.name || null,
          shipping_name: shipping.name || meta.shipping_name || null,
          shipping_line1: shippingAddress.line1 || meta.shipping_line1 || null,
          shipping_line2: shippingAddress.line2 || meta.shipping_line2 || null,
          shipping_city: shippingAddress.city || meta.shipping_city || null,
          shipping_postcode: shippingAddress.postal_code || meta.shipping_postcode || null,
          shipping_country: shippingAddress.country || meta.shipping_country || 'GB',
          shipping_phone: meta.shipping_phone || null,
          items,
          subtotal_pence: Number(meta.subtotal_pence) || session.amount_subtotal || session.amount_total || 0,
          total_pence: Number(meta.total_pence) || session.amount_total || 0,
          payment_status: 'paid',
          has_physical: meta.has_physical === 'true',
          has_digital: meta.has_digital === 'true',
          updated_at: new Date().toISOString(),
        };

        const { error: orderError } = await supabase
          .from('shop_orders')
          .upsert([orderRow], { onConflict: 'stripe_session_id' });

        if (orderError && !isMissingShopTable(orderError)) {
          console.error('Supabase upsert error (shop_orders):', orderError);
        } else {
          for (const line of items) {
            if (line.product_kind !== 'physical') continue;
            const { data: product } = await supabase
              .from('shop_products')
              .select('stock_quantity')
              .eq('id', line.product_id)
              .maybeSingle();
            if (product && Number.isFinite(Number(product.stock_quantity))) {
              const nextStock = Math.max(0, Number(product.stock_quantity) - Number(line.quantity || 1));
              await supabase.from('shop_products').update({ stock_quantity: nextStock }).eq('id', line.product_id);
            }
          }

          try {
            await sendShopOrderNotifications({
              ...orderRow,
              amount: (orderRow.total_pence || 0) / 100,
            });
          } catch (notifyErr) {
            console.warn('Shop order notification failed (ignored):', notifyErr?.message || notifyErr);
          }

          for (const line of items) {
            await recordServerAnalyticsEvent(supabase, {
              event_name: 'purchase_completed',
              session_id: session.id,
              anonymous_visitor_id: `stripe_${session.id}`,
              page_path: '/shop',
              product_id: line.product_id || null,
              source: 'Direct',
              medium: 'server',
              metadata: {
                revenue_pence: (Number(line.unit_price_pence) || Number(line.unitPricePence) || 0) * (Number(line.quantity) || 1),
                quantity: line.quantity || 1,
                title: line.title || null,
                checkout: 'shop',
              },
            });
          }
        }
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
            message: meta.message || '',
          },
        };

        const { error } = await supabase.from('bookings').insert([insertRow]);
        if (error) {
          console.error('Supabase insert error (bookings):', error);
        } else {
          console.log('Booking inserted for session:', session.id);
          await recordServerAnalyticsEvent(supabase, {
            event_name: 'tutor_booking_confirmed',
            session_id: session.id,
            anonymous_visitor_id: `stripe_${session.id}`,
            page_path: '/',
            source: 'Direct',
            medium: 'server',
            metadata: {
              level: insertRow.level,
              subject: insertRow.subject,
              session_type: insertRow.session_type,
              checkout: 'tutoring',
            },
          });
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
              message: meta.message || '',
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
