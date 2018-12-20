const rewards = require('../megabot-internals/rewards')
const ids = require('../megabot-internals/ids')
const xp = require('../features/exp')

module.exports = {
  meta: {
    level: 0,
    onlyDM: true
  },
  fn: async (msg, suffix) => {
    if (isNaN(suffix)) return msg.channel.createMessage('Please enter a valid role ID!')
    const role = Object.keys(rewards.roles)[suffix - 1]
    if (!role) return msg.channel.createMessage('No role with that ID found!')
    else {
      const userdata = await xp.getUser(msg.author.id)
      if (userdata.blocked || userdata.entitlements.some(x => ['store-disabled', 'never-custodian'].indexOf(x) !== -1)) return msg.channel.createMessage('Unfortunately, your privileges to use this command have been disabled, please contact a moderator.')
      const user = bot.guilds.get(ids.guild).members.get(msg.author.id) ? bot.guilds.get(ids.guild).members.get(msg.author.id) : await bot.guilds.get(ids.guild).getRESTMember(msg.author.id)
      if (user.roles.includes(role)) {
        return msg.channel.createMessage('You already have that role.')
      }
      if (userdata.properties.exp >= rewards.roles[role]) {
        user.addRole(role, 'Role bought')
        xp.applyEXP(msg.author.id, -Math.abs(rewards.roles[role]), 'Bought a role')
        bot.createMessage(ids.custodianChannel, `<@${msg.author.id}> has entered the ranks of **${bot.guilds.get(ids.guild).roles.get(role).name}**!`)
        return msg.channel.createMessage('You successfully bought a new role!')
      } else {
        return msg.channel.createMessage("You currently don't have enough EXP to buy that role :(")
      }
    }
  }
}
