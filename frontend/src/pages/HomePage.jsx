import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const FEATURES = [
  { n: '01', label: 'Community Hubs', desc: 'A permanent home for your group. Members, roles, announcements, and full session history in one place.' },
  { n: '02', label: 'Session Control', desc: 'Open signups, build teams, distribute join codes and manage multi-round events in real time.' },
  { n: '03', label: 'Live Rounds', desc: 'Move players, lock teams, post codes and push updates to everyone as the game unfolds.' },
  { n: '04', label: 'Rules Presets', desc: 'Knives only, snipers only, anything goes — configure per round and broadcast instantly.' },
]

function CommunityCard({ c, showRole }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/c/${c.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        border: `1px solid ${hovered ? 'rgba(255,21,41,0.3)' : 'var(--border)'}`,
        padding: '22px',
        transition: 'all 0.2s',
        boxShadow: hovered ? '0 0 24px rgba(255,21,41,0.08)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: `0 ${hovered ? '28px' : '20px'} ${hovered ? '28px' : '20px'} 0`,
        borderColor: `transparent ${hovered ? 'var(--red)' : 'var(--border2)'} transparent transparent`,
        transition: 'all 0.2s',
      }} />

      {c.banner && (
        <div style={{ height: 52, background: `url(${c.banner}) center/cover`, marginBottom: 14, border: '1px solid var(--border)' }} />
      )}
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: '1.1rem', letterSpacing: '0.08em',
        color: 'var(--text)', marginBottom: 6,
      }}>{c.name}</div>
      {showRole && (
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--red)' }}>
          {c.role}
        </div>
      )}
      {!showRole && c.description && (
        <p style={{ fontSize: '0.76rem', color: 'var(--dim)', lineHeight: 1.7, fontWeight: 300 }}>
          {c.description.slice(0, 80)}{c.description.length > 80 ? '…' : ''}
        </p>
      )}
    </Link>
  )
}

function FeatureCard({ n, label, desc, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        border: `1px solid ${hovered ? 'rgba(255,21,41,0.25)' : 'var(--border)'}`,
        padding: '32px 28px',
        transition: 'all 0.25s',
        boxShadow: hovered ? '0 0 32px rgba(255,21,41,0.07), inset 0 1px 0 rgba(255,21,41,0.15)' : 'none',
        animation: `fade-up 0.6s ease both`,
        animationDelay: `${delay}ms`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: '3rem', lineHeight: 1,
        color: hovered ? 'var(--red)' : 'var(--border2)',
        marginBottom: 16,
        transition: 'color 0.25s',
        letterSpacing: '0.04em',
      }}>{n}</div>
      <div style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: '1.3rem', letterSpacing: '0.1em',
        color: 'var(--text)', marginBottom: 12,
      }}>{label}</div>
      <p style={{ fontSize: '0.78rem', color: 'var(--dim)', lineHeight: 1.8, fontWeight: 300 }}>{desc}</p>

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '2px',
        width: hovered ? '100%' : '0%',
        background: 'var(--red)',
        transition: 'width 0.3s ease',
        boxShadow: 'var(--glow-sm)',
      }} />
    </div>
  )
}

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
      {/* ── Hero ── */}
      <section style={{
        minHeight: 'calc(100vh - 58px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,21,41,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,21,41,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
        }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, height: 400,
          background: 'radial-gradient(ellipse, rgba(255,21,41,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,21,41,0.4), transparent)',
          animation: 'scan-line 6s linear infinite',
          pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 760 }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            marginBottom: 32, padding: '7px 18px',
            border: '1px solid var(--border2)',
            background: 'var(--surface)',
            animation: 'fade-up 0.5s ease both',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: 'var(--red)',
              animation: 'dot-pulse 2s ease infinite',
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--dim)',
            }}>
              Custom Game Platform
            </span>
          </div>

          {/* Main title */}
          <h1 style={{
            fontFamily: "'Black Ops One', cursive",
            fontSize: 'clamp(4rem, 14vw, 9rem)',
            lineHeight: 0.88,
            letterSpacing: '0.04em',
            color: 'var(--text)',
            marginBottom: 32,
            animation: 'fade-up 0.5s 0.1s ease both',
          }}>
            RECOIL<span style={{ color: 'var(--red)', textShadow: '0 0 40px rgba(255,21,41,0.5)' }}>.</span>
          </h1>

          {/* Tagline */}
          <p style={{
            fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
            color: 'var(--dim)', lineHeight: 1.8,
            maxWidth: 440, margin: '0 auto 52px',
            fontWeight: 300,
            animation: 'fade-up 0.5s 0.2s ease both',
          }}>
            Run your own Warzone custom lobbies. Manage teams, track rounds, distribute join codes.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fade-up 0.5s 0.3s ease both',
          }}>
            {!loading && (user
              ? <Link to="/dashboard" className="btn-primary">Dashboard →</Link>
              : <>
                  <Link to="/login" className="btn-red">Get Started →</Link>
                  <Link to="/login" className="btn-ghost">Sign In</Link>
                </>
            )}
          </div>

          {/* Scroll hint */}
          <div style={{
            marginTop: 72,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            animation: 'fade-up 0.5s 0.5s ease both',
          }}>
            <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, var(--red), transparent)' }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--faint)' }}>Scroll</span>
          </div>
        </div>
      </section>

      {/* ── My Communities ── */}
      {user && myCommunities.length > 0 && (
        <section style={{ padding: '72px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <div className="section-label">Your Communities</div>
                <h2 className="section-h2" style={{ marginBottom: 0 }}>Jump Back In</h2>
              </div>
              <Link to="/dashboard" style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--red)', transition: 'text-shadow 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.textShadow = 'var(--glow-sm)'}
                onMouseLeave={e => e.currentTarget.style.textShadow = 'none'}
              >
                View All →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {myCommunities.slice(0, 6).map(c => <CommunityCard key={c.id} c={c} showRole />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured ── */}
      {featured.length > 0 && (
        <section style={{ padding: '72px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div className="section-label">Discover</div>
            <h2 className="section-h2">Featured Communities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {featured.map(c => <CommunityCard key={c.id} c={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section style={{ padding: '80px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label">Platform</div>
              <h2 className="section-h2" style={{ marginBottom: 0 }}>Built for Custom Lobbies</h2>
            </div>
            <div style={{ width: 120, height: 1, background: 'linear-gradient(to right, var(--red), transparent)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.n} {...f} delay={i * 80} />)}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { v: 'Real-Time', l: 'Round Management' },
            { v: 'Multi-Round', l: 'Session Support' },
            { v: 'Discord', l: 'Auth Integration' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '36px 24px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: '1.8rem', letterSpacing: '0.06em',
                color: 'var(--text)', marginBottom: 4,
              }}>{s.v}</div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--dim)',
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section style={{ padding: '120px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600, height: 300,
            background: 'radial-gradient(ellipse, rgba(255,21,41,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Ready?</div>
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              letterSpacing: '0.06em', lineHeight: 1,
              color: 'var(--text)', marginBottom: 20,
            }}>
              Run Your Lobby.<br />
              <span style={{ color: 'var(--red)', textShadow: '0 0 40px rgba(255,21,41,0.4)' }}>Own the Game.</span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--dim)', marginBottom: 44, lineHeight: 1.8, fontWeight: 300 }}>
              Sign in with Discord and create your community in minutes.
            </p>
            <Link to="/login" className="btn-red" style={{ fontSize: '0.72rem', padding: '14px 36px' }}>
              Sign In with Discord →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
