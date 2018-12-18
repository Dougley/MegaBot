const perms = require('../../features/perms')
const xp = require('../../features/exp')
const ids = require('../ids')
const zd = require('../zendesk')
const dlog = require('../dlog')
const db = require('../../databases/lokijs')

module.exports = async (question, user, emoji, msg) => {
  if (!perms(2, user, msg, 'admin-commands')) return
  if (emoji.id === ids.emojis.confirm.id) {
    dlog(5, {
      user: user,
      action: 'confirmed',
      zd_id: question.zd_id
    })
    msg.edit({ content: 'Report confirmed, submission will be destroyed.', embed: null }).then(x => {
      xp.processHolds(msg.id, 1)
      setTimeout(() => {
        x.delete()
      }, MB_CONSTANTS.timeouts.queueDelete)
    })
    zd.destroySubmission(question.zd_id).then(() => db.delete('questions', msg.id))
  }
  if (emoji.id === ids.emojis.dismiss.id) {
    dlog(5, {
      user: user,
      action: 'dismissed',
      zd_id: question.zd_id
    })
    msg.edit({
      content: 'Report dismissed, left card untouched.',
      embed: null
    }).then(x => {
      xp.processHolds(msg.id, 2)
      setTimeout(() => {
        x.delete()
      }, MB_CONSTANTS.timeouts.queueDelete)
    })
    db.delete('questions', msg.id)
  }
  if (emoji.id === ids.emojis.resolve.id) {
    dlog(5, {
      user: user,
      action: 'resolved',
      zd_id: question.zd_id
    })
    msg.edit({
      content: 'Report marked as resolved, left card untouched and rewarded EXP.',
      embed: null
    }).then(x => {
      xp.processHolds(msg.id, 3)
      setTimeout(() => {
        x.delete()
      }, MB_CONSTANTS.timeouts.queueDelete)
    })
    db.delete('questions', msg.id)
  }
}
