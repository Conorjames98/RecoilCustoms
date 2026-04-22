import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DiscordIcon = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="currentColor">
    <path d="M16.93 1.33A16.57 16.57 0 0 0 12.71.11a.06.06 0 0 0-.07.03c-.18.32-.39.75-.53 1.08a15.3 15.3 0 0 0-4.58 0A11 11 0 0 0 7 .14a.06.06 0 0 0-.06.03A16.53 16.53 0 0 0 2.72 1.33a.06.06 0 0 0-.03.02C.39 5.02-.24 8.58.08 12.1a.07.07 0 0 0 .03.04 16.64 16.64 0 0 0 5.01 2.53.06.06 0 0 0 .07-.02c.39-.53.73-1.08 1.02-1.66a.06.06 0 0 0-.03-.09 10.96 10.96 0 0 1-1.56-.75.06.06 0 0 1-.01-.1c.1-.08.21-.16.31-.24a.06.06 0 0 1 .06-.01c3.28 1.5 6.83 1.5 10.07 0a.06.06 0 0 1 .07.01c.1.08.2.16.31.25a.06.06 0 0 1 0 .1c-.5.29-1.02.54-1.56.74a.06.06 0 0 0-.03.09c.3.58.64 1.13 1.02 1.66a.06.06 0 0 0 .07.02 16.6 16.6 0 0 0 5.02-2.53.06.06 0 0 0 .03-.04c.37-3.84-.62-7.37-2.62-10.75a.05.05 0 0 0-.03-.02ZM6.68 9.9c-.99 0-1.8-.9-1.8-2.02s.8-2.02 1.8-2.02c1.01 0 1.81.91 1.8 2.02 0 1.11-.8 2.02-1.8 2.02Zm6.65 0c-.99 0-1.8-.9-1.8-2.02s.8-2.02 1.8-2.02c1.01 0 1.81.91 1.8 2.02 0 1.11-.79 2.02-1.8 2.02Z"/>
  </svg>
)

export default function LoginPage() {
  const { user, loading, signInWithDiscord } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!loading && user) navigate('/', { replace: true }) }, [loading, user])

  async function handleDiscord() {
    setBusy(true); setError('')
    try { await signInWithDiscord() }
    catch(err) { setError(err?.message || 'Failed to connect to Discord.'); setBusy(false) }
  }

  return (
    <div className="login-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 82px)' }}>

      {/* Left — pure black, giant logo */}
      <div className="login-left" style={{
        background: '#000',
        borderRight: '1px solid var(--rule)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Oversized ghost text */}
        <div style={{
          position: 'absolute', bottom: -40, left: -20,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontStyle: 'italic',
          fontSize: '20rem', lineHeight: 0.8,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.05)',
          userSelect: 'none', pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>R.</div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 20 }}>
            ◆ RECOIL.GG
          </div>
          <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 0.9, letterSpacing: '0.03em', color: '#fff' }}>
            RECOIL<span style={{ color: 'var(--red)' }}>.</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', lineHeight: 2.2 }}>
            <div>Custom Game Communities</div>
            <div>Team Management</div>
            <div>Live Round Control</div>
            <div>Discord Authentication</div>
          </div>
        </div>
      </div>

      {/* Right — auth */}
      <div className="login-right" style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 72px',
        background: 'var(--black)',
        animation: 'reveal 0.5s ease both',
      }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
            Step 01 of 01
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '3.5rem', textTransform: 'uppercase', lineHeight: 0.9, letterSpacing: '0.02em', color: 'var(--white)', marginBottom: 8 }}>
            Sign In
          </h1>
          <div style={{ height: 2, width: 48, background: 'var(--red)', marginBottom: 28 }} />

          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: 40, fontWeight: 300 }}>
            Connect your Discord account to join communities, claim team slots, and take part in custom events.
          </p>

          <button className="btn-discord" onClick={handleDiscord} disabled={busy} style={{ fontSize: '0.7rem', padding: '16px' }}>
            <DiscordIcon />
            {busy ? 'Connecting...' : 'Continue with Discord'}
          </button>

          {error && <p className="error-msg" style={{ marginTop: 14 }}>{error}</p>}

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.1em', color: 'var(--muted)', lineHeight: 1.9 }}>
              Your Discord username and avatar will be shown to community members. No password required.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
