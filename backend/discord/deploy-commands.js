require('dotenv').config()
const { REST, Routes } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')

const commands = []

const commandFolders = readdirSync(join(__dirname, 'commands'))
for (const folder of commandFolders) {
  const files = readdirSync(join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'))
  for (const file of files) {
    const command = require(join(__dirname, 'commands', folder, file))
    commands.push(command.data.toJSON())
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

;(async () => {
  console.log(`Deploying ${commands.length} commands...`)
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT),
    { body: commands }
  )
  console.log('✅ Commands deployed.')
})()
