import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() { await signOut(); navigate('/') }

  const avatar = user?.user_metadata?.avatar_url

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">RECOIL<span>.</span></Link>

      <div className="nav-links">
        {!loading && (user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/create" className="nav-link">New Community</Link>
            <div style={{ width: 1, height: 20, background: 'var(--border2)', margin: '0 6px' }} />
            {avatar && (
              <img src={avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border2)' }} />
            )}
            <button onClick={handleSignOut} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '6px 14px' }}>
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-red" style={{ fontSize: '0.65rem', padding: '8px 18px' }}>
            Login
          </Link>
        ))}
      </div>
    </nav>
  )
}
