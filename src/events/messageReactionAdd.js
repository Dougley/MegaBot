const { Message } = require('eris')
const ids = require('../megabot-internals/ids')
const db = require('../databases/lokijs')
const { touch } = require('../features/exp')
const perms = require('../features/perms')

const types = require('../megabot-internals/queue-types/index')

module.exports = async (ctx) => {
  let msg = ctx[0]
  let emoji = ctx[1]
  let userID = ctx[2]

  // only process guilds
  if (!msg.channel.guild) return

  // dont process our own reactions
  if (userID === global.bot.user.id) return

  // emojis must be custom
  if (!emoji.id) return

  // the emoji must be a whitelisted one
  const emojiids = Object.keys(ids.emojis).map(x => ids.emojis[x].id)
  if (!emojiids.includes(emoji.id)) return

  // the message object can be incomplete
  // check for that first and complete it
  if (!(msg instanceof Message)) msg = await global.bot.getMessage(msg.channel.id, msg.id)
  global.logger.trace(msg)

  const user = msg.channel.guild.members.get(userID) ? msg.channel.guild.members.get(userID) : await msg.channel.guild.getRESTMember(userID)

  // bump activity
  if (perms(0, user, msg)) touch(msg.author.id)

  db.getQuestion(msg.id).then(question => {
    if (!question) return
    if (question.expire) {
      const then = new Date(question.expire)
      const now = new Date()
      if (now > then) {
        // this notification has definitely expired
        msg.removeReactions()
        return db.delete('questions', msg.id)
      }
    }
    if (types[question.type]) types[question.type](question, user, emoji, msg, userID)
    else logger.warn(`Got question type ${question.type}, but didn't find a suitable handler for it`)
  })
}
