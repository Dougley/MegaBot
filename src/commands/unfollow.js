const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 0,
    timeout: 5,
    alias: ['unsubscribe'] // ?
  },
  fn: async (msg, suffix) => {
    const id = suffix.match(MB_CONSTANTS.submissionRegex) ? suffix.match(MB_CONSTANTS.submissionRegex)[1] : suffix
    try {
      msg.channel.sendTyping()
      const suggestion = await ZD.getSubmission(+suffix)
      await ZD.deleteSubscription(suggestion.id, msg.author.id)
      
      msg.channel.createMessage({
        content: "You're no longer following this suggestion.",
        embed: {
          title: suggestion.title,
          url: suggestion.htmlUrl,
          footer: {
            text: `ID: ${suggestion.id}`
          },
          color: 0x890388
        }
      })
    } catch (e) {
      return msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    }
  }
}
