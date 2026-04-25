import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function BotPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [guilds, setGuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    api.get('/bot/guilds')
      .then(r => {
        if (r.data.needsAuth) setNeedsAuth(true)
        else setGuilds(r.data.guilds)
      })
      .catch(() => setNeedsAuth(true))
      .finally(() => setLoading(false))
  }, [])

  async function connectDiscord() {
    setConnecting(true)
    const { data } = await api.get('/bot/auth/url')
    window.location.href = data.url
  }

  const guildIcon = (g) => g.icon
    ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
    : null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid var(--rule)' }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8 }}>
          Bot Dashboard
        </div>
        <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 12 }}>
          Your Servers
        </h1>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', lineHeight: 1.8 }}>
          Select a server to configure the Recoil bot.
        </p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : needsAuth ? (
        <div style={{ border: '1px solid var(--rule)', padding: '64px 32px', textAlign: 'center', background: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none' }}>
            <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ff0a20" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 10 }}>
              Connect Discord
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--muted)', marginBottom: 28, lineHeight: 1.8, maxWidth: 400, margin: '0 auto 28px' }}>
              Link your Discord account to see your servers and configure the bot.
            </p>
            <button className="btn-red" onClick={connectDiscord} disabled={connecting} style={{ fontSize: '0.65rem', padding: '12px 28px' }}>
              {connecting ? 'Redirecting...' : 'Connect Discord →'}
            </button>
          </div>
        </div>
      ) : guilds.length === 0 ? (
        <div style={{ border: '1px solid var(--rule)', padding: '48px 32px', textAlign: 'center', background: 'var(--ink)' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            No servers found
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 8, lineHeight: 1.8 }}>
            You need to be an admin of a Discord server to configure the bot.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {guilds.map(g => (
            <div
              key={g.id}
              style={{
                background: 'var(--ink)',
                border: '1px solid var(--rule2)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                cursor: g.hasBot ? 'pointer' : 'default',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => { if (g.hasBot) e.currentTarget.style.borderColor = 'var(--red)' }}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--rule2)'}
              onClick={() => g.hasBot && navigate(`/bot/${g.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, border: '1px solid var(--rule2)', background: 'var(--black)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {guildIcon(g)
                    ? <img src={guildIcon(g)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.1rem', color: 'var(--muted)' }}>{g.name[0]}</span>
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.name}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em', color: g.hasBot ? '#4ade80' : 'var(--muted)', marginTop: 2 }}>
                    {g.hasBot ? '● Bot active' : '○ Bot not added'}
                  </div>
                </div>
              </div>

              {g.hasBot ? (
                <div className="btn-red" style={{ fontSize: '0.56rem', padding: '8px 14px', textAlign: 'center' }}>
                  Configure →
                </div>
              ) : (
                <a
                  href={g.inviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                  style={{ fontSize: '0.56rem', padding: '8px 14px', textAlign: 'center' }}
                  onClick={e => e.stopPropagation()}
                >
                  Add Bot →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
