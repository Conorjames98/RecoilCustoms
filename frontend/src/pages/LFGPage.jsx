import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const MODES = ['Warzone', 'Resurgence', 'Multiplayer', 'Zombies', 'Customs']
const PLATFORMS = ['Any', 'PC', 'PlayStation', 'Xbox']

function timeAgo(date) {
  const diff = Date.now() - new Date(date)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

function PostCard({ post, userId, onJoin, onLeave, onClose }) {
  const isOwner = post.user_id === userId
  const isMember = post.lfg_members?.some(m => m.user_id === userId)
  const isFull = post.slots_filled >= post.slots_needed

  return (
    <div style={{
      background: 'var(--ink)', border: '1px solid var(--rule2)',
      borderLeft: `3px solid ${isFull ? 'var(--muted)' : 'var(--red)'}`,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12,
      opacity: isFull ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {post.profiles?.avatar
            ? <img src={`https://cdn.discordapp.com/avatars/${post.profiles.discord_id}/${post.profiles.avatar}.png`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--rule2)' }} />
            : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--rule2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>{post.profiles?.username?.[0]?.toUpperCase()}</span>
              </div>
          }
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)' }}>{post.profiles?.username}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>{timeAgo(post.created_at)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <Tag>{post.mode}</Tag>
          <Tag>{post.platform}</Tag>
          {post.mic_required && <Tag red>🎙 Mic</Tag>}
          <Tag>{post.slots_filled}/{post.slots_needed} filled</Tag>
        </div>
      </div>

      {post.note && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, borderLeft: '2px solid var(--rule2)', paddingLeft: 12 }}>
          {post.note}
        </div>
      )}

      {post.lfg_members?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>PARTY:</span>
          {post.lfg_members.map(m => (
            <div key={m.user_id} title={m.profiles?.username} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--rule2)', overflow: 'hidden', background: 'var(--rule2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.profiles?.avatar
                ? <img src={`https://cdn.discordapp.com/avatars/${m.profiles.discord_id}/${m.profiles.avatar}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '0.5rem', color: 'var(--muted)' }}>{m.profiles?.username?.[0]?.toUpperCase()}</span>
              }
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {isOwner
          ? <button onClick={() => onClose(post.id)} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '6px 14px', color: 'var(--red)' }}>Close Post</button>
          : isMember
          ? <button onClick={() => onLeave(post.id)} className="btn-ghost" style={{ fontSize: '0.55rem', padding: '6px 14px' }}>Leave</button>
          : !isFull && <button onClick={() => onJoin(post.id)} className="btn-red" style={{ fontSize: '0.55rem', padding: '6px 14px' }}>Join Up</button>
        }
      </div>
    </div>
  )
}

function Tag({ children, red }) {
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em',
      textTransform: 'uppercase', padding: '3px 8px',
      background: red ? 'rgba(255,10,32,0.1)' : 'var(--black)',
      border: `1px solid ${red ? 'rgba(255,10,32,0.3)' : 'var(--rule2)'}`,
      color: red ? 'var(--red)' : 'var(--muted)',
    }}>{children}</span>
  )
}

export default function LFGPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ mode: 'Warzone', platform: 'Any', slots_needed: 2, mic_required: false, note: '' })
  const [posting, setPosting] = useState(false)

  function load() {
    const params = new URLSearchParams()
    if (filterMode) params.set('mode', filterMode)
    if (filterPlatform) params.set('platform', filterPlatform)
    api.get(`/lfg?${params}`).then(r => setPosts(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterMode, filterPlatform])

  async function submit(e) {
    e.preventDefault()
    setPosting(true)
    try {
      const { data } = await api.post('/lfg', form)
      setPosts(p => [data, ...p])
      setShowForm(false)
      setForm({ mode: 'Warzone', platform: 'Any', slots_needed: 2, mic_required: false, note: '' })
    } finally { setPosting(false) }
  }

  async function join(id) {
    await api.post(`/lfg/${id}/join`)
    load()
  }

  async function leave(id) {
    await api.post(`/lfg/${id}/leave`)
    load()
  }

  async function close(id) {
    await api.delete(`/lfg/${id}`)
    setPosts(p => p.filter(x => x.id !== id))
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8 }}>Looking For Group</div>
          <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1 }}>Find Your Squad</h1>
        </div>
        {user && (
          <button onClick={() => setShowForm(s => !s)} className="btn-red" style={{ fontSize: '0.62rem', padding: '10px 22px' }}>
            {showForm ? 'Cancel' : '+ Post LFG'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={submit} style={{ background: 'var(--ink)', border: '1px solid var(--rule)', padding: 28, marginBottom: 28 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 20 }}>New LFG Post</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Mode</label>
              <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                {MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Platform</label>
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Slots Needed</label>
              <select value={form.slots_needed} onChange={e => setForm(f => ({ ...f, slots_needed: parseInt(e.target.value) }))}>
                {[1,2,3].map(n => <option key={n} value={n}>{n} player{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
              <input type="checkbox" id="mic" checked={form.mic_required} onChange={e => setForm(f => ({ ...f, mic_required: e.target.checked }))} style={{ width: 16, height: 16 }} />
              <label htmlFor="mic" style={{ margin: 0, cursor: 'pointer' }}>Mic Required</label>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Note (optional)</label>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Diamond+ only, chill vibes..." maxLength={120} />
          </div>
          <button type="submit" className="btn-red" disabled={posting} style={{ fontSize: '0.62rem', padding: '10px 24px' }}>
            {posting ? 'Posting...' : 'Post LFG'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={filterMode} onChange={e => setFilterMode(e.target.value)} style={{ background: 'var(--ink)', border: '1px solid var(--rule2)', color: filterMode ? 'var(--white)' : 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', padding: '7px 12px', outline: 'none' }}>
          <option value="">All Modes</option>
          {MODES.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ background: 'var(--ink)', border: '1px solid var(--rule2)', color: filterPlatform ? 'var(--white)' : 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', padding: '7px 12px', outline: 'none' }}>
          <option value="">All Platforms</option>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <button onClick={load} className="btn-ghost" style={{ fontSize: '0.58rem', padding: '7px 14px' }}>Refresh</button>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.52rem', color: 'var(--muted)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          {posts.length} open post{posts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="spinner" />
      ) : posts.length === 0 ? (
        <div style={{ border: '1px solid var(--rule)', padding: '64px 32px', textAlign: 'center', background: 'var(--ink)' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 10 }}>No LFG Posts</div>
          <p style={{ fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.8 }}>Be the first to post — click <strong>+ Post LFG</strong> above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map(p => (
            <PostCard key={p.id} post={p} userId={user?.id} onJoin={join} onLeave={leave} onClose={close} />
          ))}
        </div>
      )}
    </div>
  )
}
