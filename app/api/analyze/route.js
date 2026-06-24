import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const LANG_PROMPTS = {
  fr: "Ecris le rapport ENTIEREMENT en francais.",
  en: "Write the report ENTIRELY in English.",
  es: "Escribe el informe COMPLETAMENTE en espanol.",
  pt: "Escreva o relatorio COMPLETAMENTE em portugues.",
  cr: "Ecris en francais avec des expressions creoles martiniquaises.",
}

const TONES = {
  brutal: "Style BRUTAL et sans pitié. Dis les vérités qui font mal. Sois impitoyable mais drôle.",
  drole: "Style DRÔLE avant tout. Chaque phrase doit faire rire. Humour absurde et comparaisons décalées.",
  antillais: "Style ANTILLAIS. Références locales, expressions créoles, culture martiniquaise/guadeloupéenne.",
  romantique: "Style qui analyse les relations, les non-dits, les tensions amoureuses. Psychologue du couple.",
}

function compress(rawText) {
  const allLines = rawText
    .split('\n').map(l => l.replace(/\r/g, '').trim()).filter(l => l.length > 0)
    .map(l => l.replace(/^[\u200e]?\[?\d{2}[\/.-]\d{2}[\/.-]\d{2,4}[,. ]\s*\d{2}:\d{2}(?::\d{2})?\]?\s*/, ''))
    .filter(l => !l.match(/^(sticker omis|image absente|video absente|audio omis|document manquant|vue unique|Les messages|a cree ce groupe|vous a ajoute|a ete supprime|Appel vocal|Appel video|omitted|Media omitted)/i))
    .filter(l => l.includes(':') && l.split(':').slice(1).join(':').trim().length > 1)

  const stats = {}
  allLines.forEach(l => {
    const name = l.split(':')[0].trim()
    if (name && name.length < 40) stats[name] = (stats[name] || 0) + 1
  })
  const total = allLines.length
  const statsText = Object.entries(stats).sort((a, b) => b[1] - a[1])
    .map(([n, c]) => `${n}: ${c} messages (${Math.round(c / total * 100)}%)`).join('\n')

  const filtered = []
  let lastShort = false
  for (const line of allLines) {
    const content = line.split(':').slice(1).join(':').trim()
    const isLong = content.length > 20
    const isShort = content.length <= 6
    if (isLong) { filtered.push(line); lastShort = false; continue }
    if (isShort) { if (!lastShort) { filtered.push(line); lastShort = true } continue }
    filtered.push(line); lastShort = false
  }

  const chunk = 40000
  const debut = filtered.slice(0, Math.floor(filtered.length * 0.33)).join('\n').slice(0, chunk)
  const mid   = filtered.slice(Math.floor(filtered.length * 0.33), Math.floor(filtered.length * 0.66)).join('\n').slice(0, chunk)
  const fin   = filtered.slice(Math.floor(filtered.length * 0.66)).join('\n').slice(0, chunk)

  return { total, compressed: `STATS (${total} messages):\n${statsText}\n\n=== DEBUT ===\n${debut}\n\n=== MILIEU ===\n${mid}\n\n=== FIN ===\n${fin}` }
}

function generateId() {
  return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
}

export async function POST(request) {
  try {
    const { convText, lang, tone } = await request.json()
    if (!convText || convText.trim().length < 30) {
      return Response.json({ error: 'Conversation trop courte' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return Response.json({ error: 'Clé API manquante' }, { status: 500 })

    const client = new Anthropic({ apiKey })
    const langInstr = LANG_PROMPTS[lang] || LANG_PROMPTS.fr
    const toneInstr = TONES[tone] || TONES.drole
    const { total, compressed } = compress(convText)

    const prompt = `Tu es Dr Sheldon. IA sans filtre, drôle, brutalement honnête.

${langInstr}
${toneInstr}

STYLE : Interpelle les gens par leur prénom. Raconte et analyse sans coller des blocs de messages. Max 1 citation courte par personne. Surnoms cinglants. Aucun sujet interdit. NE PAS mentionner dates/heures.

Conversation :
---
${compressed}
---

Rapport COMPLET dans cet ordre :

### Intro
(80 mots max) Surnom collectif drôle. ${total} messages. 2 phrases qui font rire.

### 🥇 Le palmarès des rôles
CHAQUE personne des stats (70 mots max par personne) :
**SURNOM** — Stats — Portrait drôle avec 1 citation courte — Verdict 1 phrase

### 🎬 Les feuilletons
2 histoires avec titres drôles originaux (80 mots max chacune).

### 📌 Les obsessions
2 sujets récurrents avec titres drôles (60 mots max chacun).

### 🟢🔴 Drapeaux
3 verts 🟢 et 3 rouges 🔴. 1 ligne chacun.

### 🏆 La cérémonie des récompenses
6 prix format OBLIGATOIRE :
---PRIX---
EMOJI Nom du prix → Prénom
"1 citation courte"
1 phrase drôle.
---FIN---

### 🔮 Comment vous allez réagir
1 ligne précise par personne.

### ⚖️ Verdict final
2 phrases. Signe "— Dr Sheldon 🤔"

COMMENCE DIRECTEMENT. Drôle. Sans filtre. CONCIS.`

    // Générer le rapport complet
    let fullReport = ''
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullReport += chunk.delta.text
      }
    }

    // Créer aperçu (intro + palmarès seulement, avant les feuilletons)
    const cutMarkers = ['### 🎬', '### Les feuilletons', '### 🎬 Les feuilletons', '## 🎬']
    let previewEnd = fullReport.length
    for (const marker of cutMarkers) {
      const idx = fullReport.indexOf(marker)
      if (idx > 0 && idx < previewEnd) previewEnd = idx
    }
    const preview = fullReport.slice(0, previewEnd).trim()

    // Sauvegarder dans Supabase
    const reportId = generateId()
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    await supabase.from('reports').insert({
      id: reportId,
      report_preview: preview,
      report_full: fullReport,
      paid: false,
      created_at: new Date().toISOString()
    })

    return Response.json({ reportId, preview, total })

  } catch (err) {
    console.error('Analyze error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
