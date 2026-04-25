const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const requireAuth = require('../middleware/auth')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const DISCORD_API = 'https://discord.com/api/v10'
const BOT_PERMISSIONS = 8

// GET /api/bot/guilds — guilds the user admins, cross-referenced with bot membership
router.get('/guilds', requireAuth, async (req, res) => {
  const accessToken = req.headers['x-discord-token']
  if (!accessToken) return res.json({ guilds: [], needsRelogin: true })

  // Fetch user's guilds from Discord
  let userGuilds = []
  try {
    const r = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!r.ok) return res.json({ guilds: [], needsRelogin: true })
    userGuilds = await r.json()
  } catch {
    return res.json({ guilds: [], needsRelogin: true })
  }

  const adminGuilds = userGuilds.filter(g => (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8))

  // Check which guilds have the bot
  let botGuildIds = new Set()
  try {
    const r = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` }
    })
    const botGuilds = await r.json()
    botGuildIds = new Set(botGuilds.map(g => g.id))
  } catch {}

  const guilds = adminGuilds.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    hasBot: botGuildIds.has(g.id),
    inviteUrl: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT}&permissions=${BOT_PERMISSIONS}&scope=bot+applications.commands&guild_id=${g.id}`
  }))

  res.json({ guilds })
})

// GET /api/bot/:guildId/channels — fetch text channels for the guild
router.get('/:guildId/channels', requireAuth, async (req, res) => {
  await assertAdmin(req.headers['x-discord-token'], req.params.guildId, res, async () => {
    const r = await fetch(`${DISCORD_API}/guilds/${req.params.guildId}/channels`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` }
    })
    const channels = await r.json()
    console.log('channels raw:', JSON.stringify(channels).slice(0, 300))
    if (!Array.isArray(channels)) return res.json({ channels: [] })
    const text = channels
      .filter(c => c.type === 0)
      .sort((a, b) => a.position - b.position)
      .map(c => ({ id: c.id, name: c.name }))
    res.json({ channels: text })
  })
})

// GET /api/bot/:guildId/roles — fetch roles for the guild
router.get('/:guildId/roles', requireAuth, async (req, res) => {
  await assertAdmin(req.headers['x-discord-token'], req.params.guildId, res, async () => {
    const r = await fetch(`${DISCORD_API}/guilds/${req.params.guildId}/roles`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` }
    })
    const roles = await r.json()
    const filtered = roles
      .filter(r => r.name !== '@everyone')
      .sort((a, b) => b.position - a.position)
      .map(r => ({ id: r.id, name: r.name }))
    res.json({ roles: filtered })
  })
})

// GET /api/bot/:guildId/settings
router.get('/:guildId/settings', requireAuth, async (req, res) => {
  await assertAdmin(req.headers['x-discord-token'], req.params.guildId, res, async () => {
    const { data } = await supabase
      .from('bot_settings')
      .select('*')
      .eq('guild_id', req.params.guildId)
      .single()

    res.json({ settings: data || defaultSettings(req.params.guildId) })
  })
})

// PATCH /api/bot/:guildId/settings
router.patch('/:guildId/settings', requireAuth, async (req, res) => {
  await assertAdmin(req.headers['x-discord-token'], req.params.guildId, res, async () => {
    const allowed = ['xp_enabled', 'xp_per_message', 'xp_cooldown_seconds', 'welcome_enabled',
      'welcome_channel_id', 'welcome_message', 'automod_bad_words', 'automod_spam_enabled',
      'automod_spam_threshold', 'automod_invite_links_enabled', 'mod_role_id', 'log_channel_id']

    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const { data, error } = await supabase
      .from('bot_settings')
      .upsert({ guild_id: req.params.guildId, ...updates }, { onConflict: 'guild_id' })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    res.json({ settings: data })
  })
})

async function assertAdmin(accessToken, guildId, res, fn) {
  if (!accessToken) return res.status(403).json({ error: 'Missing Discord token' })

  let isAdmin = false
  try {
    const r = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const guilds = await r.json()
    isAdmin = guilds.some(g => g.id === guildId && (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8))
  } catch {}

  if (!isAdmin) return res.status(403).json({ error: 'Not an admin of this server' })
  await fn()
}

function defaultSettings(guildId) {
  return {
    guild_id: guildId,
    xp_enabled: true,
    xp_per_message: 10,
    xp_cooldown_seconds: 60,
    welcome_enabled: true,
    welcome_channel_id: null,
    welcome_message: 'Welcome {user} to {server}! 🎮',
    automod_bad_words: [],
    automod_spam_enabled: true,
    automod_spam_threshold: 5,
    automod_invite_links_enabled: true,
    mod_role_id: null,
    log_channel_id: null
  }
}

module.exports = router
