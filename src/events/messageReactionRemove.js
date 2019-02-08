const db = require('../databases/lokijs')
const zd = require('../megabot-internals/zendesk')

module.exports = async (ctx) => {
  if (MB_CONSTANTS.limiter.stopped) return
  let msg = ctx[0]
  let userID = ctx[2]

  const data = db.findSync('questions', {
    wb_id: msg.id,
    type: { $in: [1, 4] }
  })
  if (data && data.userVotes[userID]) {
    logger.debug(`Removing vote ${data.userVotes[userID]} due to reaction being removed`)
    zd.deleteVote(data.userVotes[userID])
  }
}
