// require('dotenv').config()
const { Client, MessageEmbed } = require('discord.js')
const moment = require('moment')
const client = new Client()

const TOKEN = process.env.TOKEN
var minAge = 2
var enabled = true
var excluded = []
var channels = process.env.CHANNELS.split(',')
var log = process.env.LOG

client.login(TOKEN)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`)

})

client.on('message', message => {
  if (channels.includes(message.channel.id)) {
    var prefix = message.toString().split(' ')[0]
    switch (prefix) {
      case '~set':
        var previousAge = minAge
        minAge = parseInt(message.toString().split(' ')[1])
        if (isNaN(minAge)) {
          minAge = previousAge
          client.channels.fetch(message.channel.id)
            .then(channel => channel.send(`The current minimum age is ${minAge} days. You can modify it using \`~set {Number of days}\``))
            .catch(console.error)
        } else {
          client.channels.fetch(message.channel.id)
            .then(channel => channel.send(`The minimum age has been set to ${minAge} days`))
            .catch(console.error)
        }
        break
      case '~exclude':
        var id = message.toString().split(' ')[1]
        excluded.push(id)
        client.channels.fetch(message.channel.id)
          .then(channel => channel.send(`ID \`${id}\` has been excluded from autoban. You can remove the exclusion using \`~include ${id}\``))
          .catch(console.error)
        break
      case '~include':
        var id = message.toString().split(' ')[1]
        excluded = excluded.filter(item => item != id)
        client.channels.fetch(message.channel.id)
          .then(channel => channel.send(`ID \`${id}\` has been included to autoban. You can add an exclusion using \`~exclude ${id}\``))
          .catch(console.error)
        break
      case '~enable':
        enabled = true
        client.channels.fetch(message.channel.id)
          .then(channel => channel.send(`Autoban enabled. You can disable it using \`~disable\``))
          .catch(console.error)
        break
      case '~disable':
        enabled = false
        client.channels.fetch(message.channel.id)
          .then(channel => channel.send(`Autoban disabled. You can enable it using \`~enable\``))
          .catch(console.error)
        break
      case '~help':
        const embed = new MessageEmbed()
          .setTitle('Command list')
          .setColor('c9c9ff')
          .setDescription('__**Set minimum days**__\n\`~set 10\` to ban users created less than 10 days from the time of joining\n\n__**Exclude/Include user**__\n`~exclude 1234567890` to exclude user with ID \`1234567890\` from being autobanned\n\`~include 1234567890\` to remove exclusion for user with ID \`1234567890\`\n\n__**Enable/Disable**__\n\`~enable\` to enable banning and \`~disable\` to disable banning')
        client.channels.fetch(message.channel.id)
          .then(channel => channel.send(embed))
          .catch(console.error)
        break
    }

  }
})

client.on('guildMemberAdd', member => {
  if (enabled && !excluded.includes(member.id)) {
    var a = moment(Date.now())
    var b = moment(member.user.createdAt)
    var age = a.diff(b, 'days')
    if (age < minAge) {
      member
        .ban({
          reason: `New account (${age} days)`
        })
        .then(() => {
          client.channels.fetch(log)
            .then(channel => channel.send(`Banned ${member} (Account age: ${age} days)`))
            .catch(console.error)
        })
    }
  }
})