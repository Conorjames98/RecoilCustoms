import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function CommunityPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [community, setCommunity] = useState(null)
  const [sessions, setSessions] = useState([])
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/communities/${slug}`),
      api.get(`/communities/${slug}/sessions`).catch(() => ({ data: [] }))
    ]).then(([c, s]) => {
      setCommunity(c.data)
      setMembership(c.data.membership || null)
      setSessions(s.data)
    }).catch(() => setError('Community not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  async function handleJoin() {
    setJoining(true)
    try {
      await api.post(`/communities/${slug}/join`)
      setMembership({ role: 'member' })
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to join.')
    } finally { setJoining(false) }
  }

  async function handleLeave() {
    try {
      await api.post(`/communities/${slug}/leave`)
      setMembership(null)
    } catch {}
  }

  if (loading) return <div className="spinner" />
  if (error) return <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>{error}</div>

  const isOwnerOrMod = membership?.role === 'owner' || membership?.role === 'mod'

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 32, marginBottom: 40 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          Community
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: 8 }}>
              {community.name}
            </h1>
            {community.description && (
              <p style={{ fontSize: '0.7rem', color: 'var(--khaki)', lineHeight: 1.8, maxWidth: 600 }}>{community.description}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {isOwnerOrMod && (
              <>
                <Link to={`/c/${slug}/manage`} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '6px 14px' }}>Manage</Link>
                <Link to={`/c/${slug}/sessions/new`} className="btn-red" style={{ fontSize: '0.58rem', padding: '8px 16px' }}>+ Session</Link>
              </>
            )}
            {user && !membership && (
              <button onClick={handleJoin} disabled={joining} className="btn-primary" style={{ fontSize: '0.58rem', padding: '8px 16px' }}>
                {joining ? 'Joining...' : 'Join Community'}
              </button>
            )}
            {membership && membership.role !== 'owner' && (
              <button onClick={handleLeave} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '6px 14px' }}>Leave</button>
            )}
          </div>
        </div>
        {membership && (
          <div style={{ marginTop: 12, fontSize: '0.58rem', letterSpacing: '0.16em', color: 'var(--muted)' }}>
            Member · <span style={{ color: membership.role === 'owner' ? 'var(--red2)' : 'var(--khaki)', textTransform: 'uppercase' }}>{membership.role}</span>
          </div>
        )}
        {error && <p className="error-msg" style={{ marginTop: 10 }}>{error}</p>}
      </div>

      {/* Sessions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Sessions — {sessions.length}
          </div>
          <Link to={`/c/${slug}/customs`} style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'var(--red2)' }}>View All →</Link>
        </div>

        {sessions.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: '40px 28px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>No sessions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {sessions.slice(0, 8).map(s => (
              <Link key={s.id} to={`/c/${slug}/sessions/${s.id}`} style={{ background: 'var(--bg)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}>
                <div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: 'var(--white)', letterSpacing: '0.1em', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{s.round_count} round{s.round_count !== 1 ? 's' : ''} · {s.max_players} players</div>
                </div>
                <span className={`status-badge status-${s.status}`}>{s.status.replace('_', ' ')}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
