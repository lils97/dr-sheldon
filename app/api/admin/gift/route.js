import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { email, amount } = await request.json()
    if (!email || !amount) return Response.json({ error: 'Email et montant requis' }, { status: 400 })

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    // Trouver l'utilisateur par email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) return Response.json({ error: userError.message }, { status: 500 })

    const targetUser = users.users.find(u => u.email === email)
    if (!targetUser) return Response.json({ error: `Utilisateur "${email}" introuvable. Vérifie qu il est bien inscrit.` }, { status: 404 })

    // Ajouter les crédits
    const { data: existing } = await supabase.from('credits').select('credits').eq('user_id', targetUser.id).single()

    if (existing) {
      await supabase.from('credits').update({ credits: existing.credits + amount, updated_at: new Date().toISOString() }).eq('user_id', targetUser.id)
    } else {
      await supabase.from('credits').insert({ user_id: targetUser.id, credits: amount })
    }

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
