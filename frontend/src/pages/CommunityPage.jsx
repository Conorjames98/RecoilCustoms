import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

function Countdown({ scheduledAt }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    function calc() {
      const diff = new Date(scheduledAt) - Date.now()
      if (diff <= 0) return setLabel('Starting now')
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setLabel(d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [scheduledAt])
  return <span>{label}</span>
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

  return (
    <div>
      {/* Sticky top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300, height: 98, background: '#080808', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'flex-end', padding: '0 20px 0 20px', justifyContent: 'flex-start' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--white)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', transition: 'color 0.15s', marginBottom: 12 }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--white)'}>
          ← Back
        </button>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ height: 98 }} />
      {/* Banner */}
      {community.banner && (
        <>
          <div style={{ height: 200, background: `url(${community.banner}) center/cover` }} />
          <div style={{ height: 3, background: 'var(--red)' }} />
        </>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px' }}>

        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 24, marginBottom: 40, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: 6 }}>
                {community.name}
              </h1>
              {community.description && (
                <p style={{ fontSize: '0.7rem', color: 'var(--khaki)', lineHeight: 1.8, maxWidth: 600 }}>{community.description}</p>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                {community.discord_url && <a href={community.discord_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: '#5865F2' }}>Discord ↗</a>}
                {community.twitter_url && <a href={community.twitter_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'var(--khaki)' }}>Twitter ↗</a>}
            </div>
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
          <div style={{ marginBottom: 24, fontSize: '0.58rem', letterSpacing: '0.16em', color: 'var(--muted)' }}>
            Member · <span style={{ color: membership.role === 'owner' ? 'var(--red2)' : 'var(--khaki)', textTransform: 'uppercase' }}>{membership.role}</span>
          </div>
        )}
        {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}

        {/* Live / Upcoming banner */}
        {liveSession && (
          <Link to={`/c/${slug}/sessions/${liveSession.id}`} style={{ background: 'var(--red)', border: '1px solid var(--red2)', padding: '18px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>● Live Now</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '1rem', color: '#fff', letterSpacing: '0.1em' }}>{liveSession.title}</div>
            </div>
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.16em', color: '#fff', textTransform: 'uppercase' }}>Join →</span>
          </Link>
        )}

        {!liveSession && upcomingSession?.scheduled_at && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: '18px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Upcoming</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: 'var(--white)', letterSpacing: '0.1em' }}>{upcomingSession.title}</div>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '1.1rem', color: 'var(--green)', letterSpacing: '0.1em' }}>
              <Countdown scheduledAt={upcomingSession.scheduled_at} />
            </div>
          </div>
        )}

        <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
          <div>
            {/* Announcements */}
            {announcements.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 18, height: 1, background: 'var(--red)', display: 'inline-block' }} />
                  Announcements
                </div>
                <div style={{ display: 'grid', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
                  {announcements.slice(0, 5).map(a => (
                    <div key={a.id} style={{ background: 'var(--ink)', padding: '16px 20px', borderLeft: a.pinned ? '2px solid var(--red)' : '2px solid transparent' }}>
                      {a.pinned && <div style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: 4 }}>Pinned</div>}
                      <p style={{ fontSize: '0.7rem', color: 'var(--chalk)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{a.content}</p>
                      <div style={{ fontSize: '0.52rem', color: 'var(--muted)', marginTop: 8 }}>{a.users?.username} · {new Date(a.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 18, height: 1, background: 'var(--red)', display: 'inline-block' }} />
                  Custom Games
                </div>
                <Link to={`/c/${slug}/customs`} style={{ fontSize: '0.54rem', letterSpacing: '0.14em', color: 'var(--red)' }}>View All →</Link>
              </div>

              {sessions.filter(s => !['ended','archived'].includes(s.status)).length === 0 ? (
                <div style={{ background: 'var(--ink)', border: '1px solid var(--rule)', padding: '32px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>No active sessions.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
                  {sessions.filter(s => !['ended','archived'].includes(s.status)).slice(0, 6).map(s => (
                    <Link key={s.id} to={`/c/${slug}/sessions/${s.id}`}
                      style={{ background: 'var(--ink)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1a1c'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--white)', letterSpacing: '0.06em', marginBottom: 4 }}>{s.title}</div>
                        {s.scheduled_at && <div style={{ fontSize: '0.56rem', color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>{new Date(s.scheduled_at).toLocaleString()}</div>}
                      </div>
                      <span className={`status-badge status-${s.status}`}>{s.status.replace('_', ' ')}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Results / History */}
            {pastSessions.length > 0 && (
              <div>
                <div style={{ fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 18, height: 1, background: 'var(--muted)', display: 'inline-block' }} />
                  Results / History
                </div>
                <div style={{ display: 'grid', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
                  {pastSessions.slice(0, 5).map(s => (
                    <Link key={s.id} to={`/c/${slug}/sessions/${s.id}`}
                      style={{ background: 'var(--ink)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, opacity: 0.7, transition: 'opacity 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--chalk)', letterSpacing: '0.06em' }}>{s.title}</div>
                      <span className="status-badge status-ended">ended</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Community Rules */}
            {community.rules && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: '1.2rem', letterSpacing: '0.06em', color: 'var(--white)' }}>Community Rules</div>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {community.rules.split('\n').filter(r => r.trim()).map((rule, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--ink)', border: '1px solid var(--rule)', padding: '12px 14px' }}>
                      <div style={{ minWidth: 24, height: 24, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.48rem', color: '#fff', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--chalk)', lineHeight: 1.6, paddingTop: 3 }}>{rule.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moderators */}
            {mods.length > 0 && (
              <div style={{ background: 'var(--ink)', border: '1px solid var(--rule)', padding: '20px' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Staff</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {mods.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {m.avatar && <img src={`https://cdn.discordapp.com/avatars/${m.discord_id}/${m.avatar}.png`} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--rule2)' }} />}
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--white)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{m.username}</div>
                        <div style={{ fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: m.role === 'owner' ? 'var(--red)' : 'var(--muted)' }}>{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member count */}
            <div style={{ background: 'var(--ink)', border: '1px solid var(--rule)', padding: '20px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Members</div>
              <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: '2rem', color: 'var(--white)' }}>{members.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
