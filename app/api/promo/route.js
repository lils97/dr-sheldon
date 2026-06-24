import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { code, reportId, userId } = await request.json()
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    const { data: promo, error } = await supabase
      .from('promo_codes').select('*').eq('code', code.toUpperCase().trim()).single()

    if (error || !promo) return Response.json({ error: 'Code invalide' }, { status: 400 })
    if (promo.uses_count >= promo.max_uses) return Response.json({ error: 'Code épuisé' }, { status: 400 })
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) return Response.json({ error: 'Code expiré' }, { status: 400 })

    if (promo.type === 'free' || promo.discount_percent === 100) {
      await supabase.from('reports').update({ paid: true }).eq('id', reportId)
      await supabase.from('promo_uses').insert({ code: promo.code, report_id: reportId, user_id: userId || null })
      await supabase.from('promo_codes').update({ uses_count: promo.uses_count + 1 }).eq('id', promo.id)
      return Response.json({ success: true, type: 'free' })
    }

    return Response.json({ success: true, type: 'discount', discount: promo.discount_percent, promoId: promo.id })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
