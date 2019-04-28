const perms = require('../../features/perms')
const xp = require('../../features/exp')
const ids = require('../ids')
const zd = require('../zendesk')
const dlog = require('../dlog')
const db = require('../../databases/lokijs')

module.exports = async (question, user, emoji, msg) => {
  if (!perms(2, user, msg)) return
  if (emoji.id === ids.emojis.confirm.id) {
    dlog(5, {
      user: user,
      action: 'confirmed',
      zd_id: `comment ${question.ids.comment}`
    })
    msg.edit({ content: 'Report confirmed, comment will be destroyed.', embed: null }).then(x => {
      xp.processHolds(msg.id, 6)
      setTimeout(() => {
        x.delete()
      }, MB_CONSTANTS.timeouts.queueDelete)
    })
    zd.deleteComment(question.ids.card, question.ids.comment).then(() => db.delete('questions', msg.id))
  }
  if (emoji.id === ids.emojis.dismiss.id) {
    dlog(5, {
      user: user,
      action: 'dismissed',
      zd_id: `comment ${question.ids.comment}`
    })
    msg.edit({
      content: 'Report dismissed, left comment untouched.',
      embed: null
    }).then(x => {
      xp.processHolds(msg.id, 7)
      setTimeout(() => {
        x.delete()
      }, MB_CONSTANTS.timeouts.queueDelete)
    })
    db.delete('questions', msg.id)
  }
}
