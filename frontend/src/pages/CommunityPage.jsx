import { useEffect, useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

function Countdown({ scheduledAt }) {
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0, done: false })
  useEffect(() => {
    function calc() {
      const diff = new Date(scheduledAt) - Date.now()
      if (diff <= 0) return setParts({ done: true })
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        done: false,
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [scheduledAt])

  if (parts.done) return <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--red)', fontSize: '0.8rem', letterSpacing: '0.2em' }}>STARTING NOW</span>

  const show = parts.d > 0
    ? [{ v: parts.d, l: 'DAYS' }, { v: parts.h, l: 'HRS' }, { v: parts.m, l: 'MIN' }]
    : parts.h > 0
    ? [{ v: parts.h, l: 'HRS' }, { v: parts.m, l: 'MIN' }, { v: parts.s, l: 'SEC' }]
    : [{ v: parts.m, l: 'MIN' }, { v: parts.s, l: 'SEC' }]

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {show.map(({ v, l }, i) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Black Ops One', cursive",
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              color: '#fff',
              lineHeight: 1,
              textShadow: '0 0 20px rgba(220,38,38,0.6)',
              minWidth: 48,
              textAlign: 'center',
            }}>{String(v).padStart(2, '0')}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
          </div>
          {i < show.length - 1 && (
            <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: '1.4rem', color: 'var(--red)', opacity: 0.7, marginBottom: 8 }}>:</div>
          )}
        </div>
      ))}
    </div>
  )
}

function PulsingDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff',
        animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff' }} />
    </span>
  )
}

function BotInstallButton({ slug, installed }) {
  const [loading, setLoading] = useState(false)

  async function handleInstall() {
    setLoading(true)
    try {
      const { data } = await api.get(`/discord/install/${slug}`)
      window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  if (installed) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.56rem',
      letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)',
      padding: '5px 12px', border: '1px solid rgba(255,255,255,0.2)',
      textTransform: 'uppercase',
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.88 19.88 0 0 0 5.993 3.03.079.079 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
      Bot Installed
    </div>
  )

  return (
    <button onClick={handleInstall} disabled={loading} style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.56rem',
      letterSpacing: '0.12em', padding: '5px 12px',
      border: '1px solid rgba(255,255,255,0.4)', color: '#fff',
      background: 'none', textTransform: 'uppercase', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.6 : 1,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.88 19.88 0 0 0 5.993 3.03.079.079 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
      {loading ? 'Redirecting...' : 'Add Discord Bot'}
    </button>
  )
}

