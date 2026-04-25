const { SlashCommandBuilder } = require('discord.js')
const { supabase } = require('../../lib/supabase.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to your Recoil profile'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, discord_id')
      .eq('discord_id', interaction.user.id)
      .single()

    if (profile) {
      return interaction.editReply(`✅ Already linked to Recoil account **${profile.username}**.`)
    }

    await interaction.editReply(
      `🔗 To link your account, sign into Recoil with Discord at **https://recoilcustoms.com**.\n` +
      `Your Discord account will be linked automatically on first login.`
    )
  }
}
