const db = require('../databases/lokijs')
const ids = require('./ids')
const inq = require('./inquirer')
const xp = require('./exp')

module.exports = {
  createDeletionRequest: async (suggestion, msg) => {
    if (await db.find('questions', {
      zd_id: suggestion.id,
      type: 2
    }) && process.env.NODE_ENV !== 'debug') return
    const channel = bot.getChannel(ids.queue)
    channel.createMessage({
      content: 'The following suggestion was marked for deletion, please confirm\n**Confirming this request destroys the suggestion IRREVERSIBLY, please be certain**',
      embed: {
        color: 0x3498db,
        author: {
          name: suggestion.sideloads.users[0].name,
          icon_url: suggestion.sideloads.users[0].photo ? suggestion.sideloads.users[0].photo.content_url : undefined
        },
        title: suggestion.title.length > 250 ? suggestion.title.substring(0, 250) + '...' : suggestion.title,
        description: suggestion.cleanContent.length > 2048 ? '*Content too long*' : suggestion.cleanContent,
        url: suggestion.htmlUrl,
        timestamp: suggestion.createdAt,
        footer: {
          text: suggestion.sideloads.topics[0].name
        },
        fields: [
          {
            name: 'Opinion',
            value: suggestion.voteSum,
            inline: true
          },
          {
            name: 'Voters',
            value: suggestion.voteCount,
            inline: true
          },
          {
            name: 'Comments',
            value: suggestion.commentCount,
            inline: true
          }
        ]
      }
    }).then(async x => {
      const users = await msg.getReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`)
      xp.holdEXP(x.id, {
        users: users.filter(x => x.id !== bot.user.id).map(x => x.id),
        gain: 10, // TODO
        message: 'Reported invalid submission'
      })
      inq.startAdminAction({
        type: 2,
        zd_id: suggestion.id
      }, x)
    })
  }
}