export default function CommunityPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [sessions, setSessions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [members, setMembers] = useState([])
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/communities/${slug}`),
      api.get(`/communities/${slug}/sessions`).catch(() => ({ data: [] })),
      api.get(`/communities/${slug}/announcements`).catch(() => ({ data: [] })),
      api.get(`/communities/${slug}/members`).catch(() => ({ data: [] })),
    ]).then(([c, s, a, m]) => {
      setCommunity(c.data)
      setMembership(c.data.membership || null)
      setSessions(s.data)
      setAnnouncements(a.data)
      setMembers(m.data.map(x => ({ ...x.users, role: x.role })))
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

  const isOwnerOrMod = membership?.role === 'owner' || membership?.role === 'moderator'
  const liveSession = sessions.find(s => ['code_live','starting','in_progress'].includes(s.status))
  const upcomingSession = sessions.find(s => s.status === 'open' || s.status === 'filling' || s.status === 'ready')
  const mods = members.filter(m => m.role === 'owner' || m.role === 'moderator')
  const pastSessions = sessions.filter(s => s.status === 'ended' || s.status === 'archived')
  const activeSessions = sessions.filter(s => !['ended','archived'].includes(s.status))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #080808)' }}>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.85; }
          94% { opacity: 1; }
          96% { opacity: 0.9; }
          97% { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(220,38,38,0.3), inset 0 0 12px rgba(220,38,38,0.05); }
          50% { box-shadow: 0 0 28px rgba(220,38,38,0.6), inset 0 0 24px rgba(220,38,38,0.1); }
        }
        .community-session-card:hover .session-title { color: #fff !important; }
        .community-session-card:hover { background: #141416 !important; }
        .community-session-card:hover .session-arrow { opacity: 1 !important; transform: translateX(0) !important; }
        .announcement-card { transition: border-color 0.2s; }
        .announcement-card:hover { border-color: rgba(220,38,38,0.3) !important; }
        .past-session-row:hover { opacity: 1 !important; background: #111 !important; }
        .staff-card:hover { background: #111 !important; border-color: rgba(220,38,38,0.25) !important; }
        .live-banner { animation: glowPulse 2s ease-in-out infinite; }
        .community-hero-title { animation: flicker 8s infinite; }
        .fade-in { animation: slideUp 0.5s ease forwards; }
        .fade-in-2 { animation: slideUp 0.5s 0.1s ease both; }
        .fade-in-3 { animation: slideUp 0.5s 0.2s ease both; }
      `}</style>

      {/* Sticky Nav */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        height: 98, background: 'rgba(180,20,20,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'flex-end', padding: '0 24px 14px',
        justifyContent: 'space-between', gap: 16,
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'rgba(255,255,255,0.85)',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 500,
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isOwnerOrMod && (
            <>
              <Link to={`/c/${slug}/manage`} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 500, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', background: 'none', borderRadius: 'var(--radius-sm)' }}>Manage</Link>
              <Link to={`/c/${slug}/sessions/new`} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 700, padding: '6px 14px', border: '1px solid #fff', color: '#b41414', background: '#fff', borderRadius: 'var(--radius-sm)' }}>+ Session</Link>
            </>
          )}
          {user && !membership && (
            <button onClick={handleJoin} disabled={joining} className="btn-primary" style={{ fontSize: '0.56rem', padding: '6px 14px' }}>
              {joining ? 'Joining...' : 'Join'}
            </button>
          )}
          {membership && membership.role !== 'owner' && (
            <button onClick={handleLeave} className="btn-ghost" style={{ fontSize: '0.56rem', padding: '5px 12px' }}>Leave</button>
          )}
        </div>
      </div>
      <div style={{ height: 148 }} />

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {community.banner ? (
          <div style={{ height: 320, position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `url(${community.banner}) center/cover`,
              filter: 'brightness(0.45) saturate(0.8)',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 30%, #080808 100%)',
            }} />
            {/* Scanline overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 36px' }}>
              <HeroContent community={community} membership={membership} members={members} />
            </div>
          </div>
        ) : (
          <div style={{
            padding: '32px 32px 36px',
            background: 'linear-gradient(135deg, #0e0e10 0%, #080808 60%)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Grid bg */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <HeroContent community={community} membership={membership} members={members} />
          </div>
        )}
      </div>

      {membership && (
        <div style={{ padding: '0 32px', marginTop: -8, marginBottom: 4 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
            Member ·{' '}
            <span style={{ color: membership.role === 'owner' ? 'var(--red2, #dc2626)' : 'rgba(255,255,255,0.5)' }}>
              {membership.role}
            </span>
          </span>
        </div>
      )}
      {error && <p className="error-msg" style={{ margin: '0 32px 16px' }}>{error}</p>}

      {/* Live Banner */}
      {liveSession && (
        <div style={{ padding: '20px 32px 0' }} className="fade-in">
          <Link to={`/c/${slug}/sessions/${liveSession.id}`} className="live-banner" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(220,38,38,0.12)',
            border: '1px solid rgba(220,38,38,0.5)',
            borderRadius: 'var(--radius)',
            padding: '20px 28px',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <PulsingDot />
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Live Now</div>
                <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: '1.1rem', color: '#fff', letterSpacing: '0.06em' }}>{liveSession.title}</div>
              </div>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
              Enter Session
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </Link>
        </div>
      )}

      {/* Upcoming Countdown */}
      {!liveSession && upcomingSession?.scheduled_at && (
        <div style={{ padding: '20px 32px 0' }} className="fade-in">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius)',
            padding: '20px 28px',
            flexWrap: 'wrap', gap: 16,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'var(--red, #dc2626)' }} />
            <div style={{ paddingLeft: 8 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Next Session</div>
              <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: '1rem', color: 'var(--white)', letterSpacing: '0.06em' }}>{upcomingSession.title}</div>
            </div>
            <Countdown scheduledAt={upcomingSession.scheduled_at} />
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 80px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}
        className="community-main-grid">
        <style>{`
          @media (max-width: 768px) {
            .community-main-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Left column */}
        <div style={{ display: 'grid', gap: 28 }}>

          {/* Announcements */}
          {announcements.length > 0 && (
            <section className="fade-in-2">
              <SectionLabel>Announcements</SectionLabel>
              <div style={{ display: 'grid', gap: 8 }}>
                {announcements.slice(0, 5).map((a, i) => (
                  <div key={a.id} className="announcement-card" style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: a.pinned ? '3px solid var(--red)' : '3px solid transparent',
                    borderRadius: 'var(--radius)',
                    padding: '18px 22px',
                    animation: `slideUp 0.4s ${i * 0.05}s ease both`,
                  }}>
                    {a.pinned && (
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.46rem', letterSpacing: '0.22em', color: 'var(--red, #dc2626)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Pinned
                      </div>
                    )}
                    {a.title && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.04em', marginBottom: 6 }}>{a.title}</div>}
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{a.content || a.body}</p>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.48rem', color: 'rgba(255,255,255,0.2)', marginTop: 10, letterSpacing: '0.1em' }}>
                      {a.users?.username} · {new Date(a.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Active Sessions */}
          <section className="fade-in-3">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <SectionLabel>Custom Games</SectionLabel>
              <Link to={`/c/${slug}/customs`} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >View All →</Link>
            </div>

            {activeSessions.length === 0 ? (
              <div style={{
                border: '1px dashed rgba(255,255,255,0.08)',
                padding: '40px 24px',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>No Active Sessions</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {activeSessions.slice(0, 6).map((s, i) => (
                  <Link key={s.id} to={`/c/${slug}/sessions/${s.id}`} className="community-session-card" style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 'var(--radius)',
                    padding: '18px 22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    flexWrap: 'wrap',
                    transition: 'background 0.2s',
                    animation: `slideUp 0.4s ${i * 0.06}s ease both`,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: statusColor(s.status), opacity: 0.7 }} />
                    <div style={{ paddingLeft: 8 }}>
                      <div className="session-title" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em', marginBottom: 4, transition: 'color 0.2s' }}>{s.title}</div>
                      {s.scheduled_at && (
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                          {new Date(s.scheduled_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`status-badge status-${s.status}`}>{s.status.replace('_', ' ')}</span>
                      <svg className="session-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s' }}><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <section>
              <SectionLabel muted>Results / History</SectionLabel>
              <div style={{ display: 'grid', gap: 6 }}>
                {pastSessions.slice(0, 5).map(s => (
                  <Link key={s.id} to={`/c/${slug}/sessions/${s.id}`} className="past-session-row" style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    opacity: 0.5,
                    transition: 'opacity 0.2s, background 0.2s',
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em' }}>{s.title}</div>
                    <span className="status-badge status-ended">ended</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'grid', gap: 16, position: 'sticky', top: 80 }}>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatBox label="Members" value={members.length} />
            <StatBox label="Sessions" value={sessions.length} />
          </div>

          {/* Tags */}
          {community.description?.includes('Tags:') && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {community.description.split('\n').find(l => l.startsWith('Tags:'))?.replace('Tags: ', '').split(', ').map(tag => (
                  <span key={tag} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,45,68,0.1)', border: '1px solid rgba(255,45,68,0.25)', color: 'rgba(255,255,255,0.7)' }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Community Rules */}
          {community.rules && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Rules</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {community.rules.split('\n').filter(r => r.trim()).map((rule, i) => (
                  <span key={i} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem',
                    padding: '5px 12px', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontFamily: "'Black Ops One', cursive", fontSize: '0.55rem', color: 'var(--red)' }}>{i + 1}</span>
                    {rule.replace(/^\d+\.\s*/, '')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Staff */}
          {mods.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Staff</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mods.map(m => (
                  <div key={m.id} className="staff-card" style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.2s',
                  }}>
                    {m.avatar
                      ? <img src={`https://cdn.discordapp.com/avatars/${m.discord_id}/${m.avatar}.png`} alt="" style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                      : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{m.username?.[0]?.toUpperCase()}</span>
                        </div>
                    }
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#fff', letterSpacing: '0.04em' }}>{m.username}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.46rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: m.role === 'owner' ? 'var(--red, #dc2626)' : 'rgba(255,255,255,0.25)' }}>{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HeroContent({ community, membership, members }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
      {community.logo && (
        <div style={{
          width: 72, height: 72, flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.15)',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#111',
        }}>
          <img src={community.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 className="community-hero-title" style={{
          fontFamily: "'Black Ops One', cursive",
          fontSize: 'clamp(2rem, 6vw, 3.6rem)',
          color: '#fff',
          letterSpacing: '0.03em',
          lineHeight: 1,
          marginBottom: 8,
          textShadow: '0 2px 24px rgba(0,0,0,0.8)',
        }}>{community.name}</h1>
        {community.description && (
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 0 10px' }}>{community.description}</p>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {community.discord_url && (
            <a href={community.discord_url} target="_blank" rel="noreferrer" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.14em', color: '#5865F2', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
              Discord ↗
            </a>
          )}
          {community.twitter_url && (
            <a href={community.twitter_url} target="_blank" rel="noreferrer" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
              Twitter ↗
            </a>
          )}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.52rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em' }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children, muted }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '0.52rem',
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: muted ? 'rgba(255,255,255,0.2)' : 'var(--red, #dc2626)',
      marginBottom: 14,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ display: 'inline-block', width: 20, height: 1, background: muted ? 'rgba(255,255,255,0.2)' : 'var(--red, #dc2626)', flexShrink: 0 }} />
      {children}
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.46rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: '1.8rem', color: '#fff', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function statusColor(status) {
  switch (status) {
    case 'code_live':
    case 'in_progress': return '#dc2626'
    case 'starting': return '#f97316'
    case 'open':
    case 'filling': return '#16a34a'
    case 'ready': return '#2563eb'
    default: return 'rgba(255,255,255,0.15)'
  }
}
