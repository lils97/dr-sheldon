import { createClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    const { data, error } = await supabase.from('reports').select('*').eq('id', id).single()
    if (error || !data) return Response.json({ error: 'Introuvable' }, { status: 404 })
    return Response.json({ id: data.id, preview: data.report_preview, full: data.paid ? data.report_full : null, paid: data.paid })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    await supabase.from('reports').update({ paid: true }).eq('id', id)
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
