const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const requireAuth = require('../middleware/auth')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const DISCORD_API = 'https://discord.com/api/v10'

// GET /api/lfg — list open posts
router.get('/', async (req, res) => {
  const { mode, platform } = req.query
  let query = supabase
    .from('lfg_posts')
    .select('*, profiles(username, avatar, discord_id), lfg_members(user_id, profiles(username, avatar, discord_id))')
    .eq('status', 'open')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(50)

  if (mode) query = query.eq('mode', mode)
  if (platform) query = query.eq('platform', platform)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/lfg — create post
router.post('/', requireAuth, async (req, res) => {
  const { mode, platform, slots_needed, mic_required, note } = req.body
  if (!mode || !slots_needed) return res.status(400).json({ error: 'mode and slots_needed required' })

  const { data, error } = await supabase
    .from('lfg_posts')
    .insert({ user_id: req.user.id, mode, platform: platform || 'Any', slots_needed, mic_required: !!mic_required, note })
    .select('*, profiles(username, avatar, discord_id)')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Notify Discord if guild has lfg channel configured
  notifyDiscord(data).catch(() => {})

  res.json(data)
})

// POST /api/lfg/:id/join
router.post('/:id/join', requireAuth, async (req, res) => {
  const { data: post } = await supabase.from('lfg_posts').select('*').eq('id', req.params.id).single()
  if (!post) return res.status(404).json({ error: 'Post not found' })
  if (post.status !== 'open') return res.status(400).json({ error: 'Post is no longer open' })
  if (post.user_id === req.user.id) return res.status(400).json({ error: 'You created this post' })
  if (post.slots_filled >= post.slots_needed) return res.status(400).json({ error: 'Party is full' })

  const { error } = await supabase.from('lfg_members').insert({ post_id: req.params.id, user_id: req.user.id })
  if (error) return res.status(400).json({ error: 'Already joined' })

  const newFilled = post.slots_filled + 1
  const newStatus = newFilled >= post.slots_needed ? 'full' : 'open'
  await supabase.from('lfg_posts').update({ slots_filled: newFilled, status: newStatus }).eq('id', req.params.id)

  res.json({ ok: true })
})

// POST /api/lfg/:id/leave
router.post('/:id/leave', requireAuth, async (req, res) => {
  const { data: post } = await supabase.from('lfg_posts').select('slots_filled').eq('id', req.params.id).single()
  if (!post) return res.status(404).json({ error: 'Not found' })

  await supabase.from('lfg_members').delete().eq('post_id', req.params.id).eq('user_id', req.user.id)
  await supabase.from('lfg_posts').update({ slots_filled: Math.max(0, post.slots_filled - 1), status: 'open' }).eq('id', req.params.id)

  res.json({ ok: true })
})

// DELETE /api/lfg/:id — close own post
router.delete('/:id', requireAuth, async (req, res) => {
  await supabase.from('lfg_posts').update({ status: 'closed' }).eq('id', req.params.id).eq('user_id', req.user.id)
  res.json({ ok: true })
})

async function notifyDiscord(post) {
  // Find all guilds with an lfg_channel_id set
  const { data: settings } = await supabase
    .from('bot_settings')
    .select('guild_id, lfg_channel_id')
    .not('lfg_channel_id', 'is', null)

  if (!settings?.length) return

  const embed = {
    color: 0xff4444,
    title: `🎮 LFG — ${post.mode}`,
    description: `**${post.profiles.username}** is looking for **${post.slots_needed}** player${post.slots_needed > 1 ? 's' : ''}${post.note ? `\n📝 ${post.note}` : ''}`,
    fields: [
      { name: 'Platform', value: post.platform, inline: true },
      { name: 'Slots', value: `${post.slots_needed}`, inline: true },
      { name: 'Mic', value: post.mic_required ? 'Required' : 'Optional', inline: true },
    ],
    footer: { text: 'Join at recoilcustoms.com/lfg' },
    timestamp: new Date().toISOString()
  }

  for (const s of settings) {
    await fetch(`${DISCORD_API}/channels/${s.lfg_channel_id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    }).catch(() => {})
  }
}

module.exports = router
