import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private', desc: 'Only visible to members. Invite by link.' },
  { value: 'public', label: 'Public', desc: 'Searchable and discoverable by anyone.' },
  { value: 'featured', label: 'Featured Eligible', desc: 'Opted in to be featured on the homepage.' },
]

export default function CreateCommunityPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', slug: '', description: '', rules: '', visibility: 'private' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {})
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await api.post('/communities', form)
      navigate(`/c/${form.slug}`)
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to create community.')
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 1, background: 'var(--red2)', display: 'inline-block' }} />
          New Community
        </div>
        <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--white)', letterSpacing: '0.04em' }}>
          Create Community
        </h1>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Community Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Friday Night Customs" required maxLength={60} />
          </div>

          <div className="form-group">
            <label>Slug (URL)</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border2)' }}>
              <span style={{ padding: '10px 12px', fontSize: '0.72rem', color: 'var(--muted)', borderRight: '1px solid var(--border2)', whiteSpace: 'nowrap' }}>recoil/c/</span>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="friday-customs" required maxLength={40} style={{ border: 'none' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="What's this community about?" rows={3} maxLength={500} />
          </div>

          <div className="form-group">
            <label>Community Rules</label>
            <textarea name="rules" value={form.rules} onChange={handleChange} placeholder="e.g. No teaming, no camping main building, respect all players..." rows={4} maxLength={1000} />
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
              {VISIBILITY_OPTIONS.map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', border: `1px solid ${form.visibility === opt.value ? 'var(--red2)' : 'var(--border2)'}`, cursor: 'pointer', background: form.visibility === opt.value ? 'rgba(180,20,20,0.06)' : 'transparent', marginBottom: 0 }}
                  onClick={() => setForm(f => ({ ...f, visibility: opt.value }))}>
                  <div style={{ width: 14, height: 14, border: `2px solid ${form.visibility === opt.value ? 'var(--red2)' : 'var(--border2)'}`, borderRadius: '50%', marginTop: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {form.visibility === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red2)' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--white)', letterSpacing: '0.1em', marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)', lineHeight: 1.6 }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {busy ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      </div>
    </div>
  )
}
