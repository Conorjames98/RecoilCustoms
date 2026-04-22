import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

const ALL_PRESETS = [
  'Anything Goes',
  'Knives Only',
  'Snipers Only',
  'Pistols Only',
  'Shotguns Only',
  'No Vehicles',
  'No Lethals',
  'No Killstreaks',
  'No Loadouts',
  'Custom Loadouts Allowed',
]

const TEAM_NAMES = ['Alpha','Bravo','Charlie','Delta','Echo','Foxtrot','Golf','Hotel','India','Juliet','Kilo','Lima','Mike','November','Oscar','Papa','Quebec','Romeo','Sierra','Tango']

const defaultRound = (i) => ({
  title: `Round ${i + 1}`,
  game_mode: 'Warzone',
  map: '',
  rules_presets: ['Anything Goes'],
  custom_rules_text: '',
})

export default function CreateSessionPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [communityId, setCommunityId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', team_count: 12, team_size: 4 })
  const [rounds, setRounds] = useState([defaultRound(0), defaultRound(1), defaultRound(2)])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/communities/${slug}`).then(r => setCommunityId(r.data.id)).catch(() => setError('Community not found.'))
  }, [slug])

  function setRoundField(i, field, value) {
    setRounds(rs => rs.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  function togglePreset(i, preset) {
    setRounds(rs => rs.map((r, idx) => {
      if (idx !== i) return r
      const has = r.rules_presets.includes(preset)
      return { ...r, rules_presets: has ? r.rules_presets.filter(p => p !== preset) : [...r.rules_presets, preset] }
    }))
  }

  function addRound() {
    setRounds(rs => [...rs, defaultRound(rs.length)])
  }

  function removeRound(i) {
    setRounds(rs => rs.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, title: `Round ${idx + 1}` })))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!communityId) return
    setBusy(true); setError('')
    try {
      const r = await api.post('/sessions', {
        community_id: communityId,
        title: form.title,
        description: form.description,
        team_count: form.team_count,
        team_size: form.team_size,
        rounds: rounds.map(r => ({
          title: r.title,
          game_mode: r.game_mode,
          map: r.map,
          rules_presets: r.rules_presets,
          custom_rules_text: r.custom_rules_text,
        })),
      })
      navigate(`/c/${slug}/sessions/${r.data.id}`)
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to create session.')
      setBusy(false)
    }
  }

  const maxPlayers = form.team_count * form.team_size

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          New Session
        </div>
        <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--white)', letterSpacing: '0.04em' }}>
          Create Session
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Session Details */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 28, marginBottom: 16 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 18 }}>Session Details</div>
          <div className="form-group">
            <label>Session Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Friday Night Rebirth" required maxLength={80} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} maxLength={400} placeholder="Optional session info" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Teams</label>
              <input type="number" min={2} max={20} value={form.team_count} onChange={e => setForm(f => ({ ...f, team_count: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Team Size</label>
              <input type="number" min={1} max={20} value={form.team_size} onChange={e => setForm(f => ({ ...f, team_size: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Max Players</label>
              <input value={maxPlayers} readOnly style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--muted)', lineHeight: 1.8 }}>
            Teams: {TEAM_NAMES.slice(0, form.team_count).join(', ')}
          </div>
        </div>

        {/* Rounds */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)' }}>Rounds ({rounds.length})</div>
            <button type="button" onClick={addRound} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '5px 12px' }}>+ Add Round</button>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {rounds.map((r, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.8rem', color: 'var(--white)', letterSpacing: '0.1em' }}>Round {i + 1}</div>
                  {rounds.length > 1 && (
                    <button type="button" onClick={() => removeRound(i)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Title</label>
                    <input value={r.title} onChange={e => setRoundField(i, 'title', e.target.value)} placeholder={`Round ${i + 1}`} />
                  </div>
                  <div className="form-group">
                    <label>Map</label>
                    <input value={r.map} onChange={e => setRoundField(i, 'map', e.target.value)} placeholder="e.g. Rebirth Island" />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Rules Presets</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {ALL_PRESETS.map(p => {
                      const active = r.rules_presets.includes(p)
                      return (
                        <button type="button" key={p} onClick={() => togglePreset(i, p)} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.1em', padding: '5px 12px', border: `1px solid ${active ? 'var(--red2)' : 'var(--border2)'}`, background: active ? 'rgba(180,20,20,0.15)' : 'transparent', color: active ? 'var(--white)' : 'var(--muted)', cursor: 'pointer' }}>
                          {p}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Custom Notes</label>
                  <textarea value={r.custom_rules_text} onChange={e => setRoundField(i, 'custom_rules_text', e.target.value)} placeholder='e.g. "No camping fire station", "Final circle trickshot only"' rows={2} maxLength={500} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy || !communityId} style={{ width: '100%', justifyContent: 'center' }}>
          {busy ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  )
}
