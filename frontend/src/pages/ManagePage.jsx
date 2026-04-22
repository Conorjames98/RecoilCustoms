import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function ManagePage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [members, setMembers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({ name: '', description: '', rules: '', visibility: 'private', discord_url: '', twitter_url: '' })
  const [annForm, setAnnForm] = useState({ title: '', body: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/communities/${slug}`),
      api.get(`/communities/${slug}/members`),
      api.get(`/communities/${slug}/announcements`).catch(() => ({ data: [] }))
    ]).then(([c, m, a]) => {
      const comm = c.data
      if (comm.membership?.role !== 'owner' && comm.membership?.role !== 'mod') {
        navigate(`/c/${slug}`)
        return
      }
      setCommunity(comm)
      setForm({ name: comm.name, description: comm.description || '', rules: comm.rules || '', visibility: comm.visibility || 'private', discord_url: comm.discord_url || '', twitter_url: comm.twitter_url || '' })
      setMembers(m.data.map(m => ({ ...m.users, role: m.role })))
      setAnnouncements(a.data)
    }).finally(() => setLoading(false))
  }, [slug])

  async function saveSettings(e) {
    e.preventDefault()
    setBusy(true); setMsg(''); setError('')
    try {
      await api.patch(`/communities/${slug}`, form)
      setCommunity(c => ({ ...c, ...form }))
      setMsg('Saved.')
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to save.')
    } finally { setBusy(false) }
  }

  async function postAnnouncement(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const r = await api.post(`/communities/${slug}/announcements`, { content: [annForm.title, annForm.body].filter(Boolean).join('\n\n') })
      setAnnouncements(a => [r.data, ...a])
      setAnnForm({ title: '', body: '' })
    } catch {} finally { setBusy(false) }
  }

  async function setRole(memberId, role) {
    try {
      const backendRole = role === 'mod' ? 'moderator' : role
      await api.patch(`/communities/${slug}/members/${memberId}`, { role: backendRole })
      setMembers(ms => ms.map(m => m.id === memberId ? { ...m, role: backendRole } : m))
    } catch {}
  }

  async function removeMember(memberId) {
    try {
      await api.delete(`/communities/${slug}/members/${memberId}`)
      setMembers(ms => ms.filter(m => m.id !== memberId))
    } catch {}
  }

  if (loading) return <div className="spinner" />

  const tabs = ['overview', 'members', 'announcements']

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          Manage
        </div>
        <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--white)', letterSpacing: '0.04em' }}>{community?.name}</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 32 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', padding: '8px 16px', border: '1px solid', borderColor: tab === t ? 'var(--red2)' : 'var(--border2)', background: tab === t ? 'var(--red)' : 'transparent', color: tab === t ? '#fff' : 'var(--muted)', cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 32 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 20 }}>Community Settings</div>
          <form onSubmit={saveSettings}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="form-group">
              <label>Community Rules</label>
              <textarea value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))} rows={4} placeholder="e.g. No teaming, respect all players..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Discord URL</label>
                <input value={form.discord_url} onChange={e => setForm(f => ({ ...f, discord_url: e.target.value }))} placeholder="https://discord.gg/..." />
              </div>
              <div className="form-group">
                <label>Twitter URL</label>
                <input value={form.twitter_url} onChange={e => setForm(f => ({ ...f, twitter_url: e.target.value }))} placeholder="https://twitter.com/..." />
              </div>
            </div>
            <div className="form-group">
              <label>Visibility</label>
              <select value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
                <option value="private">Private — invite only</option>
                <option value="public">Public — searchable</option>
                <option value="featured">Featured eligible</option>
              </select>
            </div>
            {msg && <p className="success-msg" style={{ marginBottom: 12 }}>{msg}</p>}
            {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'members' && (
        <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {members.map(m => (
            <div key={m.id} style={{ background: 'var(--bg)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {m.avatar && <img src={`https://cdn.discordapp.com/avatars/${m.discord_id}/${m.avatar}.png`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border2)' }} />}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--white)' }}>{m.username}</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{m.role}</div>
                </div>
              </div>
              {m.role !== 'owner' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {m.role !== 'moderator' && <button onClick={() => setRole(m.id, 'mod')} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 10px' }}>Make Mod</button>}
                  {m.role === 'moderator' && <button onClick={() => setRole(m.id, 'member')} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 10px' }}>Remove Mod</button>}
                  <button onClick={() => removeMember(m.id)} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 10px', color: 'var(--red2)' }}>Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'announcements' && (
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 28, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.14em', color: 'var(--white)', marginBottom: 16 }}>Post Announcement</div>
            <form onSubmit={postAnnouncement}>
              <div className="form-group">
                <label>Title</label>
                <input value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea value={annForm.body} onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))} rows={3} />
              </div>
              <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Posting...' : 'Post'}</button>
            </form>
          </div>
          <div style={{ display: 'grid', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {announcements.map(a => (
              <div key={a.id} style={{ background: 'var(--bg)', padding: '20px 24px' }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: 'var(--white)', marginBottom: 6 }}>{a.title}</div>
                <p style={{ fontSize: '0.68rem', color: 'var(--khaki)', lineHeight: 1.7 }}>{a.body}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <div style={{ background: 'var(--bg)', padding: '32px 24px', textAlign: 'center', fontSize: '0.68rem', color: 'var(--muted)' }}>No announcements yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
