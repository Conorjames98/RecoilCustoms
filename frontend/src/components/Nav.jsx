import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PULL_THRESHOLD = 80

export default function Nav() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [pullProgress, setPullProgress] = useState(0) // 0-1
  const [pulling, setPulling] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const startY = useRef(null)

  useEffect(() => {
    function onTouchStart(e) {
      if (window.scrollY === 0) startY.current = e.touches[0].clientY
    }
    function onTouchMove(e) {
      if (startY.current === null) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 0) {
        setPulling(true)
        setPullProgress(Math.min(delta / PULL_THRESHOLD, 1))
      }
    }
    function onTouchEnd() {
      if (pullProgress >= 1 && !triggered) {
        setTriggered(true)
        setTimeout(() => window.location.reload(), 400)
      } else {
        setPullProgress(0)
        setPulling(false)
      }
      startY.current = null
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullProgress, triggered])

  async function handleSignOut() { await signOut(); navigate('/'); setOpen(false) }
  const avatar = user?.user_metadata?.avatar_url

  return (
    <>
      {/* Pull-to-refresh bar */}
      {pulling && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, background: 'var(--rule)' }}>
          <div style={{
            height: '100%',
            width: `${pullProgress * 100}%`,
            background: triggered ? '#fff' : 'var(--red)',
            transition: triggered ? 'background 0.2s' : 'none',
            boxShadow: `0 0 8px ${triggered ? '#fff' : 'var(--red)'}`,
          }} />
        </div>
      )}

      <nav className="nav">
        <Link to="/" className="nav-logo" onClick={() => setOpen(false)}>RECOIL<span>.</span></Link>

        {/* Desktop links */}
        <div className="nav-links nav-desktop">
          {!loading && (user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/create" className="nav-link">New Community</Link>
              <div className="nav-sep" />
              {avatar && (
                <div style={{ padding: '0 14px', borderLeft: '1px solid var(--rule)', height: 54, display: 'flex', alignItems: 'center' }}>
                  <img src={avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--rule2)' }} />
                </div>
              )}
              <button onClick={handleSignOut} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', borderLeft: '1px solid var(--rule)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-red" style={{ fontSize: '0.6rem', padding: '8px 20px' }}>Login</Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span style={{ display: 'block', width: 22, height: 1.5, background: open ? 'var(--red)' : 'var(--chalk)', transition: 'transform 0.2s, opacity 0.2s', transform: open ? 'translateY(5px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 1.5, background: 'var(--chalk)', opacity: open ? 0 : 1, transition: 'opacity 0.2s', margin: '4px 0' }} />
          <span style={{ display: 'block', width: 22, height: 1.5, background: open ? 'var(--red)' : 'var(--chalk)', transition: 'transform 0.2s, opacity 0.2s', transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{ position: 'fixed', top: 82, left: 0, right: 0, bottom: 0, background: 'var(--black)', zIndex: 199, borderTop: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
          {!loading && (user ? (
            <>
              {avatar && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottom: '1px solid var(--rule)', marginBottom: 24 }}>
                  <img src={avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--rule2)' }} />
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {user?.user_metadata?.full_name || user?.user_metadata?.name}
                  </div>
                </div>
              )}
              <Link to="/dashboard" onClick={() => setOpen(false)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--white)', padding: '16px 0', borderBottom: '1px solid var(--rule)' }}>Dashboard</Link>
              <Link to="/create" onClick={() => setOpen(false)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--white)', padding: '16px 0', borderBottom: '1px solid var(--rule)' }}>New Community</Link>
              <button onClick={handleSignOut} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--red)', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: 'auto' }}>Sign Out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="btn-red" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '16px' }}>Login with Discord</Link>
          ))}
        </div>
      )}
    </>
  )
}
