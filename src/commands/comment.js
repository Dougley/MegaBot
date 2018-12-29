const ZD = require('../megabot-internals/zendesk')
const XP = require('../features/exp')

module.exports = {
  meta: {
    level: 0
  },
  fn: async (msg, suffix) => {
    msg.channel.sendTyping()
    const chunks = suffix.split(' ')
    const id = chunks[0].match(MB_CONSTANTS.submissionRegex) ? chunks[0].match(MB_CONSTANTS.submissionRegex)[1] : chunks[0]
    const comment = chunks[1] !== '|' ? chunks.slice(1).join(' ') : chunks.slice(2).join(' ')
    let suggestion // FIXME: might be better to use Promise.all
    ZD.getSubmission(id, ['users', 'topics']).then(c => {
      suggestion = c
      if (c.closed) throw new Error('Suggestion closed')
      else {
        return ZD.createComment({
          discordId: msg.author.id,
          id: id
        }, {
          body: comment
        })
      }
    }).then(() => {
      if (!XP.contains(msg.author.id, `Commented on ${suggestion.id}`)) XP.applyEXP(msg.author.id, MB_CONSTANTS.rewards.comment, `Commented on ${suggestion.id}`)
      return msg.channel.createMessage({
        content: 'Your comment was added',
        embed: {
          color: 0x3498db,
          author: {
            name: suggestion.sideloads.users[0].name,
            icon_url: suggestion.sideloads.users[0].photo ? suggestion.sideloads.users[0].photo.content_url : undefined
          },
          title: suggestion.title.length > 250 ? suggestion.title.substring(0, 250) + '...' : suggestion.title,
          description: suggestion.cleanContent.length > 2048 ? '*Content too long*' : suggestion.cleanContent,
          url: suggestion.htmlUrl,
          footer: {
            text: suggestion.sideloads.topics[0].name
          },
          fields: [
            {
              name: `${msg.author.username} commented on this:`,
              value: comment.length > 1024 ? `${comment.slice(0, 990)}...\n*[Content has been cut off]*` : comment
            }
          ]
        }
      })
    }).catch(e => msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e)))
  }
}
