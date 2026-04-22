import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

function CommunityCard({ c, showRole }) {
  return (
    <Link
      to={`/c/${c.slug}`}
      style={{ display: 'block', background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px', transition: 'border-color 0.15s, background 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface2)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
    >
      {c.banner && (
        <div style={{ height: 56, background: `url(${c.banner}) center/cover`, marginBottom: 16, border: '1px solid var(--border)' }} />
      )}
      <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', letterSpacing: '0.08em', marginBottom: 6 }}>
        {c.name}
      </div>
      {showRole && (
        <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{c.role}</div>
      )}
      {!showRole && c.description && (
        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.7 }}>
          {c.description.slice(0, 90)}{c.description.length > 90 ? '…' : ''}
        </p>
      )}
    </Link>
  )
}

const FEATURES = [
  { label: 'Community Hubs', desc: 'A permanent home for your group — members, roles, announcements, and full session history.' },
  { label: 'Session Control', desc: 'Open signups, fill teams, distribute join codes and manage multi-round events in real time.' },
  { label: 'Live Rounds', desc: 'Move players, lock teams, post codes and push updates as the game unfolds.' },
  { label: 'Rules Presets', desc: 'Knives only, snipers only, anything goes — configure rules per round and broadcast them instantly.' },
]

export default function HomePage() {
  const { user, loading } = useAuth()
  const [myCommunities, setMyCommunities] = useState([])
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    api.get('/communities').then(r => {
      setFeatured(r.data.filter(c => c.visibility === 'featured' || c.featured))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      api.get('/users/me/communities').then(r => {
        setMyCommunities(r.data.map(m => ({ ...m.communities, role: m.role })).filter(Boolean))
      }).catch(() => {})
    }
  }, [user])

  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        {/* Background accent */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(232,25,44,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', maxWidth: 680, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, padding: '6px 14px', border: '1px solid var(--border2)', background: 'var(--surface)' }}>
            <span style={{ width: 6, height: 6, background: 'var(--red)', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Custom Game Communities
            </span>
          </div>

          <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(3.5rem, 12vw, 7rem)', color: 'var(--text)', lineHeight: 0.9, letterSpacing: '0.04em', marginBottom: 28 }}>
            RECOIL<span style={{ color: 'var(--red)' }}>.</span>
          </h1>

          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: 48, maxWidth: 460, margin: '0 auto 48px', fontWeight: 300 }}>
            Run your own Warzone custom lobbies. Manage teams, track rounds, distribute join codes — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!loading && (user
              ? <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
              : <>
                  <Link to="/login" className="btn-red">Get Started</Link>
                  <Link to="/login" className="btn-ghost">Sign In</Link>
                </>
            )}
          </div>
        </div>
      </section>

      {/* My Communities */}
      {user && myCommunities.length > 0 && (
        <section style={{ padding: '64px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <div className="section-label">Your Communities</div>
                <h2 className="section-h2" style={{ marginBottom: 0 }}>Jump Back In</h2>
              </div>
              <Link to="/dashboard" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--red)', textTransform: 'uppercase' }}>
                View All →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {myCommunities.slice(0, 6).map(c => <CommunityCard key={c.id} c={c} showRole />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section style={{ padding: '64px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="section-label">Discover</div>
            <h2 className="section-h2">Featured Communities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {featured.map(c => <CommunityCard key={c.id} c={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: '80px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Platform</div>
          <h2 className="section-h2">Built for Custom Lobbies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {FEATURES.map((f, i) => (
              <div key={f.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '28px 24px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: 12 }}>
                  0{i + 1}
                </div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: 10 }}>
                  {f.label}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.8, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '100px 40px', textAlign: 'center' }}>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'var(--text)', marginBottom: 16, letterSpacing: '0.03em' }}>
              Ready to Run Your Lobby?
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 36, lineHeight: 1.8, fontWeight: 300 }}>
              Sign in with Discord and create your community in minutes.
            </p>
            <Link to="/login" className="btn-red">Sign In with Discord</Link>
          </div>
        </section>
      )}
    </div>
  )
}
