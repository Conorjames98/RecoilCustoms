const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const requireAuth = require('../middleware/auth')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// GET /api/discord/install/:slug — returns static bot invite link
router.get('/install/:slug', requireAuth, async (req, res) => {
  const { data: community } = await supabase
    .from('communities')
    .select('id, owner_id')
    .eq('slug', req.params.slug)
    .single()

  if (!community) return res.status(404).json({ error: 'Community not found' })
  if (community.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorised' })

  const url = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT}&permissions=8&scope=bot+applications.commands`
  res.json({ url })
})

module.exports = router
