'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const G = 'linear-gradient(135deg,#FF3CAC,#7B2FFF)'
const GT = 'linear-gradient(90deg,#FF3CAC,#A855F7,#7B2FFF)'
const SG = { fontFamily:"'Space Grotesk',sans-serif" }
const ADMIN_EMAIL = 'stephen.baspin@hotmail.fr'

function mdToHtml(t) {
  if (!t) return ''
  try {
    const PRIX_RE = /---PRIX---([\s\S]*?)---FIN---/g
    t = t.replace(PRIX_RE, (_, c) => {
      const lines = c.trim().split('\n').filter(l=>l.trim())
      const title = lines[0]||''
      const quote = lines.find(l=>l.startsWith('"'))||''
      const just = lines.filter(l=>!l.startsWith('"')&&l!==title).join(' ')
      return `<div style="background:rgba(123,47,255,0.12);border:1px solid rgba(123,47,255,0.3);border-radius:16px;padding:20px;margin:12px 0"><div style="font-weight:800;font-size:16px;margin-bottom:8px">${title}</div>${quote?`<div style="border-left:3px solid #FF3CAC;padding:8px 14px;margin:8px 0;font-style:italic;color:#E0E0F0">${quote}</div>`:''}<div style="font-size:14px;color:#9090A8">${just}</div></div>`
    })
    t = t.replace(/^#{1,3} (.+)$/gm, (_,h) => `<div style="display:flex;align-items:center;gap:12px;margin:40px 0 16px"><div style="height:2px;flex:1;background:linear-gradient(90deg,transparent,#FF3CAC)"></div><div style="font-size:13px;font-weight:800;color:#FF3CAC;letter-spacing:0.1em;text-transform:uppercase">${h}</div><div style="height:2px;flex:1;background:linear-gradient(90deg,#7B2FFF,transparent)"></div></div>`)
    t = t.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#F0EEF8">$1</strong>')
    t = t.replace(/^Verdict\s*:\s*(.+)$/gm,'<div style="padding:10px 16px;background:rgba(255,60,172,0.08);border-radius:12px;border:1px solid rgba(255,60,172,0.2);margin:10px 0;font-size:14px">⚡ $1</div>')
    return t.split('\n\n').map(p=>{p=p.trim();if(!p)return'';if(p.startsWith('<'))return p;return`<p style="margin-bottom:16px;color:#C0C0D0;line-height:1.85;font-size:15px">${p.replace(/\n/g,'<br>')}</p>`}).join('')
  } catch(e) { return `<pre style="color:#F0EEF8;white-space:pre-wrap">${t}</pre>` }
}

export default function ReportPage() {
  const params = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [promoCode, setPromoCode] = useState('')
  const [promoMsg, setPromoMsg] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    async function load() {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'')
      const { data: { user } } = await sb.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await sb.from('credits').select('credits').eq('user_id', user.id).single()
        setCredits(data?.credits || 0)
      }
      const r = await fetch(`/api/report/${params.id}`)
      const d = await r.json()
      if (r.ok) setReport(d)
      setLoading(false)
    }
    load()
  }, [])

  async function handlePay(plan) {
    setPaying(true)
    try {
      const r = await fetch('/api/pay', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({reportId:params.id, plan, userId:user?.id}) })
      const d = await r.json()
      if (d.url) window.location.href = d.url
      else alert(d.error||'Erreur paiement')
    } catch(e) { alert('Erreur paiement') }
    finally { setPaying(false) }
  }

  async function handleUseCredit() {
    if (!user) { window.location.href = `/login?redirect=/r/${params.id}`; return }
    if (credits <= 0) { alert('Pas assez de crédits'); return }
    setPaying(true)
    try {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'')
      const { data } = await sb.from('credits').select('credits').eq('user_id', user.id).single()
      await sb.from('credits').update({ credits: (data?.credits||0) - 1 }).eq('user_id', user.id)
      await fetch(`/api/report/${params.id}`, { method:'PATCH' })
      window.location.reload()
    } catch(e) { alert('Erreur') }
    finally { setPaying(false) }
  }

  async function unlockAsAdmin() {
    await fetch(`/api/report/${params.id}`, { method:'PATCH' })
    window.location.reload()
  }

  async function applyPromo() {
    if (!promoCode.trim()) return
    setPromoLoading(true); setPromoMsg('')
    try {
      const r = await fetch('/api/promo', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({code:promoCode, reportId:params.id, userId:user?.id}) })
      const d = await r.json()
      if (!r.ok) { setPromoMsg('❌ '+d.error); return }
      if (d.type==='free') { setPromoMsg('✅ Code appliqué ! Rapport débloqué !'); setTimeout(()=>window.location.reload(),1500) }
      else setPromoMsg(`✅ Réduction de ${d.discount}% appliquée !`)
    } catch(e) { setPromoMsg('❌ Erreur') }
    finally { setPromoLoading(false) }
  }

  function copy() { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0A0A0F',color:'#F0EEF8'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{textAlign:'center'}}>
        <div style={{width:60,height:60,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 16px',animation:'spin 2s linear infinite'}}>🤔</div>
        <p style={{color:'#8B8A9B'}}>Chargement...</p>
      </div>
    </div>
  )

  if (!report||report.error) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0A0A0F',color:'#F0EEF8',textAlign:'center'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div><div style={{fontSize:48,marginBottom:16}}>😬</div><p>Rapport introuvable ou expiré.</p><a href="/" style={{color:'#FF3CAC',marginTop:16,display:'block'}}>← Nouveau rapport</a></div>
    </div>
  )

  const content = report.paid ? report.full : report.preview

  return (
    <div style={{background:'#0A0A0F',minHeight:'100vh',color:'#F0EEF8'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} @keyframes spin{to{transform:rotate(360deg)}} input:focus{outline:none;border-color:#7B2FFF!important}`}</style>
      <nav style={{position:'sticky',top:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',background:'rgba(10,10,15,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:10,...SG,fontWeight:700,fontSize:17,textDecoration:'none',color:'#F0EEF8'}}>
          <div style={{width:32,height:32,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤔</div>
          Dr Sheldon
        </a>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          {user ? (
            <a href="/account" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:100,padding:'8px 18px',...SG,fontSize:13,fontWeight:600,textDecoration:'none',color:'#F0EEF8'}}>
              📦 {credits} crédit{credits!==1?'s':''}
            </a>
          ) : (
            <a href="/login" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:100,padding:'8px 18px',...SG,fontSize:13,fontWeight:600,textDecoration:'none',color:'#F0EEF8'}}>Connexion</a>
          )}
          {isAdmin && <a href="/admin" style={{background:'linear-gradient(135deg,#FFD700,#FFA500)',color:'#000',borderRadius:100,padding:'8px 18px',...SG,fontSize:13,fontWeight:700,textDecoration:'none'}}>👑 Admin</a>}
          <button onClick={copy} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',borderRadius:100,padding:'8px 18px',...SG,fontSize:13,fontWeight:600,cursor:'pointer',color:'#F0EEF8'}}>{copied?'✅ Copié !':'🔗 Partager'}</button>
          <a href="/" style={{background:G,color:'white',borderRadius:100,padding:'8px 18px',...SG,fontSize:13,fontWeight:600,textDecoration:'none'}}>+ Nouveau</a>
        </div>
      </nav>

      <div style={{maxWidth:720,margin:'0 auto',padding:'48px 24px 80px'}}>
        <div style={{textAlign:'center',marginBottom:40,paddingBottom:32,borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(123,47,255,0.15)',color:'#A855F7',fontSize:12,fontWeight:700,padding:'6px 14px',borderRadius:100,marginBottom:16}}>✅ Rapport Dr Sheldon</div>
          <h1 style={{...SG,fontSize:28,fontWeight:800}}>Le verdict de Dr Sheldon</h1>
        </div>

        <div dangerouslySetInnerHTML={{__html:mdToHtml(content)}}/>

        {!report.paid && (
          <div style={{marginTop:8,position:'relative',zIndex:10}}>
            <div style={{height:60,background:'linear-gradient(transparent,#0A0A0F)',marginTop:-60,position:'relative',zIndex:1,pointerEvents:'none'}}/>
            <div style={{background:'linear-gradient(135deg,rgba(123,47,255,0.15),rgba(255,60,172,0.08))',border:'1px solid rgba(123,47,255,0.3)',borderRadius:24,padding:'40px 32px',textAlign:'center',position:'relative'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:GT,pointerEvents:'none',borderRadius:'24px 24px 0 0'}}/>
              <div style={{fontSize:36,marginBottom:16}}>🔒</div>
              <h2 style={{...SG,fontSize:24,fontWeight:800,marginBottom:8}}>Le meilleur reste à venir</h2>
              <p style={{color:'#8B8A9B',fontSize:15,marginBottom:32,lineHeight:1.6}}>Feuilletons, récompenses, verdict final vous attendent.</p>

              {isAdmin && (
                <button onClick={unlockAsAdmin} style={{width:'100%',padding:'16px',background:'linear-gradient(135deg,#FFD700,#FFA500)',color:'#000',border:'none',borderRadius:14,...SG,fontSize:16,fontWeight:700,cursor:'pointer',marginBottom:16}}>
                  👑 Débloquer (Admin)
                </button>
              )}

              {user && credits > 0 && (
                <button onClick={handleUseCredit} disabled={paying} style={{width:'100%',padding:'16px',background:G,color:'white',border:'none',borderRadius:14,...SG,fontSize:16,fontWeight:700,cursor:paying?'wait':'pointer',marginBottom:16}}>
                  🎟️ Utiliser 1 crédit ({credits} restant{credits>1?'s':''})
                </button>
              )}

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:14,marginBottom:24}}>
                {[
                  {plan:'single',emoji:'📋',title:'Rapport complet',price:'4,99€',desc:'Ce rapport uniquement'},
                  {plan:'pack',emoji:'📦',title:'Pack 5 crédits',price:'10€',desc:'5 rapports au choix'},
                ].map(({plan,emoji,title,price,desc})=>(
                  <button key={plan} onClick={()=>handlePay(plan)} disabled={paying}
                    style={{background:plan==='single'?G:'rgba(255,255,255,0.05)',border:plan==='single'?'none':'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:'20px 14px',cursor:paying?'wait':'pointer',textAlign:'center',color:'#F0EEF8',position:'relative',zIndex:20}}>
                    <div style={{fontSize:28,marginBottom:8}}>{emoji}</div>
                    <div style={{...SG,fontWeight:700,fontSize:14,marginBottom:4}}>{title}</div>
                    <div style={{...SG,fontSize:20,fontWeight:800,marginBottom:4}}>{price}</div>
                    <div style={{fontSize:12,color:plan==='single'?'rgba(255,255,255,0.7)':'#8B8A9B'}}>{desc}</div>
                  </button>
                ))}
              </div>

              <p style={{fontSize:12,color:'#8B8A9B',marginBottom:20}}>💳 Paiement sécurisé Stripe · Accès immédiat</p>

              <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:20}}>
                <p style={{fontSize:13,color:'#8B8A9B',marginBottom:12,textAlign:'left'}}>🎟️ Vous avez un code promo ?</p>
                <div style={{display:'flex',gap:10}}>
                  <input value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())} placeholder="CODE PROMO"
                    style={{flex:1,padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#F0EEF8',fontSize:14,...SG,fontWeight:700,letterSpacing:'0.05em'}}/>
                  <button onClick={applyPromo} disabled={promoLoading||!promoCode.trim()}
                    style={{padding:'12px 20px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,color:'#F0EEF8',...SG,fontSize:14,fontWeight:600,cursor:'pointer'}}>
                    {promoLoading?'...':'Appliquer'}
                  </button>
                </div>
                {promoMsg && <p style={{fontSize:13,marginTop:8,color:promoMsg.startsWith('✅')?'#90EE90':'#ff7070'}}>{promoMsg}</p>}
              </div>
            </div>
          </div>
        )}

        {report.paid && (
          <div style={{display:'flex',gap:12,marginTop:40,flexWrap:'wrap'}}>
            <button onClick={copy} style={{flex:1,minWidth:140,padding:'14px',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#F0EEF8',...SG,fontSize:14,fontWeight:600,cursor:'pointer'}}>{copied?'✅ Copié !':'🔗 Copier le lien'}</button>
            <button onClick={()=>{const s=document.createElement('style');s.innerHTML='@media print{nav{display:none!important}body{background:white!important;color:black!important}*{color:black!important;background:white!important}}';document.head.appendChild(s);window.print();setTimeout(()=>document.head.removeChild(s),1000)}}
              style={{flex:1,minWidth:140,padding:'14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#F0EEF8',...SG,fontSize:14,fontWeight:600,cursor:'pointer'}}>
              📄 Télécharger PDF
            </button>
            <a href="/" style={{flex:1,minWidth:140,padding:'14px',background:G,borderRadius:12,color:'white',...SG,fontSize:14,fontWeight:700,textDecoration:'none',textAlign:'center'}}>🔄 Nouvelle conv</a>
          </div>
        )}
      </div>
    </div>
  )
}
