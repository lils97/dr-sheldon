'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const G = 'linear-gradient(135deg,#FF3CAC,#7B2FFF)'
const SG = { fontFamily:"'Space Grotesk',sans-serif" }

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('credits').select('credits').eq('user_id', user.id).single()
      setCredits(data?.credits || 0)
      setLoading(false)
    }
    load()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function buyPack() {
    const r = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: 'pack', plan: 'pack', userId: user?.id })
    })
    const d = await r.json()
    if (d.url) window.location.href = d.url
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0A0A0F',display:'flex',alignItems:'center',justifyContent:'center',color:'#F0EEF8'}}>
      <p>Chargement...</p>
    </div>
  )

  return (
    <div style={{background:'#0A0A0F',minHeight:'100vh',color:'#F0EEF8'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 40px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:10,...SG,fontWeight:700,fontSize:17,textDecoration:'none',color:'#F0EEF8'}}>
          <div style={{width:32,height:32,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤔</div>
          Dr Sheldon
        </a>
        <button onClick={logout} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:100,padding:'8px 18px',...SG,fontSize:13,fontWeight:600,cursor:'pointer',color:'#8B8A9B'}}>
          Déconnexion
        </button>
      </nav>

      <div style={{maxWidth:560,margin:'0 auto',padding:'60px 24px'}}>
        <h1 style={{...SG,fontSize:28,fontWeight:800,marginBottom:8}}>Mon compte</h1>
        <p style={{color:'#8B8A9B',marginBottom:40}}>{user?.email}</p>

        {/* Crédits */}
        <div style={{background:'linear-gradient(135deg,rgba(123,47,255,0.15),rgba(255,60,172,0.08))',border:'1px solid rgba(123,47,255,0.3)',borderRadius:20,padding:'32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:G}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div>
              <div style={{...SG,fontSize:16,fontWeight:700,marginBottom:4}}>📦 Crédits rapports</div>
              <div style={{color:'#8B8A9B',fontSize:14}}>1 crédit = 1 rapport complet débloqué</div>
            </div>
            <div style={{...SG,fontSize:48,fontWeight:800,background:G,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{credits}</div>
          </div>
          <button onClick={buyPack}
            style={{width:'100%',padding:'14px',background:G,color:'white',border:'none',borderRadius:12,...SG,fontSize:15,fontWeight:700,cursor:'pointer'}}>
            + Acheter 5 crédits — 10€
          </button>
        </div>

        {/* Pack crédits */}
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'32px'}}>
          <div style={{...SG,fontSize:16,fontWeight:700,marginBottom:4}}>📦 Acheter des crédits</div>
          <div style={{color:'#8B8A9B',fontSize:14,marginBottom:20}}>1 crédit = 1 rapport complet débloqué</div>
          <button onClick={buyPack}
            style={{width:'100%',padding:'14px',background:G,color:'white',border:'none',borderRadius:12,...SG,fontSize:15,fontWeight:700,cursor:'pointer'}}>
            + Acheter 5 crédits — 10€
          </button>
        </div>
      </div>
    </div>
  )
}
