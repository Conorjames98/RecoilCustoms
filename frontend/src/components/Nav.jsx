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
            <div className="nav-sep" />
            {avatar && (
              <div style={{ position: 'relative', marginRight: 4 }}>
                <img src={avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border2)', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', border: '1.5px solid var(--bg)' }} />
              </div>
            )}
            <button onClick={handleSignOut} className="btn-ghost" style={{ fontSize: '0.6rem', padding: '7px 14px' }}>
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-red" style={{ fontSize: '0.62rem', padding: '8px 20px' }}>
            Login
          </Link>
        ))}
      </div>
    </nav>
  )
}
