const ZD = require('../megabot-internals/zendesk')
const AQ = require('../megabot-internals/admin-queue')
const DB = require('../databases/lokijs')

module.exports = {
  meta: {
    level: 1
  },
  fn: async (msg, suffix) => {
    const chunks = suffix.split(' ')
    let dupe, target
    try {
      dupe = await ZD.getSubmission(MB_CONSTANTS.submissionRegex.test(chunks[0]) ? chunks[0].match(MB_CONSTANTS.submissionRegex)[1] : chunks[0])
      target = await ZD.getSubmission(MB_CONSTANTS.submissionRegex.test(chunks[1]) ? chunks[1].match(MB_CONSTANTS.submissionRegex)[1] : chunks[1])
    } catch (e) {
      return msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    }
    if (dupe.id === target.id) return msg.channel.createMessage("Can't merge 2 of the same suggestions!")
    if (DB.findSync('questions', {
      'ids.target': target.id,
      'ids.dupe': dupe.id,
      type: 3
    })) return msg.channel.createMessage('A dupe request for these suggestions was already submitted.')
    AQ.createMergeRequest(dupe, target, msg.author).then(() => msg.channel.createMessage('Dupe request submitted'))
  }
}
