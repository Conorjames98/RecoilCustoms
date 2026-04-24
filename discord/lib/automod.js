const BAD_WORDS = [] // populate with your list
const SPAM_THRESHOLD = 5 // messages
const SPAM_WINDOW_MS = 5_000

const messageCounts = new Map()

export async function checkAutoMod(message) {
  if (message.author.bot) return false
  const content = message.content.toLowerCase()

  // Bad word check
  if (BAD_WORDS.some(w => content.includes(w))) {
    await message.delete().catch(() => {})
    await message.channel.send(`⚠️ ${message.author}, that language isn't allowed here.`)
    return true
  }

  // Spam check
  const userId = message.author.id
  const now = Date.now()
  const record = messageCounts.get(userId) || { count: 0, start: now }

  if (now - record.start > SPAM_WINDOW_MS) {
    messageCounts.set(userId, { count: 1, start: now })
  } else {
    record.count++
    messageCounts.set(userId, record)
    if (record.count >= SPAM_THRESHOLD) {
      await message.delete().catch(() => {})
      await message.channel.send(`⚠️ ${message.author}, slow down — you're sending messages too fast.`)
      messageCounts.set(userId, { count: 0, start: now })
      return true
    }
  }

  // Invite link check
  if (/discord\.gg\/|discord\.com\/invite\//i.test(content)) {
    await message.delete().catch(() => {})
    await message.channel.send(`⚠️ ${message.author}, posting invite links isn't allowed.`)
    return true
  }

  return false
}
