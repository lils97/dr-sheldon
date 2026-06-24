import { inflateRaw } from 'zlib'
import { promisify } from 'util'

const inflateRawAsync = promisify(inflateRaw)

async function extractChatFromZip(buffer) {
  const bytes = Buffer.from(buffer)
  let eocdOffset = -1
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (bytes[i]===0x50&&bytes[i+1]===0x4B&&bytes[i+2]===0x05&&bytes[i+3]===0x06) {
      eocdOffset = i; break
    }
  }
  if (eocdOffset === -1) throw new Error('Format ZIP invalide')
  const cdOffset = bytes.readUInt32LE(eocdOffset + 16)
  const cdSize   = bytes.readUInt32LE(eocdOffset + 12)
  const files = {}
  let pos = cdOffset
  while (pos < cdOffset + cdSize) {
    if (bytes.readUInt32LE(pos) !== 0x02014B50) break
    const compMethod  = bytes.readUInt16LE(pos + 10)
    const compSize    = bytes.readUInt32LE(pos + 20)
    const fnLen       = bytes.readUInt16LE(pos + 28)
    const extraLen    = bytes.readUInt16LE(pos + 30)
    const commentLen  = bytes.readUInt16LE(pos + 32)
    const localOffset = bytes.readUInt32LE(pos + 42)
    const fileName    = bytes.slice(pos + 46, pos + 46 + fnLen).toString('utf8')
    files[fileName]   = { localOffset, compMethod, compSize }
    pos += 46 + fnLen + extraLen + commentLen
  }
  const chatKey = Object.keys(files).find(f => f === '_chat.txt' || f.endsWith('/_chat.txt'))
  if (!chatKey) throw new Error('_chat.txt introuvable. Exporte depuis WhatsApp sans médias.')
  const entry = files[chatKey]
  const lh = entry.localOffset
  const fnL = bytes.readUInt16LE(lh + 26)
  const exL = bytes.readUInt16LE(lh + 28)
  const dataStart = lh + 30 + fnL + exL
  const compData  = bytes.slice(dataStart, dataStart + entry.compSize)
  if (entry.compMethod === 0) return compData.toString('utf8')
  if (entry.compMethod === 8) {
    const decompressed = await inflateRawAsync(compData)
    return decompressed.toString('utf8')
  }
  throw new Error('Compression non supportée: ' + entry.compMethod)
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) return Response.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    const buffer = await file.arrayBuffer()
    const fileName = file.name.toLowerCase()
    let text
    if (fileName.endsWith('.zip')) {
      text = await extractChatFromZip(buffer)
    } else {
      text = Buffer.from(buffer).toString('utf8')
    }
    if (!text || text.trim().length < 30) return Response.json({ error: 'Fichier vide' }, { status: 400 })
    const lineCount = text.split('\n').filter(l => l.trim()).length
    return Response.json({ text, lineCount })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
