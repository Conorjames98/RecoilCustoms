import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() { await signOut(); navigate('/') }

  const avatar = user?.user_metadata?.avatar_url
  const name   = user?.user_metadata?.full_name || user?.user_metadata?.name

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">RECOIL<span>.</span></Link>
      <div className="nav-links">
        {!loading && (user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/create"    className="nav-link">+ Community</Link>
            {avatar && <img src={avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border2)', marginLeft: 4 }} />}
            <button onClick={handleSignOut} className="btn-ghost" style={{ fontSize: '0.6rem', padding: '5px 12px' }}>Sign Out</button>
          </>
        ) : (
          <Link to="/login" className="btn-red" style={{ fontSize: '0.6rem', padding: '6px 16px' }}>Login</Link>
        ))}
      </div>
    </nav>
  )
}
