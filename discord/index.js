import 'dotenv/config'
import { Client, Collection, GatewayIntentBits } from 'discord.js'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ]
})

// Load commands
client.commands = new Collection()
const commandFolders = readdirSync(join(__dirname, 'commands'))
for (const folder of commandFolders) {
  const files = readdirSync(join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'))
  for (const file of files) {
    const mod = await import(pathToFileURL(join(__dirname, 'commands', folder, file)).href)
    client.commands.set(mod.default.data.name, mod.default)
  }
}

// Load events
const eventFiles = readdirSync(join(__dirname, 'events')).filter(f => f.endsWith('.js'))
for (const file of eventFiles) {
  const mod = await import(pathToFileURL(join(__dirname, 'events', file)).href)
  const event = mod.default
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(process.env.DISCORD_TOKEN)
