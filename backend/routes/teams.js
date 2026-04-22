const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const requireAuth = require('../middleware/auth');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function getSessionAndRole(teamId, userId) {
  const { data: team } = await supabase.from('teams').select('session_id, locked').eq('id', teamId).single();
  if (!team) return {};
  const { data: session } = await supabase.from('sessions').select('community_id, status').eq('id', team.session_id).single();
  if (!session) return {};
  const { data: member } = await supabase.from('community_members').select('role').eq('community_id', session.community_id).eq('user_id', userId).single();
  return { team, session, role: member?.role || null };
}

// POST /api/teams/:id/join — claim a slot on a team
router.post('/:id/join', requireAuth, async (req, res) => {
  const { team, session, role } = await getSessionAndRole(req.params.id, req.user.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (!role) return res.status(403).json({ error: 'You must be a community member to join' });
  if (!['open', 'filling', 'ready'].includes(session.status)) return res.status(400).json({ error: 'Session is not open for signups' });
  if (team.locked) return res.status(400).json({ error: 'Team is locked' });

  // Remove from any existing team in this session first
  const { data: allTeams } = await supabase.from('teams').select('id').eq('session_id', team.session_id);
  await supabase.from('team_members').delete().in('team_id', allTeams.map(t => t.id)).eq('user_id', req.user.id);

  // Find next available slot
  const { data: existing } = await supabase.from('team_members').select('slot_number').eq('team_id', req.params.id);
  const usedSlots = new Set(existing.map(m => m.slot_number));
  let slot = 1;
  while (usedSlots.has(slot)) slot++;

  const { data, error } = await supabase
    .from('team_members')
    .insert({ team_id: req.params.id, user_id: req.user.id, slot_number: slot, is_captain: slot === 1 })
    .select('*, profiles(id, username, avatar)').single();
  if (error) return res.status(400).json({ error: error.message });

  // Update session status
  const { data: allMembers } = await supabase.from('team_members').select('id').in('team_id', allTeams.map(t => t.id));
  const newStatus = allMembers.length >= 4 ? 'filling' : session.status;
  if (newStatus !== session.status) await supabase.from('sessions').update({ status: newStatus }).eq('id', team.session_id);

  res.json(data);
});

// POST /api/teams/:id/leave
router.post('/:id/leave', requireAuth, async (req, res) => {
  await supabase.from('team_members').delete().eq('team_id', req.params.id).eq('user_id', req.user.id);
  res.json({ success: true });
});

// PATCH /api/teams/:id/name — rename team (captain only)
router.patch('/:id/name', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name required' });
  const { data: member } = await supabase
    .from('team_members')
    .select('is_captain')
    .eq('team_id', req.params.id)
    .eq('user_id', req.user.id)
    .single();
  if (!member?.is_captain) return res.status(403).json({ error: 'Only the team captain can rename the team' });
  const { data, error } = await supabase.from('teams').update({ name: name.trim() }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /api/teams/:id/lock — lock/unlock (owner/mod only)
router.post('/:id/lock', requireAuth, async (req, res) => {
  const { team, role } = await getSessionAndRole(req.params.id, req.user.id);
  if (!team) return res.status(404).json({ error: 'Not found' });
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });
  const { locked } = req.body;
  await supabase.from('teams').update({ locked: locked === true }).eq('id', req.params.id);
  res.json({ success: true });
});

// POST /api/teams/move — move player to different team (owner/mod only)
router.post('/move', requireAuth, async (req, res) => {
  const { user_id, from_team_id, to_team_id } = req.body;
  if (!user_id || !to_team_id) return res.status(400).json({ error: 'user_id and to_team_id required' });

  const { role } = await getSessionAndRole(to_team_id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });

  // Remove from current team
  if (from_team_id) await supabase.from('team_members').delete().eq('team_id', from_team_id).eq('user_id', user_id);

  // Find next available slot on destination team
  const { data: existing } = await supabase.from('team_members').select('slot_number').eq('team_id', to_team_id);
  const usedSlots = new Set(existing.map(m => m.slot_number));
  let slot = 1;
  while (usedSlots.has(slot)) slot++;

  const { data, error } = await supabase
    .from('team_members')
    .insert({ team_id: to_team_id, user_id, slot_number: slot })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
