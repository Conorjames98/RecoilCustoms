import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function CreateCommunityPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
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
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface)', border: '1px solid var(--border2)' }}>
              <span style={{ padding: '10px 12px', fontSize: '0.75rem', color: 'var(--muted)', borderRight: '1px solid var(--border2)', whiteSpace: 'nowrap' }}>recoil/c/</span>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="friday-customs" required maxLength={40} style={{ border: 'none', borderRadius: 0 }} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="What's this community about?" rows={4} maxLength={500} />
          </div>
          {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
            {busy ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      </div>
    </div>
  )
}
