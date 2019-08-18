const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 0,
    alias: ['tsc', 'trustcomment', 'tscom']
  },
  fn: async (msg, suffix) => {
    msg.channel.sendTyping()
    const chunks = suffix.split(' ')
    const id = chunks[0].match(MB_CONSTANTS.submissionRegex) ? chunks[0].match(MB_CONSTANTS.submissionRegex)[1] : chunks[0]
    let suggestion
    ZD.getSubmission(id, ['users', 'topics']).then(c => {
      suggestion = c
      if (c.closed) {
        throw new Error('Suggestion closed')
      } else {
        return ZD.createComment({
          discordId: msg.author.id,
          id: id
        }, {
          body: 'Hey! Thanks for wanting to report a potential Terms of Service violation, but unfortunately, this site is not the correct place to do so. Before reporting, please read this article on how to correctly report users and/or servers properly: https://dis.gd/report. You can open a ticket here: https://dis.gd/request.'
        })
      }
    }).then(() => {
      msg.delete()
      return msg.channel.createMessage({
        content: 'Your comment was added',
        embed: {
          color: 0xfc6203,
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
              value: 'Hey! Thanks for wanting to report a potential Terms of Service violation, but unfortunately, this site is not the correct place to do so. Before reporting, please read this article on how to correctly report users and/or servers properly: https://dis.gd/report. You can open a ticket here: https://dis.gd/request.'
            }
          ]
        }
      })
    }).catch(e => msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e)))
  }
}
