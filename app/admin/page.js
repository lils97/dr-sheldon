'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const G = 'linear-gradient(135deg,#FF3CAC,#7B2FFF)'
const SG = { fontFamily:"'Space Grotesk',sans-serif" }
const ADMIN_EMAIL = 'stephen.baspin@hotmail.fr'

function GiftCredits() {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function gift() {
    if (!email.trim()) return
    setLoading(true); setMsg('')
    try {
      const r = await fetch('/api/admin/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), amount })
      })
      const d = await r.json()
      if (!r.ok) { setMsg('❌ ' + d.error); return }
      setMsg(`✅ ${amount} crédit(s) offert(s) à ${email} !`)
      setEmail('')
    } catch(e) { setMsg('❌ Erreur') }
    finally { setLoading(false); setTimeout(() => setMsg(''), 4000) }
  }

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:16,marginBottom:16}}>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:'#8B8A9B',display:'block',marginBottom:8}}>Email de l'utilisateur</label>
          <input value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="user@email.com"
            style={{width:'100%',padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#F0EEF8',fontSize:14}}/>
        </div>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:'#8B8A9B',display:'block',marginBottom:8}}>Crédits</label>
          <input type="number" min="1" max="100" value={amount} onChange={e=>setAmount(parseInt(e.target.value))}
            style={{width:80,padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#F0EEF8',fontSize:14,textAlign:'center'}}/>
        </div>
      </div>
      {msg && <div style={{padding:'10px 16px',borderRadius:10,background:msg.startsWith('✅')?'rgba(50,205,50,0.1)':'rgba(255,85,85,0.1)',color:msg.startsWith('✅')?'#90EE90':'#ff7070',marginBottom:16,fontSize:14}}>{msg}</div>}
      <button onClick={gift} disabled={loading||!email.trim()}
        style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#FFD700,#FFA500)',color:'#000',border:'none',borderRadius:12,fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,cursor:'pointer',opacity:loading||!email.trim()?0.6:1}}>
        {loading ? 'Envoi...' : `🎁 Offrir ${amount} crédit(s)`}
      </button>
    </div>
  )
}

function AdminContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')
  const [newType, setNewType] = useState('free')
  const [newDiscount, setNewDiscount] = useState(50)
  const [newMaxUses, setNewMaxUses] = useState(1)
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      setUser(user)
      await loadCodes()
      setLoading(false)
    }
    load()
  }, [])

  async function loadCodes() {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
    const { data } = await sb.from('promo_codes').select('*').order('created_at', { ascending: false })
    setCodes(data || [])
  }

  async function createCode() {
    if (!newCode.trim()) return
    setCreating(true)
    try {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
      const { error } = await sb.from('promo_codes').insert({
        code: newCode.toUpperCase().trim(),
        type: newType,
        discount_percent: newType === 'free' ? 100 : newDiscount,
        max_uses: newMaxUses,
        uses_count: 0
      })
      if (error) { setMsg('❌ ' + error.message); return }
      setMsg('✅ Code créé !')
      setNewCode('')
      await loadCodes()
    } catch(e) { setMsg('❌ ' + e.message) }
    finally { setCreating(false); setTimeout(() => setMsg(''), 3000) }
  }

  async function deleteCode(id) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
    await sb.from('promo_codes').delete().eq('id', id)
    await loadCodes()
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0A0A0F',display:'flex',alignItems:'center',justifyContent:'center',color:'#F0EEF8'}}><p>Chargement...</p></div>

  return (
    <div style={{background:'#0A0A0F',minHeight:'100vh',color:'#F0EEF8'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} input:focus,select:focus{outline:none;border-color:#7B2FFF!important}`}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 40px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:10,...SG,fontWeight:700,fontSize:17,textDecoration:'none',color:'#F0EEF8'}}>
          <div style={{width:32,height:32,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤔</div>
          Dr Sheldon — Admin
        </a>
        <div style={{display:'flex',gap:10}}>
          <a href="/account" style={{background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:100,padding:'8px 18px',...SG,fontSize:13,fontWeight:600,textDecoration:'none',color:'#8B8A9B'}}>Mon compte</a>
          <a href="/" style={{background:G,color:'white',borderRadius:100,padding:'8px 18px',...SG,fontSize:13,fontWeight:600,textDecoration:'none'}}>+ Nouveau rapport</a>
        </div>
      </nav>

      <div style={{maxWidth:800,margin:'0 auto',padding:'48px 24px'}}>
        <h1 style={{...SG,fontSize:28,fontWeight:800,marginBottom:8}}>🛠️ Dashboard Admin</h1>
        <p style={{color:'#8B8A9B',marginBottom:40}}>Bienvenue Stephen — accès illimité activé.</p>

        {/* Offrir des crédits */}
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'32px',marginBottom:32}}>
          <h2 style={{...SG,fontSize:18,fontWeight:700,marginBottom:24}}>🎁 Offrir des crédits à un utilisateur</h2>
          <GiftCredits />
        </div>

        {/* Créer un code */}
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'32px',marginBottom:32}}>
          <h2 style={{...SG,fontSize:18,fontWeight:700,marginBottom:24}}>🎟️ Créer un code promo</h2>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div>
              <label style={{fontSize:13,fontWeight:600,color:'#8B8A9B',display:'block',marginBottom:8}}>Code</label>
              <input value={newCode} onChange={e=>setNewCode(e.target.value.toUpperCase())}
                placeholder="NOEL2024"
                style={{width:'100%',padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#F0EEF8',fontSize:15,...SG,fontWeight:700,letterSpacing:'0.05em'}}/>
            </div>
            <div>
              <label style={{fontSize:13,fontWeight:600,color:'#8B8A9B',display:'block',marginBottom:8}}>Type</label>
              <select value={newType} onChange={e=>setNewType(e.target.value)}
                style={{width:'100%',padding:'12px 16px',background:'#1C1C28',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#F0EEF8',fontSize:14}}>
                <option value="free">🎁 Rapport gratuit (100%)</option>
                <option value="discount">💰 Réduction (%)</option>
              </select>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            {newType === 'discount' && (
              <div>
                <label style={{fontSize:13,fontWeight:600,color:'#8B8A9B',display:'block',marginBottom:8}}>Réduction (%)</label>
                <input type="number" min="1" max="99" value={newDiscount} onChange={e=>setNewDiscount(parseInt(e.target.value))}
                  style={{width:'100%',padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#F0EEF8',fontSize:15}}/>
              </div>
            )}
            <div>
              <label style={{fontSize:13,fontWeight:600,color:'#8B8A9B',display:'block',marginBottom:8}}>Nombre d'utilisations max</label>
              <input type="number" min="1" value={newMaxUses} onChange={e=>setNewMaxUses(parseInt(e.target.value))}
                style={{width:'100%',padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#F0EEF8',fontSize:15}}/>
            </div>
          </div>

          {msg && <div style={{padding:'10px 16px',borderRadius:10,background:msg.startsWith('✅')?'rgba(50,205,50,0.1)':'rgba(255,85,85,0.1)',color:msg.startsWith('✅')?'#90EE90':'#ff7070',marginBottom:16,fontSize:14}}>{msg}</div>}

          <button onClick={createCode} disabled={creating||!newCode.trim()}
            style={{width:'100%',padding:'14px',background:G,color:'white',border:'none',borderRadius:12,...SG,fontSize:15,fontWeight:700,cursor:'pointer',opacity:creating||!newCode.trim()?0.6:1}}>
            {creating ? 'Création...' : '+ Créer le code'}
          </button>
        </div>

        {/* Liste des codes */}
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'32px'}}>
          <h2 style={{...SG,fontSize:18,fontWeight:700,marginBottom:24}}>📋 Codes actifs ({codes.length})</h2>
          {codes.length === 0 ? (
            <p style={{color:'#8B8A9B',textAlign:'center',padding:'20px 0'}}>Aucun code créé</p>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {codes.map(c => (
                <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',background:'rgba(255,255,255,0.03)',borderRadius:12,border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:16}}>
                    <div style={{...SG,fontWeight:800,fontSize:16,letterSpacing:'0.05em',color:'#FF3CAC'}}>{c.code}</div>
                    <div style={{fontSize:13,background:c.type==='free'?'rgba(50,205,50,0.15)':'rgba(123,47,255,0.15)',color:c.type==='free'?'#90EE90':'#A855F7',padding:'3px 10px',borderRadius:100,fontWeight:600}}>
                      {c.type === 'free' ? '🎁 Gratuit' : `💰 -${c.discount_percent}%`}
                    </div>
                    <div style={{fontSize:13,color:'#8B8A9B'}}>{c.uses_count}/{c.max_uses} utilisations</div>
                  </div>
                  <button onClick={()=>deleteCode(c.id)}
                    style={{background:'rgba(255,85,85,0.1)',border:'1px solid rgba(255,85,85,0.2)',borderRadius:8,padding:'6px 14px',color:'#ff7070',cursor:'pointer',fontSize:13,fontWeight:600}}>
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#0A0A0F'}}/>}>
      <AdminContent/>
    </Suspense>
  )
}
