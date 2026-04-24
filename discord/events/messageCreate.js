import { checkAutoMod } from '../lib/automod.js'
import { handleXp } from '../lib/xp.js'

export default {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return
    const flagged = await checkAutoMod(message)
    if (!flagged) await handleXp(message)
  }
}
