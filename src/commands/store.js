const rewards = require('../megabot-internals/rewards')
const ids = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 0,
    onlyDM: true,
    alias: ['shop']
  },
  fn: (msg, suffix) => {
    switch (suffix) {
      case 'roles': {
        const roles = bot.guilds.get(ids.guild).roles
        const rewardable = roles.filter(x => !!rewards.roles[x.id])
        return msg.channel.createMessage(generateRoleListing(rewardable))
      }
      case 'things': {
        if (!rewards.things || rewards.things.length === 0) return msg.channel.createMessage('There are no rewards to list in this category! :(')
        return msg.channel.createMessage(generateThingsListing())
      }
      default: {
        return msg.channel.createMessage('The category you provided is incorrect, please see <#514129741096288257> for a list of valid categories')
      }
    }
  }
}

const generateRoleListing = (roles) => {
  return {
    embed: {
      color: 0x76e9db,
      title: 'MegaBot Store',
      description: roles.map(x => `**${Object.keys(rewards.roles).indexOf(x.id) + 1}**: ${x.name} - ${rewards.roles[x.id]} EXP`).join('\n') + `\n\n*Use \`${process.env.BOT_PREFIX}buy role role-number\` to buy a role*`, // 1: buyable role - x EXP
      footer: {
        icon_url: global.bot.user.dynamicAvatarURL('png', 32),
        text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
      }
    }
  }
}

const generateThingsListing = () => {
  return {
    embed: {
      color: 0x4ef0ca,
      title: 'MegaBot Store',
      description: rewards.things.map(x => `**${rewards.things.indexOf(x) + 1}**: ${x.name} - ${x.cost} EXP`).join('\n') + `\n\n*Use \`${process.env.BOT_PREFIX}buy things reward-id\` to buy a reward*`,
      footer: {
        icon_url: global.bot.user.dynamicAvatarURL('png', 32),
        text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
      }
    }
  }
}
