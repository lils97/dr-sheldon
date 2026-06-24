'use client'

const G = 'linear-gradient(135deg,#FF3CAC,#7B2FFF)'
const GT = 'linear-gradient(90deg,#FF3CAC,#A855F7,#7B2FFF)'
const SG = { fontFamily:"'Space Grotesk',sans-serif" }

function Step({ number, title, desc, tip }) {
  return (
    <div style={{display:'flex',gap:20,marginBottom:32}}>
      <div style={{flexShrink:0,width:44,height:44,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',...SG,fontWeight:800,fontSize:18,color:'white'}}>
        {number}
      </div>
      <div style={{flex:1,paddingTop:8}}>
        <div style={{...SG,fontWeight:700,fontSize:17,color:'#F0EEF8',marginBottom:6}}>{title}</div>
        <div style={{fontSize:15,color:'#9090A8',lineHeight:1.7}}>{desc}</div>
        {tip && <div style={{marginTop:10,background:'rgba(123,47,255,0.1)',border:'1px solid rgba(123,47,255,0.25)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#A855F7'}}>💡 {tip}</div>}
      </div>
    </div>
  )
}

function PhoneStep({ emoji, text }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,marginBottom:10}}>
      <span style={{fontSize:22}}>{emoji}</span>
      <span style={{fontSize:14,color:'#C0C0D0',lineHeight:1.5}}>{text}</span>
    </div>
  )
}

