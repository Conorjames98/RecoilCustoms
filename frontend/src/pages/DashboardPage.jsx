import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function DashboardPage() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/me/communities')
      .then(r => setCommunities(r.data.map(m => ({ ...m.communities, role: m.role }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Operator'

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          Dashboard
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Welcome, {name}
          </h1>
          <Link to="/create" className="btn-red" style={{ fontSize: '0.62rem', padding: '8px 20px' }}>+ New Community</Link>
        </div>
      </div>

      <div style={{ marginBottom: 20, fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        Your Communities — {communities.length}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : communities.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem', letterSpacing: '0.1em', color: 'var(--khaki)', marginBottom: 12 }}>No Communities Yet</div>
          <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: 24 }}>Create your first community to start running custom lobbies.</p>
          <Link to="/create" className="btn-primary">Create Community</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {communities.map(c => (
            <div key={c.id} style={{ background: 'var(--bg)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '1rem', letterSpacing: '0.1em', color: 'var(--white)', marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.14em' }}>
                  /{c.slug} &nbsp;·&nbsp;
                  <span style={{ color: c.role === 'owner' ? 'var(--red2)' : 'var(--khaki)', textTransform: 'uppercase' }}>{c.role}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link to={`/c/${c.slug}`} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '6px 14px' }}>View</Link>
                {(c.role === 'owner' || c.role === 'mod') && (
                  <Link to={`/c/${c.slug}/manage`} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '6px 14px' }}>Manage</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
