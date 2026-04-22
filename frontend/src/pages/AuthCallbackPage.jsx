import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallbackPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const fallback  = useRef(null)

  useEffect(() => {
    if (user) { clearTimeout(fallback.current); navigate('/', { replace: true }) }
  }, [user, navigate])

  useEffect(() => {
    fallback.current = setTimeout(() => navigate('/login', { replace: true }), 10000)
    return () => clearTimeout(fallback.current)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 52px)', gap: 16 }}>
      <div className="spinner" style={{ margin: 0 }} />
      <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>Logging you in...</p>
    </div>
  )
}
