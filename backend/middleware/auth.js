const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid session' });

  const discord_id = user.user_metadata?.provider_id || user.user_metadata?.sub;
  const username   = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
  const avatar     = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  if (!discord_id) return res.status(401).json({ error: 'No Discord identity' });

  const { data: dbUser, error: dbErr } = await supabase
    .from('users')
    .upsert({ discord_id, username, avatar, updated_at: new Date().toISOString() }, { onConflict: 'discord_id' })
    .select('id, discord_id, username, avatar, is_platform_admin')
    .single();

  if (dbErr || !dbUser) return res.status(500).json({ error: 'Failed to resolve user' });

  req.user = dbUser;
  next();
}

async function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      const discord_id = user.user_metadata?.provider_id || user.user_metadata?.sub;
      const username   = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
      const avatar     = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      if (discord_id) {
        const { data: dbUser } = await supabase
          .from('users')
          .upsert({ discord_id, username, avatar, updated_at: new Date().toISOString() }, { onConflict: 'discord_id' })
          .select('id, discord_id, username, avatar, is_platform_admin')
          .single();
        if (dbUser) req.user = dbUser;
      }
    }
  } catch {}
  next();
}

module.exports = requireAuth;
module.exports.optionalAuth = optionalAuth;
