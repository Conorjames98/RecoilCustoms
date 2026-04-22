import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let resolved = false
    function resolve() { if (!resolved) { resolved = true; setLoading(false) } }
    const timeout = setTimeout(resolve, 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') { if (session?.user) setUser(session.user); resolve() }
      else if (event === 'SIGNED_IN' && session?.user) { setUser(session.user); resolve() }
      else if (event === 'TOKEN_REFRESHED' && session?.user) setUser(session.user)
      else if (event === 'SIGNED_OUT') { setUser(null); resolve() }
    })

    return () => { clearTimeout(timeout); subscription.unsubscribe() }
  }, [])

  async function signInWithDiscord() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut({ scope: 'local' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithDiscord, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
