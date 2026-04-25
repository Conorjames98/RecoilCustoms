const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { supabase } = require('../../lib/supabase.js')
const { levelFromXp, xpForLevel } = require('../../lib/xp.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your Recoil profile')
    .addUserOption(o => o.setName('user').setDescription('User to view (default: you)')),

  async execute(interaction) {
    await interaction.deferReply()

    const target = interaction.options.getUser('user') || interaction.user

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar, xp, is_platform_admin, created_at')
      .eq('discord_id', target.id)
      .single()

    if (!profile) {
      return interaction.editReply(`❌ **${target.username}** hasn't linked their Recoil account yet. Use \`/link\` to get started.`)
    }

    const xp = profile.xp || 0
    const level = levelFromXp(xp)
    const nextLevelXp = xpForLevel(level + 1)
    const progress = Math.floor((xp / nextLevelXp) * 100)

    const embed = new EmbedBuilder()
      .setColor('#ff4444')
      .setTitle(`${profile.username}'s Recoil Profile`)
      .setThumbnail(profile.avatar || target.displayAvatarURL())
      .addFields(
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'XP', value: `${xp.toLocaleString()} / ${nextLevelXp.toLocaleString()}`, inline: true },
        { name: 'Progress', value: `${progress}%`, inline: true },
      )
      .setFooter({ text: `Joined ${new Date(profile.created_at).toLocaleDateString()}` })

    await interaction.editReply({ embeds: [embed] })
  }
}
