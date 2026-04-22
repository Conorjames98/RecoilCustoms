const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const requireAuth = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getMemberRole(communityId, userId) {
  const { data } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .single();
  return data?.role || null;
}

// GET /api/communities — public/featured communities
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('communities')
    .select('id, name, slug, description, banner, logo, visibility, featured, created_at')
    .in('visibility', ['public', 'featured'])
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/communities/:slug
router.get('/:slug', optionalAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('communities')
    .select('*, profiles!communities_owner_id_fkey(username, avatar)')
    .eq('slug', req.params.slug)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Community not found' });
  let membership = null;
  if (req.user) {
    const { data: m } = await supabase.from('community_members').select('role').eq('community_id', data.id).eq('user_id', req.user.id).single();
    membership = m || null;
  }
  res.json({ ...data, membership });
});

// GET /api/communities/:slug/sessions
router.get('/:slug/sessions', async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  const { data, error } = await supabase.from('sessions').select('id, title, status, max_players, created_at').eq('community_id', community.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/communities/:slug/members
router.get('/:slug/members', async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  const { data, error } = await supabase
    .from('community_members')
    .select('role, joined_at, profiles(id, username, avatar)')
    .eq('community_id', community.id)
    .order('joined_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/communities/:slug/announcements
router.get('/:slug/announcements', async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  const { data, error } = await supabase
    .from('announcements')
    .select('*, profiles(username, avatar)')
    .eq('community_id', community.id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/communities — create
router.post('/', requireAuth, async (req, res) => {
  const { name, slug, description, visibility } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug required' });
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

  const { data, error } = await supabase
    .from('communities')
    .insert({ name, slug: cleanSlug, description, visibility: visibility || 'private', owner_id: req.user.id })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });

  await supabase.from('community_members').insert({ community_id: data.id, user_id: req.user.id, role: 'owner' });
  res.json(data);
});

// PATCH /api/communities/:slug — update (owner/mod)
router.patch('/:slug', requireAuth, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id, owner_id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  const role = await getMemberRole(community.id, req.user.id);
  if (!['owner', 'moderator'].includes(role) && !req.user.is_platform_admin)
    return res.status(403).json({ error: 'Not authorised' });

  const allowed = ['name', 'description', 'banner', 'logo', 'rules', 'discord_url', 'twitter_url', 'visibility'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase.from('communities').update(updates).eq('slug', req.params.slug).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /api/communities/:slug/join
router.post('/:slug/join', requireAuth, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  const { error } = await supabase
    .from('community_members')
    .upsert({ community_id: community.id, user_id: req.user.id, role: 'member' }, { onConflict: 'community_id,user_id' });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// POST /api/communities/:slug/leave
router.post('/:slug/leave', requireAuth, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id, owner_id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  if (community.owner_id === req.user.id) return res.status(400).json({ error: 'Owner cannot leave. Transfer ownership first.' });
  await supabase.from('community_members').delete().eq('community_id', community.id).eq('user_id', req.user.id);
  res.json({ success: true });
});

// POST /api/communities/:slug/announcements
router.post('/:slug/announcements', requireAuth, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  const role = await getMemberRole(community.id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });
  const { content, pinned } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  const { data, error } = await supabase
    .from('announcements')
    .insert({ community_id: community.id, author_id: req.user.id, content, pinned: pinned || false })
    .select('*, profiles(username, avatar)').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/communities/:slug/announcements/:id
router.delete('/:slug/announcements/:id', requireAuth, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  const role = await getMemberRole(community.id, req.user.id);
  if (!['owner', 'moderator'].includes(role)) return res.status(403).json({ error: 'Not authorised' });
  await supabase.from('announcements').delete().eq('id', req.params.id).eq('community_id', community.id);
  res.json({ success: true });
});

// DELETE /api/communities/:slug/members/:userId — remove member (owner only)
router.delete('/:slug/members/:userId', requireAuth, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id, owner_id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  if (community.owner_id !== req.user.id) return res.status(403).json({ error: 'Only owner can remove members' });
  await supabase.from('community_members').delete().eq('community_id', community.id).eq('user_id', req.params.userId);
  res.json({ success: true });
});

// PATCH /api/communities/:slug/members/:userId — change role (owner only)
router.patch('/:slug/members/:userId', requireAuth, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id, owner_id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Not found' });
  if (community.owner_id !== req.user.id) return res.status(403).json({ error: 'Only owner can change roles' });
  const { role } = req.body;
  if (!['moderator', 'member'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  await supabase.from('community_members').update({ role }).eq('community_id', community.id).eq('user_id', req.params.userId);
  res.json({ success: true });
});

module.exports = router;
