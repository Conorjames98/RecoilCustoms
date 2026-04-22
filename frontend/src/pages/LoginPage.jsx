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
    <div style={{
      minHeight: 'calc(100vh - 58px)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px',
        borderRight: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,21,41,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,21,41,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 80% at 30% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 30% 50%, black 20%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '30%',
          transform: 'translate(-50%, -50%)',
          width: 500, height: 400,
          background: 'radial-gradient(ellipse, rgba(255,21,41,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{
              fontFamily: "'Black Ops One', cursive",
              fontSize: 'clamp(3.5rem, 6vw, 6rem)',
              lineHeight: 0.9, letterSpacing: '0.04em',
              color: 'var(--text)', marginBottom: 16,
              animation: 'fade-up 0.5s ease both',
            }}>
              RECOIL<span style={{ color: 'var(--red)', textShadow: '0 0 30px rgba(255,21,41,0.5)' }}>.</span>
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--dim)',
              animation: 'fade-up 0.5s 0.1s ease both',
            }}>
              Custom Game Communities
            </div>
          </div>

          <div style={{ animation: 'fade-up 0.5s 0.2s ease both' }}>
            {[
              'Build and manage your custom lobby community',
              'Control sessions, teams and join codes in real time',
              'Run multi-round tournaments with full host control',
            ].map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--red)',
                  marginTop: 7, flexShrink: 0,
                  boxShadow: '0 0 6px rgba(255,21,41,0.6)',
                }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--dim)', lineHeight: 1.7, fontWeight: 300 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth */}
      <div style={{
        width: 440,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        flexShrink: 0,
      }}>
        <div style={{ width: '100%', animation: 'fade-up 0.5s 0.15s ease both' }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: '2rem', letterSpacing: '0.1em',
            color: 'var(--text)', marginBottom: 6,
          }}>Sign In</div>
          <p style={{ fontSize: '0.78rem', color: 'var(--dim)', lineHeight: 1.7, marginBottom: 36, fontWeight: 300 }}>
            Connect your Discord account to access your communities and sessions.
          </p>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 32, marginBottom: 28,
          }}>
            <button className="btn-discord" onClick={handleDiscord} disabled={busy} style={{ fontSize: '0.72rem', padding: '16px' }}>
              <DiscordIcon />
              {busy ? 'Connecting...' : 'Continue with Discord'}
            </button>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.56rem', letterSpacing: '0.1em',
            color: 'var(--faint)', lineHeight: 1.8, marginTop: 24,
          }}>
            By signing in, your Discord username and avatar will be visible to community members.
          </p>

          {/* Decorative corner */}
          <div style={{
            position: 'absolute', bottom: 40, right: 40,
            display: 'flex', flexDirection: 'column', gap: 4, opacity: 0.3,
          }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                display: 'flex', gap: 4,
              }}>
                {[...Array(4)].map((_, j) => (
                  <div key={j} style={{ width: 3, height: 3, background: 'var(--red)', borderRadius: '50%', opacity: (i + j) % 2 === 0 ? 1 : 0.4 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
