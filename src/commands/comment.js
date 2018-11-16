const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 2
  },
  fn: async (msg, suffix) => {
    msg.channel.sendTyping()
    const chunks = suffix.split(' ')
    const id = chunks[0].match(MB_CONSTANTS.regex) ? chunks[0].match(MB_CONSTANTS.regex)[1] : chunks[0]
    const comment = chunks[1] !== '|' ? chunks.slice(1).join(' ') : chunks.slice(2).join(' ')
    let suggestion // FIXME: might be better to use Promise.all
    ZD.getSubmission(id, ['users', 'topics']).then(c => {
      suggestion = c
      if (c.closed) throw new Error('Suggestion closed')
      else return ZD.createComment(msg.author.id, id, comment)
    }).then(() => {
      return msg.channel.createMessage({
        content: 'Your comment was added',
        embed: {
          color: 0x3498db,
          author: {
            name: suggestion.sideloads.users[0].name,
            icon_url: suggestion.sideloads.users[0].photo ? suggestion.sideloads.users[0].photo.content_url : undefined
          },
          title: suggestion.title,
          description: suggestion.cleanContent,
          url: suggestion.htmlUrl,
          footer: {
            text: suggestion.sideloads.topics[0].name
          },
          fields: [
            {
              name: `${msg.author.username} commented on this:`,
              value: comment
            }
          ]
        }
      })
    }).catch(e => msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e)))
  }
}
