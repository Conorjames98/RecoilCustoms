const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const requireAuth = require('../middleware/auth');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getMemberRole(communityId, userId) {
  const { data } = await supabase.from('community_members').select('role').eq('community_id', communityId).eq('user_id', userId).single();
  return data?.role || null;
}

// GET /api/sessions?community_id=x&status=open
router.get('/', async (req, res) => {
  const { community_id, status } = req.query;
  if (!community_id) return res.status(400).json({ error: 'community_id required' });
  let query = supabase.from('sessions').select('*, profiles!sessions_created_by_fkey(username, avatar)').eq('community_id', community_id);
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/sessions/:id — full session with rounds and teams
router.get('/:id', async (req, res) => {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, profiles!sessions_created_by_fkey(username, avatar)')
    .eq('id', req.params.id)
    .single();
  if (error || !session) return res.status(404).json({ error: 'Session not found' });

  const [{ data: rounds }, { data: teams }] = await Promise.all([
    supabase.from('session_rounds').select('*').eq('session_id', req.params.id).order('round_number'),
    supabase.from('teams').select('*, team_members(slot_number, is_captain, profiles(id, username, avatar, discord_id))').eq('session_id', req.params.id).order('team_number')
  ]);

  res.json({ ...session, rounds: rounds || [], teams: teams || [] });
});

// POST /api/sessions — create session + initial rounds + teams
router.post('/', requireAuth, async (req, res) => {
  const { community_id, title, description, scheduled_at, rounds: roundDefs, team_count, team_size } = req.body;
  if (!community_id || !title) return res.status(400).json({ error: 'community_id and title required' });

  const role = await getMemberRole(community_id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Only owners and moderators can create sessions' });

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({ community_id, title, description, scheduled_at, created_by: req.user.id, status: 'draft' })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });

  // Create rounds
  if (roundDefs?.length) {
    const rounds = roundDefs.map((r, i) => ({
      session_id: session.id,
      round_number: i + 1,
      title: r.title || `Round ${i + 1}`,
      game_mode: r.game_mode || 'Warzone',
      map: r.map || null,
      rules_presets: r.rules_presets || [],
      custom_rules_text: r.custom_rules_text || null,
      status: 'draft'
    }));
    await supabase.from('session_rounds').insert(rounds);
  }

  // Create teams
  const count = team_count || 12;
  const TEAM_NAMES = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa'];
  const teams = Array.from({ length: count }, (_, i) => ({
    session_id: session.id,
    team_number: i + 1,
    name: TEAM_NAMES[i] || `Team ${i + 1}`,
    locked: false
  }));
  await supabase.from('teams').insert(teams);

  // Return full session
  const fullSession = await supabase.from('sessions').select('*').eq('id', session.id).single();
  res.json(fullSession.data);
});

// PATCH /api/sessions/:id — update status or details
router.patch('/:id', requireAuth, async (req, res) => {
  const { data: session } = await supabase.from('sessions').select('community_id').eq('id', req.params.id).single();
  if (!session) return res.status(404).json({ error: 'Not found' });
  const role = await getMemberRole(session.community_id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });

  const allowed = ['title', 'description', 'status', 'scheduled_at', 'promote', 'promote_until'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase.from('sessions').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/sessions/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { data: session } = await supabase.from('sessions').select('community_id').eq('id', req.params.id).single();
  if (!session) return res.status(404).json({ error: 'Not found' });
  const role = await getMemberRole(session.community_id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });
  await supabase.from('sessions').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// POST /api/sessions/:id/shuffle — randomly shuffle all team_members slots
router.post('/:id/shuffle', requireAuth, async (req, res) => {
  const { data: session } = await supabase.from('sessions').select('community_id').eq('id', req.params.id).single();
  if (!session) return res.status(404).json({ error: 'Not found' });
  const role = await getMemberRole(session.community_id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });

  // Get all team members and teams for this session
  const { data: teams } = await supabase.from('teams').select('id').eq('session_id', req.params.id).order('team_number');
  const { data: members } = await supabase.from('team_members').select('id, user_id').in('team_id', teams.map(t => t.id));

  if (!members?.length) return res.status(400).json({ error: 'No players signed up' });

  // Shuffle players
  const shuffled = [...members].sort(() => Math.random() - 0.5);
  const teamSize = req.body.team_size || 4;

  const updates = shuffled.map((m, i) => ({
    id: m.id,
    team_id: teams[Math.floor(i / teamSize) % teams.length].id,
    user_id: m.user_id,
    slot_number: (i % teamSize) + 1,
    is_captain: (i % teamSize) === 0
  }));

  await supabase.from('team_members').upsert(updates);

  // Return updated session
  const { data: updatedTeams } = await supabase
    .from('teams')
    .select('*, team_members(slot_number, is_captain, profiles(id, username, avatar, discord_id))')
    .eq('session_id', req.params.id)
    .order('team_number');

  res.json(updatedTeams);
});

module.exports = router;
