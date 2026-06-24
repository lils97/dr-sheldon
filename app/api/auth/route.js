import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { action, email, password } = await request.json()
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    if (action === 'signup') {
      const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
      if (error) return Response.json({ error: error.message }, { status: 400 })
      return Response.json({ user: data.user })
    }

    if (action === 'credits') {
      const { userId } = await request.json().catch(() => ({}))
      const { data } = await supabase.from('credits').select('credits').eq('user_id', userId).single()
      return Response.json({ credits: data?.credits || 0 })
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
