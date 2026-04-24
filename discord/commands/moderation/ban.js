import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member')
    .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user')
    const reason = interaction.options.getString('reason') || 'No reason provided'

    if (!target.bannable) {
      return interaction.reply({ content: '❌ I cannot ban this user.', ephemeral: true })
    }

    await target.ban({ reason })
    await interaction.reply(`🔨 **${target.user.tag}** has been banned. Reason: ${reason}`)
  }
}
