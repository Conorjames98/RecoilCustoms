import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

const TABS = ['XP', 'Welcome', 'Automod', 'Moderation']

export default function BotSettingsPage() {
  const { guildId } = useParams()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('XP')
  const [draft, setDraft] = useState({})
  const [discordToken, setDiscordToken] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.provider_token
      setDiscordToken(token)
      api.get(`/bot/${guildId}/settings`, { headers: { 'x-discord-token': token } })
        .then(r => { setSettings(r.data.settings); setDraft(r.data.settings) })
        .finally(() => setLoading(false))
    })
  }, [guildId])

  function set(key, value) {
    setDraft(d => ({ ...d, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      const { data } = await api.patch(`/bot/${guildId}/settings`, draft, { headers: { 'x-discord-token': discordToken } })
      setSettings(data.settings)
      setDraft(data.settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--rule)' }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8 }}>
          Bot Settings
        </div>
        <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1 }}>
          Configure Server
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--rule)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: t === tab ? '2px solid var(--red)' : '2px solid transparent',
              color: t === tab ? 'var(--white)' : 'var(--muted)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.6rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '10px 20px',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {tab === 'XP' && (
          <>
            <Toggle label="XP System" description="Award XP to members for sending messages" value={draft.xp_enabled} onChange={v => set('xp_enabled', v)} />
            <NumberField label="XP Per Message" value={draft.xp_per_message} onChange={v => set('xp_per_message', v)} min={1} max={100} disabled={!draft.xp_enabled} />
            <NumberField label="Cooldown (seconds)" description="Minimum time between XP awards per user" value={draft.xp_cooldown_seconds} onChange={v => set('xp_cooldown_seconds', v)} min={5} max={3600} disabled={!draft.xp_enabled} />
          </>
        )}

        {tab === 'Welcome' && (
          <>
            <Toggle label="Welcome Messages" description="Send a message when a new member joins" value={draft.welcome_enabled} onChange={v => set('welcome_enabled', v)} />
            <TextField label="Welcome Channel ID" description="Paste the channel ID to send welcome messages in (leave blank for system channel)" value={draft.welcome_channel_id || ''} onChange={v => set('welcome_channel_id', v || null)} disabled={!draft.welcome_enabled} />
            <TextareaField label="Welcome Message" description="Use {user} for mention, {server} for server name" value={draft.welcome_message} onChange={v => set('welcome_message', v)} disabled={!draft.welcome_enabled} />
          </>
        )}

        {tab === 'Automod' && (
          <>
            <Toggle label="Anti-Spam" description={`Mute members who send ${draft.automod_spam_threshold}+ messages in 5 seconds`} value={draft.automod_spam_enabled} onChange={v => set('automod_spam_enabled', v)} />
            <NumberField label="Spam Threshold" description="Messages in 5 seconds before action" value={draft.automod_spam_threshold} onChange={v => set('automod_spam_threshold', v)} min={2} max={20} disabled={!draft.automod_spam_enabled} />
            <Toggle label="Block Invite Links" description="Delete messages containing Discord invite links" value={draft.automod_invite_links_enabled} onChange={v => set('automod_invite_links_enabled', v)} />
            <BadWordsField value={draft.automod_bad_words || []} onChange={v => set('automod_bad_words', v)} />
          </>
        )}

        {tab === 'Moderation' && (
          <>
            <TextField label="Mod Role ID" description="Role ID that grants moderation permissions to bot commands" value={draft.mod_role_id || ''} onChange={v => set('mod_role_id', v || null)} />
            <TextField label="Log Channel ID" description="Channel to send mod action logs" value={draft.log_channel_id || ''} onChange={v => set('log_channel_id', v || null)} />
          </>
        )}
      </div>

      {/* Save */}
      <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
        {saved && (
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', color: '#4ade80', letterSpacing: '0.1em' }}>
            Saved ✓
          </span>
        )}
        <button className="btn-red" onClick={save} disabled={saving} style={{ fontSize: '0.65rem', padding: '10px 28px' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function Toggle({ label, description, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--ink)', border: '1px solid var(--rule2)', gap: 16 }}>
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)' }}>{label}</div>
        {description && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.55rem', color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
          background: value ? 'var(--red)' : 'var(--rule2)',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18,
          borderRadius: '50%', background: 'var(--white)', transition: 'left 0.2s',
        }} />
      </button>
    </div>
  )
}

function NumberField({ label, description, value, onChange, min, max, disabled }) {
  return (
    <div style={{ padding: '20px', background: 'var(--ink)', border: '1px solid var(--rule2)', opacity: disabled ? 0.5 : 1 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>{label}</div>
      {description && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.55rem', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>{description}</div>}
      <input
        type="number" min={min} max={max} value={value || ''} disabled={disabled}
        onChange={e => onChange(parseInt(e.target.value) || min)}
        style={{ background: 'var(--black)', border: '1px solid var(--rule)', color: 'var(--white)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', padding: '8px 12px', width: 120, outline: 'none' }}
      />
    </div>
  )
}

function TextField({ label, description, value, onChange, disabled }) {
  return (
    <div style={{ padding: '20px', background: 'var(--ink)', border: '1px solid var(--rule2)', opacity: disabled ? 0.5 : 1 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>{label}</div>
      {description && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.55rem', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>{description}</div>}
      <input
        type="text" value={value || ''} disabled={disabled}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. 123456789012345678"
        style={{ background: 'var(--black)', border: '1px solid var(--rule)', color: 'var(--white)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', padding: '8px 12px', width: '100%', maxWidth: 360, outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  )
}

function TextareaField({ label, description, value, onChange, disabled }) {
  return (
    <div style={{ padding: '20px', background: 'var(--ink)', border: '1px solid var(--rule2)', opacity: disabled ? 0.5 : 1 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>{label}</div>
      {description && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.55rem', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>{description}</div>}
      <textarea
        value={value || ''} disabled={disabled}
        onChange={e => onChange(e.target.value)}
        rows={3}
        style={{ background: 'var(--black)', border: '1px solid var(--rule)', color: 'var(--white)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', padding: '8px 12px', width: '100%', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  )
}

function BadWordsField({ value, onChange }) {
  const [input, setInput] = useState('')

  function add() {
    const word = input.trim().toLowerCase()
    if (!word || value.includes(word)) return
    onChange([...value, word])
    setInput('')
  }

  function remove(word) {
    onChange(value.filter(w => w !== word))
  }

  return (
    <div style={{ padding: '20px', background: 'var(--ink)', border: '1px solid var(--rule2)' }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>Blocked Words</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.55rem', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>Messages containing these words will be deleted</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a word..."
          style={{ background: 'var(--black)', border: '1px solid var(--rule)', color: 'var(--white)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', padding: '8px 12px', flex: 1, outline: 'none' }}
        />
        <button className="btn-red" onClick={add} style={{ fontSize: '0.58rem', padding: '8px 16px' }}>Add</button>
      </div>

      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map(w => (
            <span key={w} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.08em', background: 'var(--black)', border: '1px solid var(--rule2)', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {w}
              <button onClick={() => remove(w)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
