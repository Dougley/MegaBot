const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 1,
    timeout: 5,
    alias: ['subscribe']
  },
  fn: async (msg, suffix) => {
    const id = suffix.match(MB_CONSTANTS.submissionRegex) ? suffix.match(MB_CONSTANTS.submissionRegex)[1] : suffix
    try {
      msg.channel.sendTyping()
      const suggestion = await ZD.getSubmission(id)
      await ZD.createSubscription(suggestion.id, msg.author.id)
      msg.channel.createMessage({
        content: "You're now subscribed to this suggestion, any updates will be sent to your email.",
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
