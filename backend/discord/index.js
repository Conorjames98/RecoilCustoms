const { Client, Collection, GatewayIntentBits } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ]
})

client.commands = new Collection()

const commandFolders = readdirSync(join(__dirname, 'commands'))
for (const folder of commandFolders) {
  const files = readdirSync(join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'))
  for (const file of files) {
    const command = require(join(__dirname, 'commands', folder, file))
    client.commands.set(command.data.name, command)
  }
}

const eventFiles = readdirSync(join(__dirname, 'events')).filter(f => f.endsWith('.js'))
for (const file of eventFiles) {
  const event = require(join(__dirname, 'events', file))
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(process.env.DISCORD_TOKEN)

module.exports = client
