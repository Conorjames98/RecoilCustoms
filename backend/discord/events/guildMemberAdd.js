const { EmbedBuilder } = require('discord.js')

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.systemChannel
    if (!channel) return

    const embed = new EmbedBuilder()
      .setColor('#ff4444')
      .setTitle('Welcome to the server!')
      .setDescription(
        `Hey ${member}, welcome to **${member.guild.name}**!\n\n` +
        `🎮 Link your Recoil account with \`/link\` to get started.\n` +
        `📋 Check the rules channel before playing.`
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: `Member #${member.guild.memberCount}` })
      .setTimestamp()

    await channel.send({ embeds: [embed] })
  }
}
