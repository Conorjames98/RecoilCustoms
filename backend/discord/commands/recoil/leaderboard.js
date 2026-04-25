const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { supabase } = require('../../lib/supabase.js')
const { levelFromXp } = require('../../lib/xp.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the Recoil XP leaderboard'),

  async execute(interaction) {
    await interaction.deferReply()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, xp, avatar')
      .order('xp', { ascending: false })
      .limit(10)

    if (!profiles?.length) {
      return interaction.editReply('No players on the leaderboard yet.')
    }

    const medals = ['🥇', '🥈', '🥉']

    const embed = new EmbedBuilder()
      .setColor('#ff4444')
      .setTitle('🏆 Recoil XP Leaderboard')
      .setDescription(profiles.map((p, i) =>
        `${medals[i] || `**${i + 1}.**`} **${p.username}** — Level ${levelFromXp(p.xp || 0)} (${(p.xp || 0).toLocaleString()} XP)`
      ).join('\n'))
      .setFooter({ text: 'recoilcustoms.com' })

    await interaction.editReply({ embeds: [embed] })
  }
}
