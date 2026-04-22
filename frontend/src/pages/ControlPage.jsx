import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'

const SESSION_STATUSES = ['draft','open','filling','ready','code_live','starting','in_progress','ended','archived']
const ROUND_STATUSES   = ['draft','open','code_live','starting','in_progress','ended']
const PRESETS = ['Anything Goes','Knives Only','Snipers Only','Pistols Only','Shotguns Only','No Vehicles','No Lethals','No Killstreaks','No Loadouts','Custom Loadouts Allowed']

export default function ControlPage() {
  const { slug, sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [rounds, setRounds]   = useState([])
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState({})
  const [error, setError]     = useState('')

  async function load() {
    try {
      const r = await api.get(`/sessions/${sessionId}`)
      setSession(r.data)
      setRounds(r.data.rounds || [])
      setTeams(r.data.teams || [])
    } catch { setError('Could not load session.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [sessionId])

  function setBusyKey(k, v) { setBusy(b => ({ ...b, [k]: v })) }

  async function setSessionStatus(status) {
    setBusyKey('session', true)
    try { await api.patch(`/sessions/${sessionId}`, { status }); await load() }
    catch(err) { setError(err.response?.data?.error || 'Failed') }
    finally { setBusyKey('session', false) }
  }

  async function setRoundStatus(roundId, status) {
    setBusyKey(`r${roundId}`, true)
    try { await api.patch(`/rounds/${roundId}`, { status }); await load() }
    catch(err) { setError(err.response?.data?.error || 'Failed') }
    finally { setBusyKey(`r${roundId}`, false) }
  }

  async function updateRound(roundId, data) {
    try { await api.patch(`/rounds/${roundId}`, data); await load() }
    catch {}
  }

  async function toggleLock(teamId, locked) {
    try { await api.post(`/teams/${teamId}/lock`, { locked: !locked }); await load() }
    catch {}
  }

  async function shuffle() {
    setBusyKey('shuffle', true)
    try { await api.post(`/sessions/${sessionId}/shuffle`); await load() }
    catch {} finally { setBusyKey('shuffle', false) }
  }

  if (loading) return <div className="spinner" />
  if (error && !session) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>{error}</div>

  const curIdx = SESSION_STATUSES.indexOf(session?.status)
  const nextStatus = SESSION_STATUSES[curIdx + 1]
  const prevStatus = curIdx > 0 ? SESSION_STATUSES[curIdx - 1] : null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 24, marginBottom: 32 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          <Link to={`/c/${slug}/sessions/${sessionId}`} style={{ color: 'var(--red2)' }}>← Back to Session</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Host Control — {session?.title}
          </h1>
          <span className={`status-badge status-${session?.status}`}>{session?.status?.replace('_', ' ')}</span>
        </div>
      </div>

      {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 24 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 16 }}>Session Status</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {prevStatus && <button onClick={() => setSessionStatus(prevStatus)} disabled={busy.session} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '6px 14px' }}>← {prevStatus.replace('_', ' ')}</button>}
            {nextStatus && <button onClick={() => setSessionStatus(nextStatus)} disabled={busy.session} className="btn-red" style={{ fontSize: '0.58rem', padding: '6px 14px' }}>{nextStatus.replace('_', ' ')} →</button>}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 24 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 16 }}>Teams</div>
          <button onClick={shuffle} disabled={busy.shuffle} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '6px 14px' }}>
            {busy.shuffle ? 'Shuffling...' : 'Shuffle All'}
          </button>
        </div>
      </div>

      {/* Rounds control */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>Rounds</div>
        <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {rounds.map(r => {
            const rIdx = ROUND_STATUSES.indexOf(r.status)
            const rNext = ROUND_STATUSES[rIdx + 1]
            const rPrev = rIdx > 0 ? ROUND_STATUSES[rIdx - 1] : null
            return (
              <div key={r.id} style={{ background: 'var(--bg)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: 'var(--white)' }}>Round {r.round_number}</span>
                    <span className={`status-badge status-${r.status}`} style={{ fontSize: '0.5rem', padding: '2px 8px' }}>{r.status.replace('_', ' ')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {rPrev && <button onClick={() => setRoundStatus(r.id, rPrev)} disabled={busy[`r${r.id}`]} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 10px' }}>← {rPrev.replace('_', ' ')}</button>}
                    {rNext && <button onClick={() => setRoundStatus(r.id, rNext)} disabled={busy[`r${r.id}`]} className="btn-red" style={{ fontSize: '0.55rem', padding: '4px 10px' }}>{rNext.replace('_', ' ')} →</button>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Join Code</label>
                    <input key={r.id + r.join_code} defaultValue={r.join_code || ''} onBlur={e => updateRound(r.id, { join_code: e.target.value })} placeholder="Set code..." style={{ fontSize: '0.8rem', letterSpacing: '0.1em', padding: '7px 12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Rules Preset</label>
                    <select key={r.id} defaultValue={(r.rules_presets?.[0]) || 'Anything Goes'} onChange={e => updateRound(r.id, { rules_presets: [e.target.value] })} style={{ fontSize: '0.7rem', padding: '7px 12px' }}>
                      {PRESETS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Custom Notes</label>
                  <textarea key={r.id + 'notes'} defaultValue={r.custom_rules_text || ''} onBlur={e => updateRound(r.id, { custom_rules_text: e.target.value })} placeholder='e.g. "No camping fire station"' rows={2} style={{ fontSize: '0.7rem', padding: '7px 12px', resize: 'vertical' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Teams */}
      <div>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>Team Management</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {teams.map(team => (
            <div key={team.id} style={{ background: 'var(--bg)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.8rem', color: 'var(--white)', fontWeight: 600, letterSpacing: '0.1em' }}>{team.name}</span>
                <button onClick={() => toggleLock(team.id, team.locked)} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', border: '1px solid', borderColor: team.locked ? 'var(--red2)' : 'var(--border2)', background: 'transparent', color: team.locked ? 'var(--red2)' : 'var(--muted)', cursor: 'pointer' }}>
                  {team.locked ? 'Unlock' : 'Lock'}
                </button>
              </div>
              {(team.team_members || []).map(m => (
                <div key={m.profiles?.id} style={{ fontSize: '0.65rem', color: 'var(--dirty)', padding: '4px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{m.profiles?.username}</span>
                  {m.is_captain && <span style={{ fontSize: '0.5rem', color: 'var(--red2)' }}>★</span>}
                </div>
              ))}
              {(!team.team_members || team.team_members.length === 0) && (
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>Empty</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
