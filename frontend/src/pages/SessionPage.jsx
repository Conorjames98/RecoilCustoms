import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function SessionPage() {
  const { slug, sessionId } = useParams()
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [myDbId, setMyDbId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [claimBusy, setClaimBusy] = useState(null)

  async function load() {
    try {
      const r = await api.get(`/sessions/${sessionId}`)
      setSession(r.data)
    } catch { setError('Session not found.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    if (user) {
      api.get('/users/me').then(r => setMyDbId(r.data.id)).catch(() => {})
    }
  }, [sessionId, user])

  async function claimSlot(teamId) {
    setClaimBusy(teamId)
    try {
      await api.post(`/teams/${teamId}/join`)
      await load()
    } catch(err) {
      setError(err.response?.data?.error || 'Could not join team.')
    } finally { setClaimBusy(null) }
  }

  async function leaveTeam(teamId) {
    try {
      await api.post(`/teams/${teamId}/leave`)
      await load()
    } catch {}
  }

  if (loading) return <div className="spinner" />
  if (error) return <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>{error}</div>

  const teams = session.teams || []
  const rounds = session.rounds || []

  // Check if current user is in any team
  const myTeam = myDbId ? teams.find(t => (t.team_members || []).some(m => m.users?.id === myDbId)) : null
  const isMod = session?.membership?.role === 'owner' || session?.membership?.role === 'moderator'
  const currentRound = rounds.find(r => ['open','code_live','starting','in_progress'].includes(r.status))

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 28, marginBottom: 36 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          <Link to={`/c/${slug}`} style={{ color: 'var(--red2)' }}>{slug}</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: 8 }}>
              {session.title}
            </h1>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`status-badge status-${session.status}`}>{session.status.replace('_', ' ')}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{rounds.length} rounds · {teams.length} teams</span>
            </div>
          </div>
          {isMod && (
            <Link to={`/c/${slug}/sessions/${sessionId}/control`} className="btn-red" style={{ fontSize: '0.6rem', padding: '8px 18px' }}>Host Control</Link>
          )}
        </div>
      </div>

      {/* Active round code banner */}
      {currentRound?.join_code && (
        <div style={{ background: 'var(--red)', border: '1px solid var(--red2)', padding: '16px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Join Code — Round {currentRound.round_number}</div>
          <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: '2rem', color: '#fff', letterSpacing: '0.2em' }}>{currentRound.join_code}</div>
        </div>
      )}

      {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Teams */}
        <div>
          <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Teams</div>
          <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {teams.map(team => {
              const members = team.team_members || []
              const isMine = myDbId && members.some(m => m.users?.id === myDbId)
              const maxSize = team.max_size || 20
              const slotsLeft = maxSize - members.length
              return (
                <div key={team.id} style={{ background: 'var(--bg)', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.12em', color: 'var(--white)', textTransform: 'uppercase' }}>{team.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>{members.length} signed up</span>
                      {team.locked && <span style={{ fontSize: '0.55rem', letterSpacing: '0.14em', color: 'var(--red2)', border: '1px solid var(--red)', padding: '2px 8px' }}>LOCKED</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: members.length > 0 ? 12 : 0 }}>
                    {members.map(m => (
                      <div key={m.users?.id} style={{ fontSize: '0.65rem', color: m.is_captain ? 'var(--white)' : 'var(--dirty)', background: 'var(--surface)', border: `1px solid ${m.is_captain ? 'var(--red2)' : 'var(--border2)'}`, padding: '4px 10px' }}>
                        {m.users?.username}
                        {m.is_captain && <span style={{ fontSize: '0.5rem', color: 'var(--red2)', marginLeft: 4 }}>★</span>}
                      </div>
                    ))}
                  </div>
                  {user && !myTeam && !team.locked && ['open','filling','ready'].includes(session.status) && (
                    <button onClick={() => claimSlot(team.id)} disabled={claimBusy === team.id} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '5px 12px' }}>
                      {claimBusy === team.id ? 'Joining...' : 'Join Team'}
                    </button>
                  )}
                  {isMine && (
                    <button onClick={() => leaveTeam(team.id)} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '5px 12px', color: 'var(--red2)' }}>Leave</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Rounds sidebar */}
        <div>
          <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Rounds</div>
          <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {rounds.map(r => (
              <div key={r.id} style={{ background: 'var(--bg)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.8rem', color: 'var(--white)', letterSpacing: '0.1em' }}>Round {r.round_number}</div>
                  <span className={`status-badge status-${r.status}`} style={{ fontSize: '0.5rem', padding: '2px 8px' }}>{r.status.replace('_', ' ')}</span>
                </div>
                {r.rules_presets?.length > 0 && <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: 4 }}>{r.rules_presets.join(', ')}</div>}
                {r.join_code && <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.85rem', color: 'var(--red2)', letterSpacing: '0.2em' }}>{r.join_code}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
