import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { reportId, plan, userId } = await request.json()
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const base = process.env.NEXT_PUBLIC_URL || 'https://dr-sheldon-app.vercel.app'

    const PLANS = {
      single: { price: 499, name: 'Rapport complet Dr Sheldon', credits: 0 },
      pack: { price: 1000, name: 'Pack 5 rapports Dr Sheldon', credits: 5 },
      sub: { price: 900, name: 'Abonnement mensuel illimité', credits: -1 },
    }

    const p = PLANS[plan] || PLANS.single

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'eur', product_data: { name: p.name }, unit_amount: p.price }, quantity: 1 }],
      mode: 'payment',
      success_url: `${base}/r/${reportId}?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/r/${reportId}`,
      metadata: { reportId, plan, userId: userId || '' },
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
