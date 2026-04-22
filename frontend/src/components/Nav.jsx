import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TICKER_ITEMS = ['Custom Lobbies', 'Team Management', 'Live Rounds', 'Join Codes', 'Community Hubs', 'Host Control', 'Custom Lobbies', 'Team Management', 'Live Rounds', 'Join Codes', 'Community Hubs', 'Host Control']

export default function Nav() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() { await signOut(); navigate('/') }
  const avatar = user?.user_metadata?.avatar_url

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-logo">RECOIL<span>.</span></Link>

        <div className="nav-links">
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
      </nav>

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
