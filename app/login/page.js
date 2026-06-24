'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const G = 'linear-gradient(135deg,#FF3CAC,#7B2FFF)'
const SG = { fontFamily:"'Space Grotesk',sans-serif" }

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    setLoading(true); setError(''); setSuccess('')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = redirect
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Compte créé ! Tu peux maintenant te connecter.')
        setMode('login')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{background:'#0A0A0F',minHeight:'100vh',color:'#F0EEF8',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} input:focus{outline:none;border-color:#7B2FFF!important}`}</style>
      <div style={{width:'100%',maxWidth:420}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:10,...SG,fontWeight:700,fontSize:17,textDecoration:'none',color:'#F0EEF8',marginBottom:40}}>
          <div style={{width:36,height:36,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🤔</div>
          Dr Sheldon
        </a>
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,padding:'40px 32px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:G}}/>
          <h1 style={{...SG,fontSize:24,fontWeight:800,marginBottom:8}}>{mode==='login'?'Connexion':'Créer un compte'}</h1>
          <p style={{color:'#8B8A9B',fontSize:14,marginBottom:32}}>{mode==='login'?'Accède à tes rapports et crédits.':'Crée ton compte pour acheter des crédits.'}</p>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:13,fontWeight:600,color:'#8B8A9B',display:'block',marginBottom:8}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ton@email.com"
              style={{width:'100%',padding:'14px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#F0EEF8',fontSize:15,transition:'border-color 0.2s'}}/>
          </div>
          <div style={{marginBottom:24}}>
            <label style={{fontSize:13,fontWeight:600,color:'#8B8A9B',display:'block',marginBottom:8}}>Mot de passe</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
              style={{width:'100%',padding:'14px 16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#F0EEF8',fontSize:15,transition:'border-color 0.2s'}}/>
          </div>
          {error && <div style={{background:'rgba(255,85,85,0.1)',border:'1px solid rgba(255,85,85,0.3)',color:'#ff7070',borderRadius:10,padding:'12px 16px',fontSize:14,marginBottom:16}}>⚠️ {error}</div>}
          {success && <div style={{background:'rgba(50,205,50,0.1)',border:'1px solid rgba(50,205,50,0.3)',color:'#90EE90',borderRadius:10,padding:'12px 16px',fontSize:14,marginBottom:16}}>✅ {success}</div>}
          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:16,background:G,color:'white',border:'none',borderRadius:12,...SG,fontSize:16,fontWeight:700,cursor:loading?'wait':'pointer',opacity:loading?0.7:1}}>
            {loading?'...':(mode==='login'?'Se connecter':'Créer mon compte')}
          </button>
          <p style={{textAlign:'center',marginTop:20,fontSize:14,color:'#8B8A9B'}}>
            {mode==='login'?"Pas de compte ? ":"Déjà un compte ? "}
            <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setSuccess('')}}
              style={{background:'none',border:'none',color:'#FF3CAC',cursor:'pointer',fontSize:14,fontWeight:600}}>
              {mode==='login'?'Créer un compte':'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#0A0A0F'}}/>}>
      <LoginContent/>
    </Suspense>
  )
}
