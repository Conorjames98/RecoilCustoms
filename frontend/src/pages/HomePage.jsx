import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function HomePage() {
  const { user, loading } = useAuth()
  const [myCommunities, setMyCommunities] = useState([])
  const [featured, setFeatured] = useState([])
  const [promoted, setPromoted] = useState([])

  useEffect(() => {
    api.get('/communities').then(r => {
      setFeatured(r.data.filter(c => c.visibility === 'featured' || c.featured))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      api.get('/users/me/communities').then(r => {
        setMyCommunities(r.data.map(m => ({ ...m.communities, role: m.role })))
      }).catch(() => {})
    }
  }, [user])

  const activeMine = myCommunities.filter(c => c)

  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight: 'calc(100vh - 52px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px)', opacity: 0.3 }} />
        <div style={{ textAlign: 'center', maxWidth: 700, position: 'relative' }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 20 }}>
            // Custom Game Communities
          </div>
          <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(3rem, 10vw, 6rem)', color: 'var(--white)', lineHeight: 1, letterSpacing: '0.04em', marginBottom: 24 }}>
            RECOIL<span style={{ color: 'var(--red2)' }}>.</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--khaki)', lineHeight: 2, letterSpacing: '0.08em', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Run your own Warzone custom lobbies. Manage teams, track rounds, distribute join codes — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!loading && (user
              ? <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
              : <Link to="/login" className="btn-red">Get Started</Link>
            )}
          </div>
        </div>
      </section>

      {/* Joined Communities */}
      {user && activeMine.length > 0 && (
        <section style={{ padding: '60px 40px', borderBottom: '1px solid var(--border)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
            Your Communities
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-h2" style={{ marginBottom: 0 }}>Jump Back In</h2>
            <Link to="/dashboard" style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'var(--red2)' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {activeMine.slice(0, 6).map(c => (
              <Link key={c.id} to={`/c/${c.slug}`} style={{ background: 'var(--bg)', padding: '24px 24px', display: 'block', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}>
                {c.banner && <div style={{ height: 60, background: `url(${c.banner}) center/cover`, marginBottom: 14, border: '1px solid var(--border2)' }} />}
                <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: 'var(--white)', letterSpacing: '0.1em', marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{c.role}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Communities */}
      {featured.length > 0 && (
        <section style={{ padding: '60px 40px', borderBottom: '1px solid var(--border)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
            Discover
          </div>
          <h2 className="section-h2">Featured Communities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {featured.map(c => (
              <Link key={c.id} to={`/c/${c.slug}`} style={{ background: 'var(--bg)', padding: '24px 24px', display: 'block', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}>
                {c.banner && <div style={{ height: 60, background: `url(${c.banner}) center/cover`, marginBottom: 14, border: '1px solid var(--border2)' }} />}
                <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: 'var(--white)', letterSpacing: '0.1em', marginBottom: 6 }}>{c.name}</div>
                {c.description && <p style={{ fontSize: '0.62rem', color: 'var(--khaki)', lineHeight: 1.7, marginBottom: 0 }}>{c.description.slice(0, 100)}{c.description.length > 100 ? '...' : ''}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: '80px 40px', borderBottom: '1px solid var(--border)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          Platform Features
        </div>
        <h2 className="section-h2">Built for Custom Lobbies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            { title: 'Community Hubs', desc: 'Create a permanent home for your group. Invite members, post announcements, manage roles.' },
            { title: 'Session Control', desc: 'Open slots, assign teams, distribute join codes. Run multi-round events with full host control.' },
            { title: 'Live Rounds', desc: 'Real-time round management. Move players between teams, lock slots, push updates to everyone.' },
            { title: 'Rules Presets', desc: 'Knives Only, Snipers Only, Anything Goes and more — configure rules per round and communicate them instantly.' },
          ].map(f => (
            <div key={f.title} style={{ background: 'var(--bg)', padding: '32px 28px' }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 10 }}>{f.title}</div>
              <p style={{ fontSize: '0.68rem', color: 'var(--khaki)', lineHeight: 1.9 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--white)', marginBottom: 16 }}>
          Ready to Run Your Lobby?
        </h2>
        <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: 32, letterSpacing: '0.1em' }}>
          Sign in with Discord and create your community in minutes.
        </p>
        {!user && <Link to="/login" className="btn-red">Sign In with Discord</Link>}
      </section>
    </div>
  )
}
