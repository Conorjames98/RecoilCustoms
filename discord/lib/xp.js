import { supabase } from './supabase.js'

const XP_PER_MESSAGE = 10
const XP_COOLDOWN_MS = 60_000
const cooldowns = new Map()

export function xpForLevel(level) {
  return 100 * level * level
}

export function levelFromXp(xp) {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  return level
}

export async function handleXp(message) {
  if (message.author.bot) return

  const userId = message.author.id
  const now = Date.now()
  const last = cooldowns.get(userId) || 0

  if (now - last < XP_COOLDOWN_MS) return
  cooldowns.set(userId, now)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, xp, level')
    .eq('discord_id', userId)
    .single()

  if (!profile) return

  const oldLevel = profile.level || levelFromXp(profile.xp || 0)
  const newXp = (profile.xp || 0) + XP_PER_MESSAGE
  const newLevel = levelFromXp(newXp)

  await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
    .eq('id', profile.id)

  if (newLevel > oldLevel) {
    await message.channel.send(
      `🎉 **${message.author.username}** levelled up to **Level ${newLevel}**!`
    )
  }
}
