const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const requireAuth = require('../middleware/auth');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  const { data } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
  res.json(data || req.user);
});

// GET /api/users/me/communities
router.get('/me/communities', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('community_members')
    .select('role, communities(id, name, slug, description, banner, logo, visibility, featured)')
    .eq('user_id', req.user.id)
    .order('joined_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/users/me/sessions
router.get('/me/sessions', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('team_members')
    .select('teams(session_id, sessions(id, title, status, scheduled_at, communities(name, slug)))')
    .eq('user_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
