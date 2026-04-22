import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      // PKCE flow
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          navigate(error ? '/login' : '/', { replace: true })
        })
      return
    }

    // Implicit flow — tokens arrive in the URL hash
    // onAuthStateChange fires SIGNED_IN once detectSessionInUrl processes the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        navigate('/', { replace: true })
      }
    })

    // Also check for an existing session in case the event already fired
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe()
        navigate('/', { replace: true })
      }
    })

    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      navigate('/login', { replace: true })
    }, 10000)

    return () => { clearTimeout(timeout); subscription.unsubscribe() }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 52px)', gap: 16 }}>
      <div className="spinner" style={{ margin: 0 }} />
      <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>Logging you in...</p>
    </div>
  )
}
