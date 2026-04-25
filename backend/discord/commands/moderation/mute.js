const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a member')
    .addUserOption(o => o.setName('user').setDescription('User to mute').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user')
    const minutes = interaction.options.getInteger('minutes')
    const reason = interaction.options.getString('reason') || 'No reason provided'

    if (!target.moderatable) {
      return interaction.reply({ content: '❌ I cannot mute this user.', ephemeral: true })
    }

    await target.timeout(minutes * 60 * 1000, reason)
    await interaction.reply(`🔇 **${target.user.tag}** has been muted for ${minutes} minute(s). Reason: ${reason}`)
  }
}
