import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const TICKER_ITEMS = ['Custom Lobbies', 'Team Management', 'Live Rounds', 'Join Codes', 'Community Hubs', 'Host Control', 'Custom Lobbies', 'Team Management', 'Live Rounds', 'Join Codes', 'Community Hubs', 'Host Control']

const FEATURES = [
  { n: '01', label: 'Community Hubs', desc: 'A permanent home for your group. Members, roles, announcements, full history.' },
  { n: '02', label: 'Session Control', desc: 'Open signups, fill teams, distribute join codes and manage events live.' },
  { n: '03', label: 'Live Rounds', desc: 'Move players, lock teams, post codes and push updates as the game unfolds.' },
  { n: '04', label: 'Rules Presets', desc: 'Per-round rule configurations broadcast instantly to all players.' },
]

function CommunityCard({ c, showRole }) {
  return (
    <Link to={`/c/${c.slug}`}
      style={{ display: 'block', background: 'var(--ink)', borderTop: '2px solid var(--rule)', padding: '20px 22px', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderTopColor = 'var(--red)'}
      onMouseLeave={e => e.currentTarget.style.borderTopColor = 'var(--rule)'}
    >
      {c.banner && <div style={{ height: 48, background: `url(${c.banner}) center/cover`, marginBottom: 14, opacity: 0.8 }} />}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--white)', marginBottom: 5 }}>{c.name}</div>
      {showRole && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.56rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--red)' }}>{c.role}</div>}
      {!showRole && c.description && <p style={{ fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.7 }}>{c.description.slice(0, 80)}{c.description.length > 80 ? '…' : ''}</p>}
    </Link>
  )
}

const WORDS = ['RECOIL', 'YOUR\nCOMMUNITY', 'YOUR\nCUSTOMS']

