const ZD = require('../megabot-internals/zendesk')
const AQ = require('../megabot-internals/admin-queue')

module.exports = {
  meta: {
    level: 1
  },
  fn: async (msg, suffix) => {
    const chunks = suffix.split(' ')
    try {
      const dupe = await ZD.getSubmission(MB_CONSTANTS.submissionRegex.test(chunks[0]) ? chunks[0].match(MB_CONSTANTS.submissionRegex)[1] : chunks[0])
      const target = await ZD.getSubmission(MB_CONSTANTS.submissionRegex.test(chunks[1]) ? chunks[1].match(MB_CONSTANTS.submissionRegex)[1] : chunks[1])
      if (dupe.id === target.id) return msg.channel.createMessage("Can't merge 2 of the same suggestions!")
      msg.channel.createMessage('Dupe request submitted')
      AQ.createMergeRequest(dupe, target, msg.author)
    } catch (e) {
      msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    }
  }
}
