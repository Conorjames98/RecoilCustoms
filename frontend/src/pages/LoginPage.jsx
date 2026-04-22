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
    <div style={{ minHeight: 'calc(100vh - 52px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(2rem, 8vw, 3rem)', color: 'var(--white)', textAlign: 'center', letterSpacing: '0.06em', marginBottom: 6 }}>
          RECOIL<span style={{ color: 'var(--red2)' }}>.</span>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 36 }}>
          Custom Game Communities
        </p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 32 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 8 }}>Sign In</div>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: 24 }}>
            Connect your Discord account to join communities, claim team slots, and take part in custom events.
          </p>
          {error && <p className="error-msg" style={{ marginBottom: 14 }}>{error}</p>}
          <button className="btn-discord" onClick={handleDiscord} disabled={busy}>
            <DiscordIcon />
            {busy ? 'Connecting...' : 'Continue with Discord'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--muted)', marginTop: 18, lineHeight: 1.6 }}>
            Your Discord username and avatar will be shown to community members.
          </p>
        </div>
      </div>
    </div>
  )
}
