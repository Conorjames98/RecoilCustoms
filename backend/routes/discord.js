const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const requireAuth = require('../middleware/auth')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// GET /api/discord/install/:slug — generate bot install URL for community owner
router.get('/install/:slug', requireAuth, async (req, res) => {
  const { data: community } = await supabase
    .from('communities')
    .select('id, owner_id')
    .eq('slug', req.params.slug)
    .single()

  if (!community) return res.status(404).json({ error: 'Community not found' })
  if (community.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorised' })

  const state = Buffer.from(JSON.stringify({ slug: req.params.slug })).toString('base64')

  const url = new URL('https://discord.com/oauth2/authorize')
  url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID)
  url.searchParams.set('permissions', '8') // Administrator
  url.searchParams.set('scope', 'bot applications.commands')
  url.searchParams.set('redirect_uri', `${process.env.BACKEND_URL}/api/discord/callback`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('state', state)

  res.json({ url: url.toString() })
})

// GET /api/discord/callback — Discord redirects here after bot install
router.get('/callback', async (req, res) => {
  const { code, guild_id, state } = req.query

  if (!guild_id || !state) return res.redirect(`${process.env.FRONTEND_URL}?bot=error`)

  try {
    const { slug } = JSON.parse(Buffer.from(state, 'base64').toString())

    await supabase
      .from('communities')
      .update({ guild_id, bot_installed: true })
      .eq('slug', slug)

    res.redirect(`${process.env.FRONTEND_URL}/c/${slug}?bot=installed`)
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}?bot=error`)
  }
})

module.exports = router
