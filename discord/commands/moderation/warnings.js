import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js'
import { supabase } from '../../lib/supabase.js'

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a member')
    .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user')

    const { data: warnings } = await supabase
      .from('warnings')
      .select('*')
      .eq('discord_id', target.id)
      .eq('guild_id', interaction.guildId)
      .order('created_at', { ascending: false })

    if (!warnings?.length) {
      return interaction.reply({ content: `✅ **${target.tag}** has no warnings.`, ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle(`Warnings for ${target.tag}`)
      .setDescription(warnings.map((w, i) =>
        `**${i + 1}.** ${w.reason} — <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>`
      ).join('\n'))

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }
}
