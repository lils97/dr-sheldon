export const metadata = {
  title: 'Que pense Dr Sheldon ?',
  description: 'Dr Sheldon lit ta conversation et dit la vérité — sans filtre.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: '#0A0A0F', color: '#F0EEF8', fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
