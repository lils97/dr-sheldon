import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
    } catch (err) {
      // Si pas de webhook secret configuré, parser directement
      event = JSON.parse(body)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { reportId, plan, userId } = session.metadata

      // Marquer rapport comme payé
      if (reportId) {
        await supabase.from('reports').update({ paid: true }).eq('id', reportId)
      }

      // Ajouter crédits si pack
      if (userId && plan === 'pack') {
        const { data } = await supabase.from('credits').select('credits').eq('user_id', userId).single()
        if (data) {
          await supabase.from('credits').update({ credits: data.credits + 5, updated_at: new Date().toISOString() }).eq('user_id', userId)
        } else {
          await supabase.from('credits').insert({ user_id: userId, credits: 5 })
        }
      }
    }

    return Response.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
