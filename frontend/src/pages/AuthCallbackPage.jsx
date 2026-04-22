import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error('Auth exchange failed:', error.message)
            navigate('/login', { replace: true })
          } else {
            navigate('/', { replace: true })
          }
        })
    } else {
      // Fallback: no code param, check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        navigate(session ? '/' : '/login', { replace: true })
      })
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 52px)', gap: 16 }}>
      <div className="spinner" style={{ margin: 0 }} />
      <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>Logging you in...</p>
    </div>
  )
}
