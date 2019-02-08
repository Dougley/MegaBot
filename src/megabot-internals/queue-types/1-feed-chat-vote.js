const perms = require('../../features/perms')
const queue = require('../controllers/admin-queue')
const xp = require('../../features/exp')
const ids = require('../ids')
const zd = require('../zendesk')
const dlog = require('../dlog')

module.exports = async (question, user, emoji, msg, userID) => {
  if (ids.emojis.reported && emoji.id === ids.emojis.reported.id) return msg.removeReaction(`${ids.emojis.report.name}:${ids.emojis.reported.id}`, userID) // no one but us should add this emoji :angery:
  if (emoji.id === ids.emojis.upvote.id || emoji.id === ids.emojis.downvote.id) {
    dlog(2, {
      user: user,
      action: 'vote',
      zd_id: question.zd_id
    })
    if (!xp.contains(userID, `Voted on ${question.zd_id}`)) xp.applyLimitedReward(userID, 1, question.zd_id)
    zd.applyVote({
      discordId: userID,
      cardId: question.zd_id,
      type: (emoji.id === ids.emojis.upvote.id) ? 'up' : 'down'
    }).then(x => {
      question.userVotes[userID] = x.id
    })
  } else if (emoji.id === ids.emojis.report.id) {
    // this is likely the report reaction
    if (!perms(1, user, msg)) return msg.removeReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`, userID)
    else {
      dlog(2, {
        user: user,
        action: 'report',
        zd_id: question.zd_id
      })
      if (msg.reactions[`${ids.emojis.report.name}:${ids.emojis.report.id}`].count === MB_CONSTANTS.thresholds.reports) {
        if (ids.emojis.reported) msg.addReaction(`${ids.emojis.reported.name}:${ids.emojis.reported.id}`)
        queue.createDeletionRequest(await zd.getSubmission(question.zd_id, ['users', 'topics']), msg)
      }
    }
  }
}
