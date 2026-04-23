import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { supabase } from '../lib/supabase'

export default function ManagePage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [members, setMembers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({ name: '', description: '', rules: '', visibility: 'private', discord_url: '', twitter_url: '', banner: '', logo: '' })
  const [annForm, setAnnForm] = useState({ title: '', body: '' })
  const [uploading, setUploading] = useState({ banner: false, logo: false })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/communities/${slug}`),
      api.get(`/communities/${slug}/members`),
      api.get(`/communities/${slug}/announcements`).catch(() => ({ data: [] })),
      api.get(`/communities/${slug}/sessions`).catch(() => ({ data: [] })),
    ]).then(([c, m, a, s]) => {
      const comm = c.data
      if (comm.membership?.role !== 'owner' && comm.membership?.role !== 'mod') {
        navigate(`/c/${slug}`)
        return
      }
      setCommunity(comm)
      setForm({ name: comm.name, description: comm.description || '', rules: comm.rules || '', visibility: comm.visibility || 'private', discord_url: comm.discord_url || '', twitter_url: comm.twitter_url || '', banner: comm.banner || '', logo: comm.logo || '' })
      setMembers(m.data.map(m => ({ ...m.users, role: m.role })))
      setAnnouncements(a.data)
      setSessions(s.data)
    }).finally(() => setLoading(false))
  }, [slug])

  async function uploadImage(file, field) {
    setUploading(u => ({ ...u, [field]: true }))
    const ext = file.name.split('.').pop()
    const path = `${slug}-${field}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('community-images').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('community-images').getPublicUrl(path)
      setForm(f => ({ ...f, [field]: data.publicUrl }))
    } else {
      setError('Upload failed: ' + error.message)
    }
    setUploading(u => ({ ...u, [field]: false }))
  }

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

  async function deleteSession(sessionId) {
    if (!confirm('Delete this session? This cannot be undone.')) return
    try {
      await api.delete(`/sessions/${sessionId}`)
      setSessions(ss => ss.filter(s => s.id !== sessionId))
    } catch {}
  }

  if (loading) return <div className="spinner" />

  const tabs = ['overview', 'members', 'sessions', 'announcements']

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32, borderBottom: '1px solid var(--rule)', paddingBottom: 24 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 18, height: 1, background: 'var(--red)' }} />
          Manage
        </div>
        <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--white)', letterSpacing: '0.04em' }}>{community?.name}</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--rule)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '10px 18px', border: 'none', borderBottom: tab === t ? '2px solid var(--red)' : '2px solid transparent',
            background: 'transparent', color: tab === t ? 'var(--white)' : 'var(--muted)', cursor: 'pointer', marginBottom: -1,
            transition: 'color 0.15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ background: 'var(--ink)', border: '1px solid var(--rule)', padding: 32 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 24 }}>Community Settings</div>
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

            {/* Images */}
            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 24, marginTop: 8, marginBottom: 20 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Branding</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label>Banner Image</label>
                    <input value={form.banner} onChange={e => setForm(f => ({ ...f, banner: e.target.value }))} placeholder="https://..." />
                    <input type="file" accept="image/*" style={{ marginTop: 6, fontSize: '0.62rem', color: 'var(--muted)' }} onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'banner')} />
                    {uploading.banner && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--muted)' }}>Uploading...</span>}
                  </div>
                  {form.banner && (
                    <div style={{ height: 60, background: `url(${form.banner}) center/cover`, border: '1px solid var(--rule2)', marginTop: 4 }} />
                  )}
                  {!form.banner && (
                    <div style={{ height: 60, border: '1px dashed var(--rule2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>NO BANNER</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label>Logo Image</label>
                    <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} placeholder="https://..." />
                    <input type="file" accept="image/*" style={{ marginTop: 6, fontSize: '0.62rem', color: 'var(--muted)' }} onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'logo')} />
                    {uploading.logo && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--muted)' }}>Uploading...</span>}
                  </div>
                  {form.logo ? (
                    <div style={{ width: 60, height: 60, border: '1px solid var(--rule2)', overflow: 'hidden' }}>
                      <img src={form.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: 60, height: 60, border: '1px dashed var(--rule2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.46rem', color: 'var(--muted)' }}>LOGO</span>
                    </div>
                  )}
                </div>
              </div>
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
            <button type="submit" className="btn-red" disabled={busy}>{busy ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'members' && (
        <div style={{ display: 'grid', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
          {members.map(m => (
            <div key={m.id} style={{ background: 'var(--ink)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {m.avatar && <img src={`https://cdn.discordapp.com/avatars/${m.discord_id}/${m.avatar}.png`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--rule2)' }} />}
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em', color: 'var(--white)' }}>{m.username}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.52rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{m.role}</div>
                </div>
              </div>
              {m.role !== 'owner' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {m.role !== 'moderator' && <button onClick={() => setRole(m.id, 'mod')} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 10px' }}>Make Mod</button>}
                  {m.role === 'moderator' && <button onClick={() => setRole(m.id, 'member')} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 10px' }}>Remove Mod</button>}
                  <button onClick={() => removeMember(m.id)} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 10px', color: 'var(--red)' }}>Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </div>
            <Link to={`/c/${slug}/sessions/create`} className="btn-red" style={{ fontSize: '0.58rem', padding: '7px 16px' }}>+ New Session</Link>
          </div>
          {sessions.length === 0 ? (
            <div style={{ border: '1px solid var(--rule)', padding: '48px 32px', textAlign: 'center', background: 'var(--ink)' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 8 }}>No Sessions</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Create a session to start running custom games.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
              {sessions.map(s => (
                <div key={s.id} style={{ background: 'var(--ink)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`status-badge status-${s.status}`} style={{ fontSize: '0.48rem', padding: '2px 7px' }}>{s.status.replace('_', ' ')}</span>
                      {s.scheduled_at && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.52rem', color: 'var(--muted)' }}>{new Date(s.scheduled_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link to={`/c/${slug}/sessions/${s.id}`} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '5px 12px' }}>View</Link>
                    <Link to={`/c/${slug}/sessions/${s.id}/control`} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '5px 12px' }}>Control</Link>
                    <button onClick={() => deleteSession(s.id)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.1em', padding: '5px 12px', background: 'none', border: '1px solid var(--rule2)', color: 'var(--red)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--rule2)'}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'announcements' && (
        <div>
          <div style={{ background: 'var(--ink)', border: '1px solid var(--rule)', padding: 28, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 16 }}>Post Announcement</div>
            <form onSubmit={postAnnouncement}>
              <div className="form-group">
                <label>Title</label>
                <input value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea value={annForm.body} onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))} rows={3} />
              </div>
              <button type="submit" className="btn-red" disabled={busy}>{busy ? 'Posting...' : 'Post'}</button>
            </form>
          </div>
          <div style={{ display: 'grid', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
            {announcements.map(a => (
              <div key={a.id} style={{ background: 'var(--ink)', padding: '20px 24px' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 6 }}>{a.title}</div>
                <p style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: 1.7 }}>{a.body}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <div style={{ background: 'var(--ink)', padding: '32px 24px', textAlign: 'center', fontSize: '0.68rem', color: 'var(--muted)' }}>No announcements yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
