import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TICKER_ITEMS = ['Custom Lobbies', 'Team Management', 'Live Rounds', 'Join Codes', 'Community Hubs', 'Host Control', 'Custom Lobbies', 'Team Management', 'Live Rounds', 'Join Codes', 'Community Hubs', 'Host Control']

export default function Nav() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleSignOut() { await signOut(); navigate('/'); setOpen(false) }
  const avatar = user?.user_metadata?.avatar_url

  return (
    <>
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

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-inner">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>
    </>
  )
}
