const perms = require('../../features/perms')
const xp = require('../../features/exp')
const ids = require('../ids')
const zd = require('../zendesk')
const dlog = require('../dlog')
const db = require('../../databases/lokijs')

module.exports = async (question, user, emoji, msg, userID) => {
  if (!perms(2, user, msg, 'admin-commands')) return
  if (emoji.id === ids.emojis.confirm.id) {
    dlog(5, {
      user: user,
      action: 'confirmed',
      zd_id: `${question.ids.dupe} > ${question.ids.target}`
    })
    msg.edit({ content: 'Report confirmed, cards will be merged.', embed: null }).then(async x => {
      await zd.createComment(userID, question.ids.dupe, MB_CONSTANTS.strings.dupe(question.ids.target), true)
      await zd.editSubmission(question.ids.dupe, {
        status: 'answered',
        closed: true
      })
      const votes = await getAllVotes(question.ids.dupe)
      votes.forEach(x => {
        zd.applyVote(x.userId, question.ids.target, x.value > 0 ? 'up' : 'down', true)
      })
      xp.processHolds(msg.id, 4)
      setTimeout(() => {
        x.delete()
      }, MB_CONSTANTS.timeouts.queueDelete)
    })
    db.delete('questions', msg.id)
  } else if (emoji.id === ids.emojis.reverse.id) {
    dlog(5, {
      user: user,
      action: 'reverse-confirmed',
      zd_id: `${question.ids.dupe} > ${question.ids.target}`
    })
    msg.edit({ content: 'Report confirmed, cards will be flip-merged.', embed: null }).then(async x => {
      await zd.createComment(userID, question.ids.target, MB_CONSTANTS.strings.dupe(question.ids.dupe), true)
      await zd.editSubmission(question.ids.target, {
        status: 'answered',
        closed: true
      })
      xp.processHolds(msg.id, 4)
      setTimeout(() => {
        x.delete()
      }, MB_CONSTANTS.timeouts.queueDelete)
    })
    db.delete('questions', msg.id)
  } else if (emoji.id === ids.emojis.dismiss.id) {
    dlog(5, {
      user: user,
      action: 'dismissed',
      zd_id: `${question.ids.dupe} > ${question.ids.target}`
    })
    msg.edit({ content: 'Report dismissed, left cards untouched.', embed: null }).then(x => {
      xp.processHolds(msg.id, 5)
      setTimeout(() => {
        x.delete()
      }, MB_CONSTANTS.timeouts.queueDelete)
    })
    db.delete('questions', msg.id)
  }
}

const getAllVotes = async (id) => {
  let votes = []
  let keepGoing = true
  let page = 1
  while (keepGoing) {
    let data = await zd.getVotes(id, page)
    await votes.push.apply(votes, data)
    if (data[0]._raw.next_page !== null) page++
    else keepGoing = false
  }
  return votes
}
