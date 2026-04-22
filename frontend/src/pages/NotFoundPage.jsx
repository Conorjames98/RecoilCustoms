import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(5rem, 20vw, 10rem)', color: 'var(--border2)', lineHeight: 1, marginBottom: 16 }}>404</div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--khaki)', marginBottom: 8 }}>Page Not Found</div>
        <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: 32 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-ghost" style={{ fontSize: '0.62rem', padding: '8px 20px' }}>← Return Home</Link>
      </div>
    </div>
  )
}
