import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('lfg')
    .setDescription('Post a looking for group message')
    .addStringOption(o => o.setName('mode').setDescription('Game mode').setRequired(true)
      .addChoices(
        { name: 'Warzone', value: 'Warzone' },
        { name: 'Resurgence', value: 'Resurgence' },
        { name: 'Multiplayer', value: 'Multiplayer' },
        { name: 'Zombies', value: 'Zombies' },
        { name: 'Customs', value: 'Customs' }
      ))
    .addIntegerOption(o => o.setName('slots').setDescription('Slots needed (1-3)').setRequired(true).setMinValue(1).setMaxValue(3))
    .addStringOption(o => o.setName('note').setDescription('Additional info (mic required, rank, etc.)')),

  async execute(interaction) {
    const mode = interaction.options.getString('mode')
    const slots = interaction.options.getInteger('slots')
    const note = interaction.options.getString('note')

    const embed = new EmbedBuilder()
      .setColor('#ff4444')
      .setTitle(`🎮 LFG — ${mode}`)
      .setDescription(
        `${interaction.user} is looking for **${slots}** player${slots > 1 ? 's' : ''}` +
        (note ? `\n📝 ${note}` : '')
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: 'React ✅ to join up' })
      .setTimestamp()

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true })
    await msg.react('✅')
  }
}
