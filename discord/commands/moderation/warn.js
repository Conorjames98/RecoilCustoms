import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import { supabase } from '../../lib/supabase.js'

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user')
    const reason = interaction.options.getString('reason')

    await supabase.from('warnings').insert({
      discord_id: target.user.id,
      moderator_id: interaction.user.id,
      reason,
      guild_id: interaction.guildId
    })

    await target.user.send(`⚠️ You have been warned in **${interaction.guild.name}**.\nReason: ${reason}`).catch(() => {})
    await interaction.reply(`⚠️ **${target.user.tag}** has been warned. Reason: ${reason}`)
  }
}
