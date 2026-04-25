const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#ff4444')
      .setTitle('Recoil Bot Commands')
      .addFields(
        {
          name: '🎮 Recoil',
          value: '`/link` — Link your Recoil account\n`/profile` — View your profile\n`/leaderboard` — XP leaderboard\n`/sessions` — Upcoming customs sessions'
        },
        {
          name: '🔍 General',
          value: '`/lfg` — Post a looking for group\n`/help` — Show this message'
        },
        {
          name: '🛡️ Moderation',
          value: '`/ban` `/kick` `/mute` `/warn` `/warnings`'
        }
      )
      .setFooter({ text: 'recoilcustoms.com' })

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }
}