export default function CommentExporterPage() {
  return (
    <div style={{background:'#0A0A0F',minHeight:'100vh',color:'#F0EEF8'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 40px',background:'rgba(10,10,15,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:10,...SG,fontWeight:700,fontSize:17,textDecoration:'none',color:'#F0EEF8'}}>
          <div style={{width:32,height:32,background:G,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤔</div>
          Dr Sheldon
        </a>
        <a href="/#upload" style={{background:G,color:'white',borderRadius:100,padding:'10px 22px',...SG,fontSize:14,fontWeight:600,textDecoration:'none'}}>
          Analyser ma conv →
        </a>
      </nav>

      <div style={{maxWidth:720,margin:'0 auto',padding:'60px 24px 100px'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:60}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(123,47,255,0.15)',color:'#A855F7',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',padding:'6px 14px',borderRadius:100,marginBottom:20}}>
            📱 Guide d'export
          </div>
          <h1 style={{...SG,fontSize:'clamp(32px,6vw,52px)',fontWeight:800,lineHeight:1.1,marginBottom:16}}>
            Comment exporter<br/>
            <span style={{background:GT,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>ta conversation</span>
          </h1>
          <p style={{fontSize:17,color:'#8B8A9B',lineHeight:1.6,maxWidth:500,margin:'0 auto'}}>
            Suis ces étapes simples pour exporter ta conversation WhatsApp et la faire analyser par Dr Sheldon.
          </p>
        </div>

        {/* iPhone */}
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,padding:'40px 36px',marginBottom:32,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:GT}}/>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:32}}>
            <div style={{width:48,height:48,background:'rgba(0,200,0,0.15)',border:'1px solid rgba(0,200,0,0.3)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>🍎</div>
            <div>
              <div style={{...SG,fontWeight:800,fontSize:20}}>Sur iPhone</div>
              <div style={{color:'#8B8A9B',fontSize:14}}>iOS 14 et versions récentes</div>
            </div>
          </div>

          <Step number="1" title="Ouvre ta conversation WhatsApp"
            desc="Lance WhatsApp et va dans la conversation que tu veux analyser — groupe ou conversation privée."
            tip="Tu peux analyser n'importe quelle conversation : ton ex, tes amis, ta famille, ton groupe de vacances..." />

          <Step number="2" title="Appuie sur le nom en haut"
            desc="Clique sur le nom de la personne ou du groupe tout en haut de l'écran pour ouvrir les infos de la conversation." />

          <Step number="3" title="Fais défiler vers le bas"
            desc="Descends jusqu'en bas de la page d'infos et cherche l'option 'Exporter la discussion'." />

          <Step number="4" title="Clique sur 'Exporter la discussion'"
            desc="WhatsApp te propose deux options :" />

          <div style={{marginLeft:64,marginBottom:24}}>
            <PhoneStep emoji="📷" text="'Joindre les médias' — inclut toutes les photos et vidéos (fichier plus lourd). Dr Sheldon peut quand même lire la conv !" />
            <PhoneStep emoji="💬" text="'Sans médias' — uniquement les messages texte. Recommandé pour aller plus vite ✅" />
          </div>

          <Step number="5" title="Envoie-toi le fichier"
            desc="Choisis 'Enregistrer dans Fichiers' ou envoie-toi le fichier .zip par email/AirDrop." />

          <Step number="6" title="Importe sur Dr Sheldon"
            desc="Reviens sur le site, clique sur 'Glisse ton fichier ici' et sélectionne le .zip téléchargé. C'est parti ! 🚀" />
        </div>

        {/* Android */}
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,padding:'40px 36px',marginBottom:32,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:GT}}/>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:32}}>
            <div style={{width:48,height:48,background:'rgba(60,180,60,0.15)',border:'1px solid rgba(60,180,60,0.3)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>🤖</div>
            <div>
              <div style={{...SG,fontWeight:800,fontSize:20}}>Sur Android</div>
              <div style={{color:'#8B8A9B',fontSize:14}}>Samsung, Huawei, Pixel...</div>
            </div>
          </div>

          <Step number="1" title="Ouvre ta conversation WhatsApp"
            desc="Lance WhatsApp et va dans la conversation que tu veux analyser." />

          <Step number="2" title="Appuie sur les 3 points ⋮ en haut à droite"
            desc="Un menu va s'ouvrir avec plusieurs options." />

          <Step number="3" title="Clique sur 'Plus'"
            desc="Dans le menu, appuie sur 'Plus' pour voir d'autres options." />

          <Step number="4" title="Clique sur 'Exporter la discussion'"
            desc="Choisis ensuite :" />

          <div style={{marginLeft:64,marginBottom:24}}>
            <PhoneStep emoji="📷" text="'Joindre les médias' — avec toutes les photos (fichier plus lourd)" />
            <PhoneStep emoji="💬" text="'Sans médias' — uniquement les textes. Recommandé ✅" />
          </div>

          <Step number="5" title="Enregistre ou partage le fichier"
            desc="Enregistre le .zip dans tes fichiers ou envoie-le par email pour le récupérer facilement." />

          <Step number="6" title="Importe sur Dr Sheldon"
            desc="Reviens sur le site et importe ton fichier .zip. Dr Sheldon s'occupe du reste ! 🔥" />
        </div>

        {/* FAQ */}
        <div style={{background:'#13131A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,padding:'40px 36px',marginBottom:40}}>
          <h2 style={{...SG,fontSize:20,fontWeight:800,marginBottom:24}}>❓ Questions fréquentes</h2>

          {[
            { q:"Mon fichier est trop lourd, c'est normal ?", a:"Si tu as exporté avec les médias (photos/vidéos), le fichier peut être très lourd. Dr Sheldon lit uniquement le fichier _chat.txt à l'intérieur, donc ça marche quand même. Tu peux aussi réexporter 'Sans médias' pour un fichier plus léger." },
            { q:"Est-ce que mes messages sont sauvegardés ?", a:"Non. Ta conversation est analysée puis supprimée immédiatement. Seul le rapport généré est conservé 48h pour que tu puisses le partager." },
            { q:"Ça marche avec les groupes ?", a:"Oui ! Dr Sheldon analyse aussi bien les conversations privées que les groupes. Plus il y a de membres, plus le rapport est drôle." },
            { q:"Ça marche avec iMessage ?", a:"Pour l'instant Dr Sheldon accepte les exports WhatsApp (.zip ou .txt). Le support iMessage arrive bientôt." },
            { q:"Mon export est en .txt, pas en .zip ?", a:"Les deux formats marchent ! Certains téléphones exportent directement en .txt, d'autres en .zip. Dr Sheldon accepte les deux." },
          ].map(({q,a},i) => (
            <details key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <summary style={{...SG,fontWeight:600,fontSize:15,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0',userSelect:'none',color:'#F0EEF8',listStyle:'none'}}>
                {q} <span style={{fontSize:20,color:'#8B8A9B',marginLeft:16,flexShrink:0}}>+</span>
              </summary>
              <p style={{paddingBottom:18,fontSize:14,color:'#8B8A9B',lineHeight:1.7}}>{a}</p>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div style={{textAlign:'center'}}>
          <a href="/#upload" style={{display:'inline-flex',alignItems:'center',gap:10,background:G,color:'white',borderRadius:100,padding:'18px 40px',...SG,fontSize:17,fontWeight:700,textDecoration:'none',boxShadow:'0 8px 32px rgba(123,47,255,0.35)'}}>
            🔍 Analyser ma conversation maintenant
          </a>
          <p style={{marginTop:14,fontSize:13,color:'#8B8A9B'}}>Aperçu gratuit · Rapport complet 4,99€</p>
        </div>
      </div>
    </div>
  )
}
