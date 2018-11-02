const { Message } = require('eris')
const IDS = require('./ids')

const db = require('../databases/lokijs')

module.exports = {
  create: (msg, opts) => {
    const stand = {wb_id: msg.id}
    const ins = {...stand, ...opts}
    return db.create('questions', ins)
  },
  verify: async (ctx) => {
    let msg = ctx[0]
    let emoji = ctx[1]
    let userID = ctx[2]

    // the message object can be incomplete
    // check for that first and complete it
    if (!(msg instanceof Message)) msg = await global.bot.getMessage(msg.channel.id, msg.id)
    global.logger.trace(msg)

    db.getQuestion(msg.id).then(async question => {
      if (!question) return
      global.logger.trace(question)
      switch (question.type) {
        case 1: { // feed vote
          break
        }
        case 2: { // admin action: destruction
          break
        }
        case 3: { // admin action: merging
          break
        }
        case 4: { // chat vote
          break
        }
        case 5: { // inquiry
          // this notification might be expired if it has an expiry
          if (question.expire) {
            const then = new Date(question.expire)
            const now = new Date()
            if (now > then) {
              // this notification has definitely expired
              return msg.edit('Notification expired!')
            }
          }

          // some questions are locked to 1 user
          if (question.user && question.user !== userID) return

          if (emoji.id === IDS.confirm.id) {
            db.delete('questions', msg.id)
            msg.edit(question.messages.confirm)
          }
          if (emoji.id === IDS.dismiss.id) {
            db.delete('questions', msg.id)
            msg.edit(question.messages.dismiss)
          }
          // no ids matched? just discard
          break
        }
      }
    })
  }
}
