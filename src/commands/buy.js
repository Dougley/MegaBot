const rewards = require('../megabot-internals/rewards')
const ids = require('../megabot-internals/ids')
const xp = require('../features/exp')

module.exports = {
  meta: {
    level: 0,
    onlyDM: true
  },
  fn: async (msg, suffix) => {
    const chunks = suffix.split(' ')
    const userdata = await xp.getUser(msg.author.id)
    if (userdata.blocked || userdata.entitlements.some(x => ['store-disabled', 'never-custodian'].indexOf(x) !== -1)) return msg.channel.createMessage('Unfortunately, your privileges to use this command have been disabled, please contact a moderator.')
    switch (chunks[0]) {
      case 'roles': {
        if (isNaN(chunks[1])) return msg.channel.createMessage('Please enter a valid role ID!')
        const role = Object.keys(rewards.roles)[chunks[1] - 1]
        if (!role) return msg.channel.createMessage('No role with that ID found!')
        else {
          const user = bot.guilds.get(ids.guild).members.get(msg.author.id) ? bot.guilds.get(ids.guild).members.get(msg.author.id) : await bot.guilds.get(ids.guild).getRESTMember(msg.author.id)
          if (!user.roles.includes(ids.custodianRole) && role !== ids.custodianRole) {
            return msg.channel.createMessage('You must buy the custodian role before any other role.')
          } else if (user.roles.includes(role)) {
            return msg.channel.createMessage('You already have that role.')
          } else if (user.roles.length < Object.keys(rewards.roles).indexOf(role)) {
            return msg.channel.createMessage('You must buy roles in order.')
          }
          if (userdata.properties.exp >= rewards.roles[role]) {
            user.addRole(role, 'Role bought')
            xp.applyEXP(msg.author.id, -Math.abs(rewards.roles[role]), 'Bought a role')
            if (role !== ids.custodianRole) bot.createMessage(ids.custodianChannel, `<@${msg.author.id}> has entered the ranks of **${bot.guilds.get(ids.guild).roles.get(role).name}**!`)
            else bot.createMessage(ids.custodianChannel, `Please congratulate <@${msg.author.id}> on being custodiated!`)
            return msg.channel.createMessage('You successfully bought a new role!')
          } else {
            return msg.channel.createMessage("You currently don't have enough EXP to buy that role :(")
          }
        }
      }
      case 'things': {
        if (isNaN(chunks[1])) return msg.channel.createMessage('Please enter a valid reward ID!')
        const reward = rewards.things[chunks[1] - 1]
        if (!reward) return msg.channel.createMessage('No reward with that ID found!')
        else {
          if (reward.oneTime && userdata.onetimeRewards && userdata.onetimeRewards.includes(chunks[1])) return msg.channel.createMessage('The reward you want is one-time only, and you already got it once!')
          else {
            if (!userdata.onetimeRewards) userdata.onetimeRewards = []
            userdata.onetimeRewards.push(chunks[1])
          }
          xp.applyEXP(msg.author.id, -Math.abs(reward.cost), `Bought ${reward.name}`)
          bot.createMessage(ids.modChannel, `${msg.author.username}#${msg.author.discriminator} (\`${msg.author.id}\`) bought a reward that cannot be automatically applied, namely \`${reward.name}\``)
          return msg.channel.createMessage(`You successfully bought ${reward.name}, people responsible for processing this reward have been notified about it.`)
        }
      }
      default: {
        return msg.channel.createMessage("I don't have any rewards in that category, are you sure you typed it correctly?")
      }
    }
  }
}
