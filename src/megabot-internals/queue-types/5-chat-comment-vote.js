const perms = require('../../features/perms')
const ids = require('../ids')
const queue = require('../controllers/admin-queue')
const dlog = require('../dlog')

module.exports = async (question, user, emoji, msg, userID) => {
  if (emoji.id === ids.emojis.report.id) {
    if (!perms(1, user, msg)) return msg.removeReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`, userID)
    else {
      dlog(2, {
        user: user,
        action: 'report',
        zd_id: `comment ${question.ids.comment}`
      })
      if (msg.reactions[`${ids.emojis.report.name}:${ids.emojis.report.id}`].count === MB_CONSTANTS.thresholds.reports) {
        if (ids.emojis.reported) msg.addReaction(`${ids.emojis.reported.name}:${ids.emojis.reported.id}`)
        queue.createCommentDeletion(question.ids.comment, question.ids.card, msg)
      }
    }
  }
}
