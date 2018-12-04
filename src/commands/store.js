const rewards = require('../megabot-internals/rewards')
const ids = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 0,
    onlyDM: true
  },
  fn: (msg) => {
    const roles = bot.guilds.get(ids.guild).roles
    const rewardable = roles.filter(x => !!rewards.roles[x.id])
    msg.channel.createMessage(generateEmbed(rewardable))
  }
}

const generateEmbed = (roles) => {
  return {
    embed: {
      color: 0x76e9db,
      title: 'MegaBot Store',
      description: roles.map(x => `**${Object.keys(rewards.roles).indexOf(x.id) + 1}**: ${x.name} - ${rewards.roles[x.id]} EXP`).join('\n') + `\n\n*Use \`${process.env.BOT_PREFIX}buy role-number\` to buy a role*`, // 1: buyable role - x EXP
      footer: {
        icon_url: global.bot.user.dynamicAvatarURL('png', 32),
        text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
      }
    }
  }
}
