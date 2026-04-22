import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

const PRESETS = ['Anything Goes', 'Knives Only', 'Snipers Only', 'Shotguns Only', 'Pistols Only', 'No Killstreaks', 'Ground Loot Only', 'Custom']
const TEAM_NAMES = ['Alpha','Bravo','Charlie','Delta','Echo','Foxtrot','Golf','Hotel','India','Juliet','Kilo','Lima','Mike','November','Oscar','Papa']

export default function CreateSessionPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [communityId, setCommunityId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    max_players: 60,
    team_count: 2,
    round_count: 3,
    rules_preset: 'Anything Goes',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/communities/${slug}`).then(r => setCommunityId(r.data.id)).catch(() => setError('Community not found.'))
  }, [slug])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!communityId) return
    setBusy(true); setError('')
    try {
      const rounds = Array.from({ length: form.round_count }, (_, i) => ({
        title: `Round ${i + 1}`,
        game_mode: 'Warzone',
        rules_presets: [form.rules_preset],
      }))
      const r = await api.post('/sessions', {
        community_id: communityId,
        title: form.title,
        description: form.description,
        team_count: form.team_count,
        rounds,
      })
      navigate(`/c/${slug}/sessions/${r.data.id}`)
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to create session.')
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          New Session
        </div>
        <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--white)', letterSpacing: '0.04em' }}>
          Create Session
        </h1>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Session Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Friday Night Duos" required maxLength={80} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} maxLength={400} placeholder="Optional session info" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 0 }}>
            <div className="form-group">
              <label>Max Players</label>
              <input type="number" min={2} max={150} value={form.max_players} onChange={e => set('max_players', +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Teams</label>
              <input type="number" min={2} max={20} value={form.team_count} onChange={e => set('team_count', +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Rounds</label>
              <input type="number" min={1} max={20} value={form.round_count} onChange={e => set('round_count', +e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Rules Preset</label>
            <select value={form.rules_preset} onChange={e => set('rules_preset', e.target.value)}>
              {PRESETS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border2)', padding: '14px 16px', marginBottom: 20, fontSize: '0.62rem', color: 'var(--muted)', lineHeight: 1.8 }}>
            {form.round_count} round{form.round_count !== 1 ? 's' : ''} will be created automatically.
            Teams will be named Alpha through {['Alpha','Bravo','Charlie','Delta','Echo','Foxtrot','Golf','Hotel','India','Juliet','Kilo','Lima','Mike','November','Oscar','Papa','Quebec','Romeo','Sierra','Tango'][form.team_count - 1] || 'Tango'}.
          </div>

          {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
            {busy ? 'Creating...' : 'Create Session'}
          </button>
        </form>
      </div>
    </div>
  )
}
