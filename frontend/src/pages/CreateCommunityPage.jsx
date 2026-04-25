import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

const TAGS = ['Warzone', 'Resurgence', 'Multiplayer', 'Zombies', 'Customs', 'Ranked', 'Casual', 'Tournaments', 'Scrims', 'Xbox', 'PlayStation', 'PC', 'Cross-Play', '18+', 'Chill', 'Competitive']

const DEFAULT_RULES = [
  'No cheating or hacking',
  'Respect all players',
  'No team killing',
  'Follow the host instructions',
  'No stream sniping',
]

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private', desc: 'Invite only', icon: '🔒' },
  { value: 'public', label: 'Public', desc: 'Anyone can find & join', icon: '🌍' },
  { value: 'featured', label: 'Featured', desc: 'Eligible for homepage', icon: '⭐' },
]

const STEPS = ['Name', 'Describe', 'Rules', 'Visibility']

export default function CreateCommunityPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    description: '',
    tags: [],
    rules: [...DEFAULT_RULES],
    customRule: '',
    visibility: 'public',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function toggleTag(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }))
  }

  function toggleRule(rule) {
    setForm(f => ({
      ...f,
      rules: f.rules.includes(rule) ? f.rules.filter(r => r !== rule) : [...f.rules, rule]
    }))
  }

  function addCustomRule() {
    const r = form.customRule.trim()
    if (!r || form.rules.includes(r)) return
    setForm(f => ({ ...f, rules: [...f.rules, r], customRule: '' }))
  }

  async function submit() {
    setBusy(true); setError('')
    const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const description = [form.description, form.tags.length ? `Tags: ${form.tags.join(', ')}` : ''].filter(Boolean).join('\n')
    const rules = form.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')
    try {
      await api.post('/communities', { name: form.name, slug, description, rules, visibility: form.visibility })
      navigate(`/c/${slug}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create community.')
      setBusy(false)
    }
  }

  const canNext = [
    form.name.trim().length >= 2,
    true,
    true,
    true,
  ][step]

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px' }}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < step ? 'var(--red)' : i === step ? 'var(--red)' : 'var(--rule2)',
              border: `2px solid ${i <= step ? 'var(--red)' : 'var(--rule2)'}`,
              transition: 'all 0.3s',
              boxShadow: i === step ? '0 0 16px rgba(255,45,68,0.4)' : 'none',
            }}>
              {i < step
                ? <span style={{ color: '#fff', fontSize: '0.7rem' }}>✓</span>
                : <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', color: i === step ? '#fff' : 'var(--muted)' }}>{i + 1}</span>
              }
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--red)' : 'var(--rule2)', margin: '0 8px', transition: 'background 0.3s' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div key={step} style={{ animation: 'reveal 0.3s ease both' }}>

        {step === 0 && (
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>Step 1</div>
            <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--white)', letterSpacing: '0.03em', lineHeight: 1, marginBottom: 8 }}>
              Name your community
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 36 }}>
              Pick something your squad will recognise. You can change this later.
            </p>
            <input
              autoFocus
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Friday Night Customs"
              maxLength={60}
              onKeyDown={e => e.key === 'Enter' && canNext && setStep(1)}
              style={{ fontSize: '1.1rem', padding: '16px 18px', marginBottom: 8 }}
            />
            {form.name && (
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 28 }}>
                recoilcustoms.com/c/{form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>Step 2</div>
            <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--white)', letterSpacing: '0.03em', lineHeight: 1, marginBottom: 8 }}>
              Describe it
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 28 }}>
              A short line about what you run, then pick some tags.
            </p>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Weekly competitive customs, Diamond+ only, mic required..."
              rows={3} maxLength={200}
              style={{ marginBottom: 24, resize: 'none' }}
            />
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.78rem', padding: '6px 14px',
                    borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: form.tags.includes(tag) ? 'var(--red)' : 'var(--rule2)',
                    color: form.tags.includes(tag) ? '#fff' : 'var(--muted)',
                    transition: 'all 0.15s',
                    boxShadow: form.tags.includes(tag) ? '0 2px 10px rgba(255,45,68,0.3)' : 'none',
                  }}
                >{tag}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>Step 3</div>
            <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--white)', letterSpacing: '0.03em', lineHeight: 1, marginBottom: 8 }}>
              Set the rules
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 28 }}>
              Select from common rules or add your own.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {DEFAULT_RULES.map(rule => (
                <button
                  key={rule}
                  type="button"
                  onClick={() => toggleRule(rule)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.78rem', padding: '6px 14px',
                    borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: form.rules.includes(rule) ? 'var(--red)' : 'var(--rule2)',
                    color: form.rules.includes(rule) ? '#fff' : 'var(--muted)',
                    transition: 'all 0.15s',
                    boxShadow: form.rules.includes(rule) ? '0 2px 10px rgba(255,45,68,0.3)' : 'none',
                  }}
                >{rule}</button>
              ))}
            </div>

            {form.rules.filter(r => !DEFAULT_RULES.includes(r)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {form.rules.filter(r => !DEFAULT_RULES.includes(r)).map(rule => (
                  <button
                    key={rule}
                    type="button"
                    onClick={() => toggleRule(rule)}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.78rem', padding: '6px 14px',
                      borderRadius: '20px', border: '1px solid var(--red)', cursor: 'pointer',
                      background: 'rgba(255,45,68,0.1)', color: 'var(--red)',
                      transition: 'all 0.15s',
                    }}
                  >{rule} ×</button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={form.customRule}
                onChange={e => setForm(f => ({ ...f, customRule: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCustomRule()}
                placeholder="Add a custom rule..."
                maxLength={80}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={addCustomRule} className="btn-ghost" style={{ fontSize: '0.6rem', padding: '10px 16px', flexShrink: 0 }}>Add</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>Step 4</div>
            <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--white)', letterSpacing: '0.03em', lineHeight: 1, marginBottom: 8 }}>
              Who can join?
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 28 }}>
              Control how people find and join your community.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {VISIBILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, visibility: opt.value }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 20px', borderRadius: 'var(--radius)',
                    border: `2px solid ${form.visibility === opt.value ? 'var(--red)' : 'var(--rule2)'}`,
                    background: form.visibility === opt.value ? 'rgba(255,45,68,0.07)' : 'var(--ink)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                    boxShadow: form.visibility === opt.value ? '0 0 20px rgba(255,45,68,0.15)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: "'DM Sans', sans-serif" }}>{opt.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${form.visibility === opt.value ? 'var(--red)' : 'var(--rule2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {form.visibility === opt.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
        {step > 0
          ? <button onClick={() => setStep(s => s - 1)} className="btn-ghost" style={{ fontSize: '0.62rem', padding: '10px 20px' }}>← Back</button>
          : <div />
        }
        {step < STEPS.length - 1
          ? <button onClick={() => setStep(s => s + 1)} className="btn-red" disabled={!canNext} style={{ fontSize: '0.62rem', padding: '10px 24px' }}>Continue →</button>
          : <button onClick={submit} className="btn-red" disabled={busy || !form.name.trim()} style={{ fontSize: '0.62rem', padding: '10px 24px' }}>
              {busy ? 'Creating...' : 'Create Community →'}
            </button>
        }
      </div>
      {error && <p className="error-msg" style={{ marginTop: 12, textAlign: 'right' }}>{error}</p>}
    </div>
  )
}
