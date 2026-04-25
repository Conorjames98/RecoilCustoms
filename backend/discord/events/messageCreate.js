const { checkAutoMod } = require('../lib/automod')
const { handleXp } = require('../lib/xp')

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return
    const flagged = await checkAutoMod(message)
    if (!flagged) await handleXp(message)
  }
}
