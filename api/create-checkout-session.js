const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, level, subject, sessionType } = req.body;

  try {
    const isPremium = level.includes('A-Level') || level.includes('T-Level') || level.includes('BTEC');
    let unitAmount = 0;

    if (sessionType === 'package') {
      unitAmount = isPremium ? 40000 : 30000; // £400 or £300 in pence
    } else {
      unitAmount = isPremium ? 4500 : 3500; // £45 or £35 in pence
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { 
            name: `${level} ${subject} - ${sessionType === 'package' ? '10 Sessions' : 'Single Session'}` 
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/?success=true`,
      cancel_url: `${process.env.SITE_URL}/?canceled=true`,
      metadata: { 
        student_name: name, 
        student_email: email, 
        level, 
        subject, 
        session_type: sessionType 
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
