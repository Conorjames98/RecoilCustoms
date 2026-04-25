const { supabase } = require('../lib/supabase')

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    await supabase.from('bot_settings').upsert(
      { guild_id: guild.id },
      { onConflict: 'guild_id', ignoreDuplicates: true }
    )
    console.log(`Bot joined guild: ${guild.name} (${guild.id})`)
  }
}
