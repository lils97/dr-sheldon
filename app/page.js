'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const G  = 'linear-gradient(135deg,#FF3CAC,#7B2FFF)'
const GT = 'linear-gradient(90deg,#FF3CAC,#A855F7,#7B2FFF)'

const LANGS = [
  { code:'fr', label:'Français', flag:'🇫🇷' },
  { code:'en', label:'English',  flag:'🇬🇧' },
  { code:'es', label:'Español',  flag:'🇪🇸' },
  { code:'pt', label:'Português',flag:'🇧🇷' },
  { code:'cr', label:'Créole',   flag:'🌴' },
]

const TONES = [
  { code:'brutal',    label:'Brutal',    emoji:'🔪', desc:'Sans pitié' },
  { code:'drole',     label:'Drôle',     emoji:'😂', desc:'Humour total' },
  { code:'antillais', label:'Antillais', emoji:'🌴', desc:'Style local' },
  { code:'romantique',label:'Romantique',emoji:'💘', desc:'Relations & amour' },
]

const LOADING_MSGS = [
  "Dr Sheldon lit vos messages... et il regrette déjà.",
  "En train de compiler vos contradictions depuis 2019...",
  "Dr Sheldon a trouvé 47 mensonges. Il prend des notes.",
  "Calcul du niveau de chaos... résultat : élevé.",
  "Dr Sheldon analyse votre cas. Diagnostic : compliqué.",
  "Lecture en cours... Dr Sheldon a besoin d'un café.",
  "Vos messages ont été lus. Dr Sheldon est speechless.",
  "Préparation du verdict final... préparez-vous.",
]

const VIBES = ['👨‍👩‍👦 Groupe famille','💑 Situationship','💘 Mon copain','👭 Les meilleures amies','🍺 Les potes','💔 L\'ex','🤙 Les boys','🍾 Vacances','😬 Le crush','🫂 Le taf']

export default function App() {
  const router = useRouter()
  const [page, setPage]       = useState('home')
  const [conv, setConv]       = useState('')
  const [textIn, setTextIn]   = useState('')
  const [fn, setFN]           = useState('')
  const [lang, setLang]       = useState('fr')
  const [tone, setTone]       = useState('drole')
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState(0)
  const [error, setError]     = useState('')
  const [drag, setDrag]       = useState(false)
  const [step, setStep]       = useState(0)
  const fileRef = useRef()

  // Chat bubbles
  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1300),
      setTimeout(() => setStep(3), 2600),
      setTimeout(() => setStep(4), 3400),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  // Loading messages rotation
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadMsg(m => (m + 1) % LOADING_MSGS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [loading])

  async function uploadFile(file) {
    setError(''); setFN('⏳ Lecture...')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const r = await fetch('/api/upload', { method:'POST', body:fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      const cleanText = d.text.replace(/\r\n/g,'\n').replace(/\r/g,'\n')
      setConv(cleanText)
      setFN(`📄 ${file.name} · ${d.lineCount} lignes ✅`)
    } catch(e) { setError(e.message); setFN('') }
  }

  function goOptions() {
    const t = (conv || textIn).trim()
    if (t.length < 30) { setError('Colle une vraie conversation !'); return }
    if (!conv) setConv(textIn)
    setError(''); setPage('options')
  }

  async function analyze() {
    setPage('loading'); setLoading(true); setLoadMsg(0); setError('')
    try {
      const r = await fetch('/api/analyze', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ convText: conv || textIn, lang, tone })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      router.push(`/r/${d.reportId}`)
    } catch(e) {
      setError(e.message)
      setPage('options')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setPage('home'); setConv(''); setTextIn(''); setFN('')
    setError(''); setLang('fr'); setTone('drole')
  }

  const SG = { fontFamily:"'Space Grotesk',sans-serif" }
  const bub = { padding:'12px 18px', borderRadius:18, fontSize:14, lineHeight:1.5 }
  const lo = LANGS.find(l => l.code === lang)
  const to = TONES.find(t => t.code === tone)

  /* ── LOADING ── */
  if (page === 'loading') return (
    <div style={{minHeight:'100vh',background:'#0A0A0F',display:'flex',alignItems:'center',justifyContent:'center',color:'#F0EEF8'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{textAlign:'center',maxWidth:400,padding:24}}>
        <div style={{width:80,height:80,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 28px',animation:'spin 2s linear infinite',boxShadow:'0 0 50px rgba(123,47,255,0.5)'}}>🤔</div>
        <h2 style={{...SG,fontSize:22,fontWeight:800,marginBottom:16}}>Dr Sheldon lit ta conv...</h2>
        <div key={loadMsg} style={{color:'#8B8A9B',fontSize:15,lineHeight:1.6,animation:'fi 0.5s ease',minHeight:48}}>
          {LOADING_MSGS[loadMsg]}
        </div>
        <div style={{marginTop:32,display:'flex',gap:6,justifyContent:'center'}}>
          {[0,1,2].map(i => <div key={i} style={{width:8,height:8,borderRadius:'50%',background:'#7B2FFF',animation:`spin 1.4s ease-in-out ${i*0.16}s infinite`}}/>)}
        </div>
      </div>
    </div>
  )

  /* ── HOME ── */
  if (page === 'home') return (
    <div style={{background:'#0A0A0F',minHeight:'100vh',color:'#F0EEF8',overflowX:'hidden'}}>
      <style>{`
        @keyframes ty{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-4px);opacity:1}}
        @keyframes sv{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        details summary{list-style:none}
        details summary::-webkit-details-marker{display:none}
        textarea:focus{outline:none;border-color:#7B2FFF!important}
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 40px',background:'rgba(10,10,15,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,...SG,fontWeight:700,fontSize:17}}>
          <div style={{width:32,height:32,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤔</div>
          Dr Sheldon
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <a href="/comment-exporter" style={{background:'transparent',border:'none',padding:'10px 16px',...SG,fontSize:14,fontWeight:600,textDecoration:'none',color:'#8B8A9B'}}>Comment exporter ?</a>
          <a href="/login" style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',borderRadius:100,padding:'10px 22px',...SG,fontSize:14,fontWeight:600,textDecoration:'none',color:'#F0EEF8'}}>Connexion</a>
          <a href="#upload" style={{background:G,color:'white',borderRadius:100,padding:'10px 22px',...SG,fontSize:14,fontWeight:600,textDecoration:'none'}}>Analyser →</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'120px 24px 80px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',width:700,height:700,background:'radial-gradient(circle,rgba(123,47,255,0.18) 0%,transparent 70%)',top:-100,left:'50%',transform:'translateX(-50%)',pointerEvents:'none'}}/>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:100,padding:'7px 16px',fontSize:13,color:'#8B8A9B',marginBottom:32,zIndex:1,position:'relative'}}>
          ✨ <span style={{color:'#F0EEF8',fontWeight:600}}>Dr Sheldon lit ta vie</span> mieux que toi
        </div>
        <h1 style={{...SG,fontSize:'clamp(48px,9vw,88px)',fontWeight:800,lineHeight:1,letterSpacing:'-0.03em',marginBottom:24,position:'relative',zIndex:1}}>
          Ton IA qui dit<br/>
          <span style={{background:GT,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>la vérité</span><br/>
          sur ta conv
        </h1>
        <p style={{fontSize:'clamp(16px,2.5vw,20px)',color:'#8B8A9B',maxWidth:500,lineHeight:1.65,marginBottom:44,position:'relative',zIndex:1}}>
          Dr Sheldon lit chaque message et dit franchement ce qu'il pense. Sans filtre. Sans pitié. Avec beaucoup d'humour.
        </p>

        {/* Bulles chat */}
        <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:340,margin:'0 auto 44px',position:'relative',zIndex:1}}>
          {step>=1 && <div style={{...bub,background:G,color:'white',borderBottomRightRadius:4,alignSelf:'flex-end',animation:'fi 0.4s ease'}}>ok mais t'es sûr qu'il m'aime encore ? 👀</div>}
          {step>=2 && step<4 && <div style={{background:'#1C1C28',borderRadius:'18px 18px 4px 18px',padding:'14px 18px',alignSelf:'flex-start',display:'flex',gap:5,alignItems:'center'}}>{[0,.2,.4].map((d,i)=><span key={i} style={{width:7,height:7,background:'#8B8A9B',borderRadius:'50%',display:'inline-block',animation:`ty 1.2s ease-in-out ${d}s infinite`}}/>)}</div>}
          {step>=3 && <div style={{...bub,background:'#1C1C28',color:'#F0EEF8',borderBottomLeftRadius:4,alignSelf:'flex-start',animation:'fi 0.4s ease'}}>Après lecture de vos 847 messages... non.</div>}
          {step>=4 && <div style={{...bub,background:'#1C1C28',color:'#F0EEF8',borderBottomLeftRadius:4,alignSelf:'flex-start',animation:'fi 0.4s ease'}}>Je rigole. Mais à 60%. 😬</div>}
        </div>

        <a href="#upload" style={{display:'inline-flex',alignItems:'center',gap:10,background:G,color:'white',borderRadius:100,padding:'18px 36px',...SG,fontSize:17,fontWeight:700,textDecoration:'none',boxShadow:'0 8px 32px rgba(123,47,255,0.35)',position:'relative',zIndex:1}}>
          🔍 Analyser ma conversation
        </a>
        <p style={{marginTop:14,fontSize:13,color:'#8B8A9B',position:'relative',zIndex:1}}>Aperçu gratuit · Rapport complet à 4,99€</p>
      </section>

      {/* UPLOAD */}
      <section id="upload" style={{padding:'0 24px 100px',maxWidth:680,margin:'0 auto'}}>
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,padding:'48px 40px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at top left,rgba(123,47,255,0.08),transparent 60%)',pointerEvents:'none'}}/>
          <div style={{...SG,fontSize:26,fontWeight:800,marginBottom:8}}>Colle ta conversation 👇</div>
          <p style={{fontSize:14,color:'#8B8A9B',marginBottom:32,lineHeight:1.6}}>Importe un .zip ou .txt WhatsApp, ou colle le texte directement.</p>

          {!fn ? (
            <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)uploadFile(f)}}
              onClick={()=>fileRef.current?.click()}
              style={{border:`2px dashed ${drag?'#7B2FFF':'rgba(255,255,255,0.12)'}`,borderRadius:16,padding:'40px 24px',textAlign:'center',cursor:'pointer',marginBottom:20,background:drag?'rgba(123,47,255,0.06)':'rgba(255,255,255,0.02)',transition:'all 0.2s'}}>
              <input ref={fileRef} type="file" accept=".txt,.zip" style={{display:'none'}} onChange={e=>{if(e.target.files[0])uploadFile(e.target.files[0])}}/>
              <div style={{fontSize:32,marginBottom:12}}>📂</div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Glisse ton fichier ici</div>
              <div style={{fontSize:13,color:'#8B8A9B'}}>ou <span style={{color:'#7B2FFF',fontWeight:600}}>clique pour choisir</span> un .zip ou .txt</div>
            </div>
          ):(
            <div style={{display:'flex',alignItems:'center',gap:12,background:'rgba(123,47,255,0.1)',border:'1px solid rgba(123,47,255,0.3)',borderRadius:12,padding:'14px 16px',marginBottom:20}}>
              <span>📄</span>
              <span style={{fontSize:14,fontWeight:500,flex:1}}>{fn}</span>
              <button onClick={()=>{setFN('');setConv('');if(fileRef.current)fileRef.current.value=''}} style={{background:'none',border:'none',cursor:'pointer',color:'#8B8A9B',fontSize:18}}>✕</button>
            </div>
          )}

          <div style={{display:'flex',alignItems:'center',gap:12,color:'#8B8A9B',fontSize:13,margin:'20px 0'}}>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/> ou colle le texte <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/>
          </div>

          <textarea value={fn?'':textIn} onChange={e=>{if(!fn)setTextIn(e.target.value)}}
            placeholder={'Lucas : T\'as vu son message ?\nMarie : Lol\nLucas : Je sais plus quoi répondre...'}
            style={{width:'100%',minHeight:140,border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:16,fontSize:13,lineHeight:1.6,resize:'vertical',background:'rgba(255,255,255,0.03)',color:'#F0EEF8',transition:'border-color 0.2s',fontFamily:"'Inter',sans-serif"}}/>

          {error && <div style={{background:'rgba(255,85,85,0.1)',border:'1px solid rgba(255,85,85,0.3)',color:'#ff7070',borderRadius:10,padding:'12px 16px',fontSize:14,marginTop:12}}>⚠️ {error}</div>}

          <button onClick={goOptions} style={{width:'100%',marginTop:20,padding:18,background:G,color:'white',border:'none',borderRadius:14,...SG,fontSize:17,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(123,47,255,0.3)'}}>
            🔍 Analyser ma conversation →
          </button>
          <p style={{textAlign:'center',marginTop:12,fontSize:13,color:'#8B8A9B'}}>Aperçu gratuit · Rapport complet 4,99€</p>
        </div>
      </section>

      {/* VIBES */}
      <section style={{padding:'60px 0',overflow:'hidden',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <h2 style={{...SG,fontSize:'clamp(24px,4vw,36px)',fontWeight:800,textAlign:'center',marginBottom:32}}>Tout le monde y passe.</h2>
        <div style={{overflow:'hidden'}}>
          <div style={{display:'flex',gap:12,animation:'sv 20s linear infinite',width:'max-content'}}>
            {[...VIBES,...VIBES].map((v,i)=><div key={i} style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:100,padding:'12px 22px',fontSize:15,whiteSpace:'nowrap',flexShrink:0}}>{v}</div>)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:'80px 24px',maxWidth:640,margin:'0 auto'}}>
        {[
          {q:"C'est gratuit ?", a:"L'aperçu (intro + palmarès) est gratuit. Le rapport complet avec feuilletons, récompenses et verdict est à 4,99€. Tu peux aussi prendre un pack 5 rapports à 10€ ou l'abonnement illimité à 9€/mois."},
          {q:"C'est qui Dr Sheldon ?", a:"Dr Sheldon c'est ton IA sans filtre. Il lit chaque message et dit ce qu'il pense vraiment. Drôle, précis, brutal mais jamais méchant."},
          {q:"Mes messages sont en sécurité ?", a:"Oui. Ta conversation est analysée puis supprimée. Le rapport est conservé 48h puis effacé automatiquement."},
          {q:"Ça marche sur quelles applis ?", a:"WhatsApp et iMessage. Exporte depuis WhatsApp → 'Exporter la discussion', importe le .zip ou .txt."},
        ].map(({q,a},i)=>(
          <details key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            <summary style={{...SG,fontWeight:600,fontSize:16,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'22px 0',userSelect:'none',color:'#F0EEF8'}}>
              {q} <span style={{fontSize:22,color:'#8B8A9B',marginLeft:16}}>+</span>
            </summary>
            <p style={{paddingBottom:22,fontSize:15,color:'#8B8A9B',lineHeight:1.7}}>{a}</p>
          </details>
        ))}
      </section>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.08)',padding:'28px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:13,color:'#8B8A9B',flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8,...SG,fontWeight:700,color:'#F0EEF8'}}>
          <div style={{width:28,height:28,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤔</div>
          Que pense Dr Sheldon ? · 2026
        </div>
        <span>Propulsé par Claude · Anthropic</span>
      </footer>
    </div>
  )

  /* ── OPTIONS (langue + ton) ── */
  if (page === 'options') return (
    <div style={{background:'#0A0A0F',minHeight:'100vh',color:'#F0EEF8'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 40px',background:'rgba(10,10,15,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div onClick={reset} style={{display:'flex',alignItems:'center',gap:10,...SG,fontWeight:700,fontSize:17,cursor:'pointer'}}>
          <div style={{width:32,height:32,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤔</div>
          Dr Sheldon
        </div>
        <button onClick={()=>setPage('home')} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:100,padding:'10px 22px',...SG,fontSize:14,fontWeight:600,cursor:'pointer',color:'#F0EEF8'}}>← Retour</button>
      </nav>

      <div style={{maxWidth:680,margin:'0 auto',padding:'120px 24px 80px'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{width:64,height:64,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 20px'}}>⚙️</div>
          <h1 style={{...SG,fontSize:'clamp(28px,5vw,40px)',fontWeight:800,marginBottom:8}}>Configure ton rapport</h1>
          <p style={{color:'#8B8A9B'}}>Choisis la langue et le ton avant de lancer.</p>
        </div>

        {/* Langue */}
        <div style={{marginBottom:40}}>
          <h2 style={{...SG,fontSize:16,fontWeight:700,marginBottom:16,color:'#FF3CAC',textTransform:'uppercase',letterSpacing:'.08em'}}>🌍 Langue</h2>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>setLang(l.code)}
                style={{background:lang===l.code?'rgba(123,47,255,0.2)':'rgba(255,255,255,0.04)',border:`2px solid ${lang===l.code?'#7B2FFF':'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'12px 20px',cursor:'pointer',color:'#F0EEF8',...SG,fontWeight:600,fontSize:14,display:'flex',alignItems:'center',gap:8,transition:'all 0.15s'}}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ton */}
        <div style={{marginBottom:40}}>
          <h2 style={{...SG,fontSize:16,fontWeight:700,marginBottom:16,color:'#FF3CAC',textTransform:'uppercase',letterSpacing:'.08em'}}>🎭 Ton du rapport</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
            {TONES.map(t=>(
              <button key={t.code} onClick={()=>setTone(t.code)}
                style={{background:tone===t.code?'rgba(255,60,172,0.15)':'rgba(255,255,255,0.04)',border:`2px solid ${tone===t.code?'#FF3CAC':'rgba(255,255,255,0.1)'}`,borderRadius:16,padding:'20px',cursor:'pointer',textAlign:'left',color:'#F0EEF8',transition:'all 0.15s',transform:tone===t.code?'scale(1.02)':'scale(1)'}}>
                <div style={{fontSize:28,marginBottom:8}}>{t.emoji}</div>
                <div style={{...SG,fontWeight:700,fontSize:16,marginBottom:4}}>{t.label}</div>
                <div style={{fontSize:13,color:tone===t.code?'#FF3CAC':'#8B8A9B'}}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{background:'rgba(255,85,85,0.1)',border:'1px solid rgba(255,85,85,0.3)',color:'#ff7070',borderRadius:10,padding:'12px 16px',fontSize:14,marginBottom:20}}>⚠️ {error}</div>}

        <button onClick={analyze} style={{width:'100%',padding:20,background:G,color:'white',border:'none',borderRadius:16,...SG,fontSize:18,fontWeight:700,cursor:'pointer',boxShadow:'0 8px 32px rgba(123,47,255,0.35)'}}>
          🔍 Lancer l'analyse {to?.emoji} en {lo?.label}
        </button>
        <p style={{textAlign:'center',marginTop:12,fontSize:13,color:'#8B8A9B'}}>Aperçu gratuit · Rapport complet 4,99€</p>
      </div>
    </div>
  )

  return null
}
