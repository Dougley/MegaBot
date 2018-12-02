const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 2
  },
  fn: (msg, suffix) => {
    let id = (MB_CONSTANTS.regex.test(suffix)) ? suffix.match(MB_CONSTANTS.regex)[1] : suffix
    ZD.getSubmission(id).then(x => {
      return ZD.getUser(x.authorId)
    }).then(async x => {
      const user = x.external_id ? await bot.getRESTUser(x.external_id) : null
      if (!user) return msg.channel.createMessage('Somehow failed to pull information on this user :(')
      msg.channel.createMessage(generateEmbed(user, x))
    }).catch(e => {
      msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    })
  }
}

const generateEmbed = (user, data) => {
  return {
    embed: {
      title: `${user.username}#${user.discriminator} (${user.id})`,
      thumbnail: {
        url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      },
      description: `<@${user.id}> - Internal Zendesk ID: ${data.id}`
    }
  }
}
