import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'

const STATUS_ORDER = ['open', 'filling', 'ready', 'code_live', 'starting', 'in_progress', 'draft', 'ended', 'archived']

export default function CustomsPage() {
  const { slug } = useParams()
  const [sessions, setSessions] = useState([])
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    Promise.all([
      api.get(`/communities/${slug}`),
      api.get(`/communities/${slug}/sessions`)
    ]).then(([c, s]) => {
      setCommunity(c.data)
      setSessions(s.data)
    }).finally(() => setLoading(false))
  }, [slug])

  const active = ['open', 'filling', 'ready', 'code_live', 'starting', 'in_progress']
  const filtered = sessions.filter(s =>
    filter === 'active' ? active.includes(s.status) :
    filter === 'past' ? ['ended', 'archived'].includes(s.status) :
    true
  ).sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

  if (loading) return <div className="spinner" />

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 28 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          <Link to={`/c/${slug}`} style={{ color: 'var(--red2)' }}>{community?.name}</Link>
        </div>
        <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'var(--white)', letterSpacing: '0.04em' }}>Custom Sessions</h1>
      </div>

      <div style={{ display: 'flex', gap: 2, marginBottom: 28 }}>
        {['active', 'all', 'past'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', padding: '7px 16px', border: '1px solid', borderColor: filter === f ? 'var(--red2)' : 'var(--border2)', background: filter === f ? 'var(--red)' : 'transparent', color: filter === f ? '#fff' : 'var(--muted)', cursor: 'pointer' }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: '48px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>No sessions found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {filtered.map(s => (
            <Link key={s.id} to={`/c/${slug}/sessions/${s.id}`}
              style={{ background: 'var(--bg)', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}>
              <div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: 'var(--white)', letterSpacing: '0.1em', marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', display: 'flex', gap: 16 }}>
                  <span>{s.round_count} round{s.round_count !== 1 ? 's' : ''}</span>
                  <span>{s.max_players} max players</span>
                  {s.team_count && <span>{s.team_count} teams</span>}
                </div>
              </div>
              <span className={`status-badge status-${s.status}`}>{s.status.replace('_', ' ')}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
