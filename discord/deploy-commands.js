import 'dotenv/config'
import { REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const commands = []

const commandFolders = readdirSync(join(__dirname, 'commands'))
for (const folder of commandFolders) {
  const files = readdirSync(join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'))
  for (const file of files) {
    const mod = await import(pathToFileURL(join(__dirname, 'commands', folder, file)).href)
    commands.push(mod.default.data.toJSON())
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

console.log(`Deploying ${commands.length} commands...`)
await rest.put(
  Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
  { body: commands }
)
console.log('✅ Commands deployed.')
