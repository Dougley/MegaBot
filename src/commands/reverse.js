const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 2
  },
  fn: async (msg, suffix) => {
    let id = MB_CONSTANTS.determineID(suffix)
    if (Array.isArray(id)) {
      const resp = await msg.channel.createMessage('Resolving a comment author, hold on...')
      try {
        const comment = await ZD.getComment(id[0], id[1])
        const zduser = await ZD.getUser(comment.authorId)
        const duser = await bot.getRESTUser(zduser.external_id)
        await resp.edit({
          embed: generateEmbed(duser, zduser)
        })
      } catch (e) {
        await resp.edit('Something went wrong! :(')
      }
    } else {
      const resp = await msg.channel.createMessage('Resolving a suggestion author, hold on...')
      try {
        const suggestion = await ZD.getSubmission(id)
        const zduser = await ZD.getUser(suggestion.authorId)
        const duser = await bot.getRESTUser(zduser.external_id)
        await resp.edit({
          embed: generateEmbed(duser, zduser)
        })
      } catch (e) {
        await resp.edit('Something went wrong! :(')
      }
    }
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
