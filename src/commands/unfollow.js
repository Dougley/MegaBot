const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 1,
    timeout: 5,
    alias: ['unsubscribe']
  },
  fn: async (msg, suffix) => {
    const id = suffix.match(MB_CONSTANTS.submissionRegex) ? suffix.match(MB_CONSTANTS.submissionRegex)[1] : suffix
    try {
      msg.channel.sendTyping()
      const suggestion = await ZD.getSubmission(id)
      await ZD.deleteSubscription(suggestion.id, msg.subscription.id)
      msg.channel.createMessage({
        content: "You're no longer subscribed to this suggestion.",
        embed: {
          title: suggestion.title,
          url: suggestion.htmlUrl,
          footer: {
            text: `ID: ${suggestion.id}`
          },
          color: 0xe80404
        }
      })
    } catch (e) {
      return msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    }
  }
}
