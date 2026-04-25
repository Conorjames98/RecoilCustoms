const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const requireAuth = require('../middleware/auth')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const DISCORD_API = 'https://discord.com/api/v10'
const BOT_PERMISSIONS = 8 // Administrator — simplest for setup

// GET /api/bot/auth/url — returns Discord OAuth2 URL for adding bot / logging in
router.get('/auth/url', requireAuth, (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/bot/auth/callback`,
    response_type: 'code',
    scope: 'identify guilds',
    state: req.user.id
  })
  res.json({ url: `https://discord.com/oauth2/authorize?${params}` })
})

// GET /api/bot/auth/callback — Discord redirects here after OAuth
router.get('/auth/callback', async (req, res) => {
  const { code, state: userId } = req.query
  if (!code || !userId) return res.redirect(`${process.env.FRONTEND_URL}/bot?error=missing_params`)

  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.BACKEND_URL}/api/bot/auth/callback`
    })
  })

  const tokens = await tokenRes.json()
  if (!tokens.access_token) return res.redirect(`${process.env.FRONTEND_URL}/bot?error=oauth_failed`)

  // Fetch guilds where user is admin
  const guildsRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  })
  const guilds = await guildsRes.json()

  // Store discord access token against user profile
  const adminGuilds = guilds.filter(g => (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8))

  await supabase.from('profiles').update({
    discord_access_token: tokens.access_token,
    discord_guilds: adminGuilds.map(g => ({ id: g.id, name: g.name, icon: g.icon }))
  }).eq('id', userId)

  res.redirect(`${process.env.FRONTEND_URL}/bot`)
})

// GET /api/bot/guilds — guilds user admins that have the bot
router.get('/guilds', requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('discord_guilds')
    .eq('id', req.user.id)
    .single()

  if (!profile?.discord_guilds) return res.json({ guilds: [], needsAuth: true })

  // Check which guilds have the bot by fetching bot guild list
  let botGuildIds = new Set()
  try {
    const botGuildsRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` }
    })
    const botGuilds = await botGuildsRes.json()
    botGuildIds = new Set(botGuilds.map(g => g.id))
  } catch {}

  const guilds = profile.discord_guilds.map(g => ({
    ...g,
    hasBot: botGuildIds.has(g.id),
    inviteUrl: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=${BOT_PERMISSIONS}&scope=bot+applications.commands&guild_id=${g.id}`
  }))

  res.json({ guilds })
})

// GET /api/bot/:guildId/settings
router.get('/:guildId/settings', requireAuth, async (req, res) => {
  await assertAdmin(req.user.id, req.params.guildId, res, async () => {
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
  await assertAdmin(req.user.id, req.params.guildId, res, async () => {
    const allowed = ['xp_enabled', 'xp_per_message', 'xp_cooldown_seconds', 'welcome_enabled',
      'welcome_channel_id', 'welcome_message', 'automod_bad_words', 'automod_spam_enabled',
      'automod_invite_links_enabled', 'automod_spam_threshold', 'mod_role_id', 'log_channel_id']

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

async function assertAdmin(userId, guildId, res, fn) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('discord_guilds')
    .eq('id', userId)
    .single()

  const isAdmin = profile?.discord_guilds?.some(g => g.id === guildId)
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
