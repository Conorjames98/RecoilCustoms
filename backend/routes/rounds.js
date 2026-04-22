const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const requireAuth = require('../middleware/auth');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getRoleForRound(roundId, userId) {
  const { data: round } = await supabase.from('session_rounds').select('session_id').eq('id', roundId).single();
  if (!round) return null;
  const { data: session } = await supabase.from('sessions').select('community_id').eq('id', round.session_id).single();
  if (!session) return null;
  const { data: member } = await supabase.from('community_members').select('role').eq('community_id', session.community_id).eq('user_id', userId).single();
  return member?.role || null;
}

// GET /api/rounds/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('session_rounds').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Round not found' });
  res.json(data);
});

// POST /api/rounds — add round to session
router.post('/', requireAuth, async (req, res) => {
  const { session_id, title, game_mode, map, rules_presets, custom_rules_text } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const { data: session } = await supabase.from('sessions').select('community_id').eq('id', session_id).single();
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { data: member } = await supabase.from('community_members').select('role').eq('community_id', session.community_id).eq('user_id', req.user.id).single();
  if (!['owner', 'moderator'].includes(member?.role)) return res.status(403).json({ error: 'Not authorised' });

  const { data: existing } = await supabase.from('session_rounds').select('round_number').eq('session_id', session_id).order('round_number', { ascending: false }).limit(1);
  const nextNum = (existing?.[0]?.round_number || 0) + 1;

  const { data, error } = await supabase
    .from('session_rounds')
    .insert({ session_id, round_number: nextNum, title: title || `Round ${nextNum}`, game_mode, map, rules_presets: rules_presets || [], custom_rules_text, status: 'draft' })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// PATCH /api/rounds/:id — update round (live edits supported: rules, join code, status)
router.patch('/:id', requireAuth, async (req, res) => {
  const role = await getRoleForRound(req.params.id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });

  const allowed = ['title', 'game_mode', 'map', 'rules_presets', 'custom_rules_text', 'join_code', 'status'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  if (updates.status === 'in_progress') updates.started_at = new Date().toISOString();
  if (updates.status === 'ended') updates.ended_at = new Date().toISOString();

  const { data, error } = await supabase.from('session_rounds').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/rounds/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const role = await getRoleForRound(req.params.id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });
  await supabase.from('session_rounds').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
