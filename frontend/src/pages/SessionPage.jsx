import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

function TeamCard({ team, myDbId, myTeam, sessionStatus, onJoin, onLeave, onRename, claimBusy }) {
  const members = team.team_members || []
  const maxSize = team.max_size || 4
  const captain = members.find(m => m.is_captain)
  const iAmCaptain = myDbId && captain?.profiles?.id === myDbId
  const iAmOnThisTeam = myDbId && members.some(m => m.profiles?.id === myDbId)
  const canJoin = myDbId && !myTeam && !team.locked && ['open', 'filling', 'ready'].includes(sessionStatus)

  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(team.name)
  const inputRef = useRef(null)

  function startEdit() { setEditing(true); setTimeout(() => inputRef.current?.focus(), 0) }

  async function saveName() {
    setEditing(false)
    if (nameVal.trim() && nameVal.trim() !== team.name) {
      await onRename(team.id, nameVal.trim())
    } else {
      setNameVal(team.name)
    }
  }

  // Build slot rows: filled members sorted by slot_number, then empty slots
  const filled = [...members].sort((a, b) => a.slot_number - b.slot_number)
  const emptyCount = Math.max(0, maxSize - filled.length)

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border2)', padding: '20px 24px' }}>
      {/* Team header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {editing ? (
            <input
              ref={inputRef}
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.12em', color: 'var(--white)', background: 'var(--surface)', border: '1px solid var(--red2)', padding: '2px 8px', textTransform: 'uppercase', width: 140 }}
            />
          ) : (
            <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.12em', color: 'var(--white)', textTransform: 'uppercase' }}>
              {team.name}
            </div>
          )}
          {iAmCaptain && !editing && (
            <button onClick={startEdit} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.65rem', padding: '2px 4px' }} title="Rename team">✎</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>{filled.length}/{maxSize}</span>
          {team.locked && <span style={{ fontSize: '0.55rem', letterSpacing: '0.14em', color: 'var(--red2)', border: '1px solid var(--red)', padding: '2px 8px' }}>LOCKED</span>}
        </div>
      </div>

      {/* Slots */}
      <div style={{ display: 'grid', gap: 4 }}>
        {filled.map(m => (
          <div key={m.profiles?.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: 'var(--surface)', border: `1px solid ${m.is_captain ? 'var(--red2)' : 'var(--border)'}` }}>
            {m.profiles?.avatar
              ? <img src={m.profiles.avatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--border2)' }} />
            }
            <span style={{ fontSize: '0.68rem', color: m.is_captain ? 'var(--white)' : 'var(--dirty)', flex: 1 }}>
              {m.profiles?.username || 'Unknown'}
            </span>
            {m.is_captain && <span style={{ fontSize: '0.5rem', color: 'var(--red2)', letterSpacing: '0.1em' }}>CAPTAIN</span>}
            {iAmOnThisTeam && m.profiles?.id === myDbId && (
              <button onClick={() => onLeave(team.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.6rem', padding: 0 }}>Leave</button>
            )}
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: emptyCount }).map((_, i) => {
          const isFirstEmpty = i === 0
          return (
            <div key={`empty-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: 'transparent', border: '1px solid var(--border)', borderStyle: 'dashed' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1px dashed var(--border2)' }} />
              {canJoin && isFirstEmpty ? (
                <button onClick={() => onJoin(team.id)} disabled={claimBusy === team.id} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '3px 12px', margin: 0 }}>
                  {claimBusy === team.id ? 'Joining...' : 'Join Team'}
                </button>
              ) : (
                <span style={{ fontSize: '0.62rem', color: 'var(--border2)', fontStyle: 'italic' }}>Open slot</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

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

  async function renameTeam(teamId, name) {
    try {
      await api.patch(`/teams/${teamId}/name`, { name })
      await load()
    } catch {}
  }

  if (loading) return <div className="spinner" />
  if (error) return <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>{error}</div>

  const teams = session.teams || []
  const rounds = session.rounds || []

  const myTeam = myDbId ? teams.find(t => (t.team_members || []).some(m => m.profiles?.id === myDbId)) : null
  const isMod = session?.membership?.role === 'owner' || session?.membership?.role === 'moderator'
  const currentRoundIdx = rounds.findIndex(r => ['open','code_live','starting','in_progress'].includes(r.status))
  const currentRound = currentRoundIdx >= 0 ? rounds[currentRoundIdx] : null
  const nextRound = currentRoundIdx >= 0 ? rounds[currentRoundIdx + 1] : rounds.find(r => r.status === 'draft')

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
          <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Teams — {teams.length}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {teams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                myDbId={myDbId}
                myTeam={myTeam}
                sessionStatus={session.status}
                onJoin={claimSlot}
                onLeave={leaveTeam}
                onRename={renameTeam}
                claimBusy={claimBusy}
              />
            ))}
          </div>
        </div>

        {/* Rounds sidebar */}
        <div style={{ display: 'grid', gap: 16 }}>
          {nextRound && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--olive)', padding: 18 }}>
              <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--khaki)', marginBottom: 10 }}>Up Next</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: 'var(--white)', letterSpacing: '0.1em', marginBottom: 8 }}>
                {nextRound.title || `Round ${nextRound.round_number}`}
              </div>
              {nextRound.map && <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: 6 }}>{nextRound.map}</div>}
              {nextRound.rules_presets?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {nextRound.rules_presets.map(p => (
                    <span key={p} style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--khaki)', border: '1px solid var(--olive)', padding: '2px 8px' }}>{p}</span>
                  ))}
                </div>
              )}
              {nextRound.custom_rules_text && (
                <p style={{ fontSize: '0.62rem', color: 'var(--dirty)', lineHeight: 1.7, fontStyle: 'italic' }}>"{nextRound.custom_rules_text}"</p>
              )}
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>All Rounds</div>
            <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
              {rounds.map(r => (
                <div key={r.id} style={{ background: r.status === 'in_progress' ? 'rgba(180,20,20,0.06)' : 'var(--bg)', padding: '14px 18px', borderLeft: r.status === 'in_progress' ? '2px solid var(--red2)' : '2px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.78rem', color: 'var(--white)', letterSpacing: '0.1em' }}>{r.title || `Round ${r.round_number}`}</div>
                    <span className={`status-badge status-${r.status}`} style={{ fontSize: '0.48rem', padding: '2px 7px' }}>{r.status.replace('_', ' ')}</span>
                  </div>
                  {r.map && <div style={{ fontSize: '0.58rem', color: 'var(--muted)', marginBottom: 3 }}>{r.map}</div>}
                  {r.rules_presets?.length > 0 && <div style={{ fontSize: '0.58rem', color: 'var(--khaki)' }}>{r.rules_presets.join(' · ')}</div>}
                  {r.custom_rules_text && <div style={{ fontSize: '0.58rem', color: 'var(--dirty)', marginTop: 3, fontStyle: 'italic' }}>"{r.custom_rules_text}"</div>}
                  {r.join_code && <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.9rem', color: 'var(--red2)', letterSpacing: '0.2em', marginTop: 6 }}>{r.join_code}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
