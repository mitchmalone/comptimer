export default function Home() {
  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>CompTimer</h1>
        <p style={{ fontSize: '1.25rem', color: '#555' }}>
          Competition timing, on any screen. Coming soon.
        </p>
      </div>
    </main>
  )
}
