import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const CrosshairSVG = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.04 }}>
    <circle cx="60" cy="60" r="40" stroke="#ff0a20" strokeWidth="1"/>
    <circle cx="60" cy="60" r="20" stroke="#ff0a20" strokeWidth="1"/>
    <circle cx="60" cy="60" r="3" fill="#ff0a20"/>
    <line x1="60" y1="0" x2="60" y2="35" stroke="#ff0a20" strokeWidth="1"/>
    <line x1="60" y1="85" x2="60" y2="120" stroke="#ff0a20" strokeWidth="1"/>
    <line x1="0" y1="60" x2="35" y2="60" stroke="#ff0a20" strokeWidth="1"/>
    <line x1="85" y1="60" x2="120" y2="60" stroke="#ff0a20" strokeWidth="1"/>
  </svg>
)

const GridSVG = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none' }}>
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ff0a20" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>
  </svg>
)

function CommunityCard({ c, index }) {
  const isOwner = c.role === 'owner'
  const isMod = c.role === 'moderator' || c.role === 'mod'

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--ink)',
        border: '1px solid var(--rule2)',
        borderTop: isOwner ? '2px solid var(--red)' : '1px solid var(--rule2)',
        overflow: 'hidden',
        animation: `reveal 0.4s ${index * 0.06}s ease both`,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = isOwner ? 'var(--red)' : 'var(--muted)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = isOwner ? 'var(--red)' : 'var(--rule2)'}
    >
      {/* Banner */}
      <div style={{ height: 72, background: c.banner ? `url(${c.banner}) center/cover` : 'var(--black)', borderBottom: '1px solid var(--rule)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 20px 10px' }}>
        {!c.banner && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.06 }}>
              <defs><pattern id={`g-${c.id}`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ff0a20" strokeWidth="0.5"/></pattern></defs>
              <rect width="100%" height="100%" fill={`url(#g-${c.id})`}/>
            </svg>
            <span style={{ position: 'absolute', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.48rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>No Banner Set</span>
          </div>
        )}
        {/* Logo */}
        <div style={{ width: 36, height: 36, border: '1px solid var(--rule2)', background: 'var(--ink)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {c.logo
            ? <img src={c.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1rem', color: 'var(--muted)' }}>{c.name?.[0]?.toUpperCase()}</span>
          }
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        {/* Corner accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 24px 24px 0', borderColor: `transparent ${isOwner ? 'var(--red)' : 'var(--rule2)'} transparent transparent`, opacity: isOwner ? 0.7 : 0.4 }} />

        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>
            {c.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>/{c.slug}</span>
            <span style={{ width: 1, height: 8, background: 'var(--rule2)' }} />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.48rem', letterSpacing: '0.14em', textTransform: 'uppercase',
              color: isOwner ? 'var(--red)' : isMod ? '#fbbf24' : 'var(--muted)',
              border: `1px solid ${isOwner ? 'rgba(255,10,32,0.35)' : isMod ? 'rgba(251,191,36,0.3)' : 'var(--rule2)'}`,
              padding: '2px 7px',
            }}>{c.role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to={`/c/${c.slug}`} className="btn-ghost" style={{ fontSize: '0.56rem', padding: '6px 14px' }}>View</Link>
          {(isOwner || isMod) && (
            <Link to={`/c/${c.slug}/manage`} className="btn-red" style={{ fontSize: '0.56rem', padding: '6px 14px' }}>Manage</Link>
          )}
        </div>
      </div>
    </div>
  )
}

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
  const avatar = user?.user_metadata?.avatar_url
  const managed = communities.filter(c => c.role === 'owner' || c.role === 'moderator' || c.role === 'mod')
  const member = communities.filter(c => c.role !== 'owner' && c.role !== 'moderator' && c.role !== 'mod')

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px', position: 'relative' }}>

      {/* Background crosshairs */}
      <div style={{ position: 'fixed', top: 80, right: 40, pointerEvents: 'none', zIndex: 0 }}>
        <CrosshairSVG />
      </div>
      <div style={{ position: 'fixed', bottom: 80, left: 20, pointerEvents: 'none', zIndex: 0 }}>
        <CrosshairSVG />
      </div>

      {/* Header */}
      <div style={{ position: 'relative', marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid var(--rule)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {avatar && (
              <div style={{ position: 'relative' }}>
                <img src={avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--rule2)' }} />
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#4ade80', border: '1.5px solid var(--black)' }} />
              </div>
            )}
            <div>
              <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1 }}>
                {name}
              </h1>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.14em', color: 'var(--muted)', marginTop: 4 }}>
                {communities.length} {communities.length === 1 ? 'community' : 'communities'} · Online
              </div>
            </div>
          </div>
          <Link to="/create" className="btn-red" style={{ fontSize: '0.62rem', padding: '10px 22px' }}>+ New Community</Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, marginTop: 28, border: '1px solid var(--rule)', overflow: 'hidden' }}>
          {[
            { label: 'Total', value: communities.length },
            { label: 'Managing', value: managed.length },
            { label: 'Member', value: member.length },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '14px 20px', borderRight: i < 2 ? '1px solid var(--rule)' : 'none', background: 'var(--ink)' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.8rem', color: 'var(--white)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : communities.length === 0 ? (
        <div style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--rule)', padding: '64px 32px', textAlign: 'center', background: 'var(--ink)' }}>
          <GridSVG />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 10 }}>No Communities Yet</div>
            <p style={{ fontSize: '0.74rem', color: 'var(--muted)', marginBottom: 28, lineHeight: 1.8 }}>Create your first community to start running custom lobbies.</p>
            <Link to="/create" className="btn-red" style={{ fontSize: '0.65rem', padding: '12px 28px' }}>Create Community →</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Managed communities */}
          {managed.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)' }}>Managing</div>
                <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>{managed.length}</div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {managed.map((c, i) => <CommunityCard key={c.id} c={c} index={i} />)}
              </div>
            </div>
          )}

          {/* Member communities */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)' }}>Joined Communities</div>
              <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>{member.length}</div>
            </div>
            {member.length > 0 ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {member.map((c, i) => <CommunityCard key={c.id} c={c} index={i} />)}
              </div>
            ) : (
              <div style={{ border: '1px solid var(--rule)', padding: '32px', textAlign: 'center', background: 'var(--ink)' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>You haven't joined any communities yet</div>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.8 }}>Discover communities and join one to get started.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