function useTypewriter(words) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [typing, setTyping] = useState(true)
  const timeout = useRef(null)

  useEffect(() => {
    const word = words[wordIdx]
    if (typing) {
      if (display.length < word.length) {
        timeout.current = setTimeout(() => setDisplay(word.slice(0, display.length + 1)), 80)
      } else {
        timeout.current = setTimeout(() => setTyping(false), 1800)
      }
    } else {
      if (display.length > 0) {
        timeout.current = setTimeout(() => setDisplay(display.slice(0, -1)), 45)
      } else {
        setWordIdx(i => (i + 1) % words.length)
        setTyping(true)
      }
    }
    return () => clearTimeout(timeout.current)
  }, [display, typing, wordIdx])

  return display
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const [myCommunities, setMyCommunities] = useState([])
  const [featured, setFeatured] = useState([])
  const heroText = useTypewriter(WORDS)

  useEffect(() => {
    api.get('/communities').then(r => setFeatured(r.data.filter(c => c.visibility === 'featured' || c.featured))).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) api.get('/users/me/communities').then(r => setMyCommunities(r.data.map(m => ({ ...m.communities, role: m.role })).filter(Boolean))).catch(() => {})
  }, [user])

  return (
    <div>
      {/* ── Ticker ── */}
      <div className="ticker">
        <div className="ticker-inner">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ borderBottom: '1px solid var(--rule)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -20, left: -20, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(8rem, 20vw, 22rem)', lineHeight: 0.85, color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.04)', userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap' }}>RECOIL</div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }} className="page-section">
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 82px)', alignItems: 'center' }}>

            <div className="hero-left" style={{ paddingTop: 80, paddingBottom: 80, paddingRight: 60, borderRight: '1px solid var(--rule)', animation: 'reveal 0.6s ease both' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>RECOIL.GG</span>
                <span style={{ color: 'var(--rule2)' }}>—</span>
                <span style={{ color: 'var(--muted)' }}>Custom Lobbies</span>
              </div>
              <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(3rem, 7vw, 6.5rem)', lineHeight: 0.9, letterSpacing: '0.03em', color: 'var(--white)', marginBottom: 32, minHeight: '3.6em', whiteSpace: 'pre-line' }}>
                {heroText}<span style={{ color: 'var(--red)', animation: 'blink 1s step-end infinite' }}>.</span>
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.9, marginBottom: 48, maxWidth: 400, fontWeight: 300 }}>
                The custom lobby platform for serious Warzone communities. Build your group, run events, manage teams.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {!loading && (user
                  ? <Link to="/dashboard" className="btn-primary">Dashboard →</Link>
                  : <>
                      <Link to="/login" className="btn-red">Get Started →</Link>
                      <Link to="/login" className="btn-ghost">Sign In</Link>
                    </>
                )}
              </div>
            </div>

            <div className="hero-right" style={{ paddingTop: 80, paddingBottom: 80, paddingLeft: 60, animation: 'reveal 0.6s 0.15s ease both' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 32 }}>Platform Overview</div>
              {[
                { label: 'Platform', value: 'Warzone Custom Lobbies' },
                { label: 'Access', value: 'Discord Auth' },
                { label: 'Session Types', value: 'Multi-Round Events' },
                { label: 'Team Control', value: 'Real-Time' },
                { label: 'Status', value: 'Operational', red: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: '1px solid var(--rule)', gap: 20 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: row.red ? 'var(--red)' : 'var(--white)', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', color: 'var(--red)' }}>▶</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', color: 'var(--muted)' }}>Ready for deployment</span>
                <span style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--muted)', animation: 'blink 1s step-end infinite', marginLeft: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── My Communities ── */}
      {user && myCommunities.length > 0 && (
        <section style={{ borderBottom: '1px solid var(--rule)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }} className="page-section">
            <div className="sidebar-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
              <div className="sidebar-label" style={{ borderRight: '1px solid var(--rule)', padding: '48px 32px 48px 40px' }}>
                <div className="section-label">Your</div>
                <h2 className="section-h2" style={{ marginBottom: 0 }}>Communities</h2>
                <Link to="/dashboard" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginTop: 20, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >All →</Link>
              </div>
              <div className="sidebar-content" style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, alignContent: 'start' }}>
                {myCommunities.slice(0, 6).map(c => <CommunityCard key={c.id} c={c} showRole />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured ── */}
      {featured.length > 0 && (
        <section style={{ borderBottom: '1px solid var(--rule)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }} className="page-section">
            <div className="sidebar-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
              <div className="sidebar-label" style={{ borderRight: '1px solid var(--rule)', padding: '48px 32px 48px 40px' }}>
                <div className="section-label">Discover</div>
                <h2 className="section-h2" style={{ marginBottom: 0 }}>Featured</h2>
              </div>
              <div className="sidebar-content" style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, alignContent: 'start' }}>
                {featured.map(c => <CommunityCard key={c.id} c={c} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section style={{ borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="page-section">
          <div style={{ padding: '48px 40px 32px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="section-label">Platform</div>
              <h2 className="section-h2" style={{ marginBottom: 0 }}>Built for Custom Lobbies</h2>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>04 FEATURES</div>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {FEATURES.map((f, i) => (
              <div key={f.n}
                style={{ padding: '36px 28px', borderRight: i < 3 ? '1px solid var(--rule)' : 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '4rem', lineHeight: 1, color: 'var(--rule2)', marginBottom: 20 }}>{f.n}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--white)', marginBottom: 10 }}>{f.label}</div>
                <p style={{ fontSize: '0.76rem', color: 'var(--muted)', lineHeight: 1.8, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ borderBottom: '1px solid var(--rule)', background: 'var(--ink)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="page-section">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { v: 'Real-Time', l: 'Round Management' },
              { v: 'Multi-Round', l: 'Session Support' },
              { v: 'Discord', l: 'Auth Integration' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '36px 24px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--rule)' : 'none' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.8rem', letterSpacing: '0.04em', color: 'var(--white)', marginBottom: 4 }}>{s.v}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.56rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section style={{ borderBottom: '1px solid var(--rule)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }} className="page-section">
            <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>
              <div className="cta-left" style={{ padding: '80px 60px 80px 40px', borderRight: '1px solid var(--rule)' }}>
                <div className="section-label">Ready?</div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 5rem)', textTransform: 'uppercase', lineHeight: 0.9, color: 'var(--white)', marginBottom: 24 }}>
                  Run Your<br /><span style={{ color: 'var(--red)' }}>Lobby.</span>
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.9, maxWidth: 340, fontWeight: 300 }}>Sign in with Discord and create your community in minutes.</p>
              </div>
              <div className="cta-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 60px' }}>
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <Link to="/login" className="btn-red" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '0.7rem' }}>Sign In with Discord →</Link>
                  <div style={{ marginTop: 16, fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.1em', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.8 }}>No account required — Discord auth only.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
