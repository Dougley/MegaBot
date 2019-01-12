const ZD = require('../megabot-internals/zendesk')
const TL = require('@vitalets/google-translate-api')

module.exports = {
  meta: {
    level: 1,
    timeout: 10
  },
  fn: async (msg, suffix) => {
    try {
      const id = suffix.match(MB_CONSTANTS.submissionRegex) ? suffix.match(MB_CONSTANTS.submissionRegex)[1] : suffix
      const suggestion = await ZD.getSubmission(id, ['topics', 'users'])
      const translation = await TL(suggestion.cleanContent, { to: 'en' })
      const title = await TL(suggestion.title, { to: 'en' })
      return msg.channel.createMessage({
        content: `Translated from \`${translation.from.language.iso}\``,
        embed: {
          color: 0xFFA500,
          author: {
            name: suggestion.sideloads.users[0].name,
            icon_url: suggestion.sideloads.users[0].photo ? suggestion.sideloads.users[0].photo.content_url : undefined
          },
          title: title.length > 250 ? title.substring(0, 250) + '...' : title,
          description: translation.text.length === 0 ? '*No content*' : (translation.text.length > 1024 ? `${translation.text.slice(0, 990)}...\n*[Content has been cut off]*` : translation.text),
          url: suggestion.htmlUrl,
          timestamp: suggestion.createdAt,
          footer: {
            text: suggestion.sideloads.topics[0].name
          }
        }
      })
    } catch (e) {
      return msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    }
  }
}
