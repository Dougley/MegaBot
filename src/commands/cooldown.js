const db = require('../databases/lokijs')
const ids = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 0,
    alias: ['caps']
  },
  fn: (msg) => {
    const data = db.getUser(msg.author.id)
    msg.author.getDMChannel().then(async c => {
      if (data.entitlements.includes('fake-stats')) msg.channel.createMessage(`<@${msg.author.id}>, an unexpected error occurred while getting your stats, try again later.`)
      await c.createMessage(generateEmbed(msg.author, data))
      if (msg.channel.guild) return msg.delete()
      if (!data.entitlements.includes('fake-stats')) await msg.addReaction(`${ids.emojis.confirm.name}:${ids.emojis.confirm.id}`)
    }).catch(() => {
      msg.channel.createMessage("Failed to DM you, make sure you've enabled them")
    })
  }
}

function generateEmbed (userdata, data) {
  const transactions = data.transactions.filter(x => {
    const then = new Date(x.time)
    const now = new Date()
    return then.getDate() === now.getDate()
  })
  return {
    embed: {
      title: `${userdata.username}'s cooldowns`,
      timestamp: new Date(),
      color: 0xa09edd,
      footer: {
        icon_url: global.bot.user.dynamicAvatarURL('png', 32),
        text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
      },
      thumbnail: {
        url: `https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}.png`
      },
      fields: [
        {
          name: 'Votes',
          value: voteResults.length + '/' + MB_CONSTANTS.limits.votes
        },
        {
          name: 'Comments',
          value: commentsResults.length + '/' + MB_CONSTANTS.limits.comments
        },
        {
          name: 'Dupe',
          value: voteResults.length + '/' + MB_CONSTANTS.limits.dupe
        },
        {
          name: 'Submit',
          value: voteResults.length + '/' + MB_CONSTANTS.limits.submit
        }
      ]
    }
  }
}
