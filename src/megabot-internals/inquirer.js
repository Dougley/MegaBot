const { Message } = require('eris')
const ids = require('./ids')

const db = require('../databases/lokijs')
const zd = require('./zendesk')
const dlog = require('./dlog')

module.exports = {
  /**
   * Begin a regular chat vote
   * This method is intended to be used on messages outside special channels
   * @param {Message} msg - Message to start this action on
   * @param {String | Number} id - Zendesk ID
   * @param {Boolean} [reportable=true] - Whether ot not this vote includes the report reaction
   * @returns {Promise<Object>} - Database response
   */
  createChatvote: (msg, id, reportable = true) => {
    msg.addReaction(`${ids.emojis.upvote.name}:${ids.emojis.upvote.id}`)
    msg.addReaction(`${ids.emojis.downvote.name}:${ids.emojis.downvote.id}`)
    if (reportable) {
      if (!db.findSync('questions', { // prevent duplicates
        type: 2,
        zd_id: parseInt(id)
      })) msg.addReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`)
      else if (ids.emojis.reported) msg.addReaction(`${ids.emojis.reported.name}:${ids.emojis.reported.id}`)
    }
    const ins = {
      expire: Date.now() + 432000000, // expire in 5 days
      type: 4,
      wb_id: msg.id,
      zd_id: id
    }
    return db.create('questions', ins)
  },
  /**
   * Begin a top 10 vote
   * This method is intended to be used on messages inside the top-10
   * @param {Message} msg - Message to start this action on
   * @param {String | Number} id - Zendesk ID
   * @returns {Promise<Object>} - Database response
   */
  createTopvote: async (msg, id) => {
    msg.addReaction(`${ids.emojis.upvote.name}:${ids.emojis.upvote.id}`)
    msg.addReaction(`${ids.emojis.downvote.name}:${ids.emojis.downvote.id}`)
    const ins = {
      type: 4,
      wb_id: msg.id,
      zd_id: id
    }
    if (await db.get('questions', msg.id)) return db.edit(msg.id, ins, 'questions')
    else return db.create('questions', ins)
  },
  /**
   * Begin an admin action
   * This method is intended to be used on messages inside admin-queue
   * @param {Object} data - Data to be inserted into the database
   * @param {Message} msg - Message to start this action on
   * @param {Boolean} [resolvable=true] - Whether or not the message should get the resolve reaction added
   * @returns {Promise<Object>} - Database response
   */
  startAdminAction: async (data, msg, resolvable = true) => {
    msg.addReaction(`${ids.emojis.confirm.name}:${ids.emojis.confirm.id}`)
    msg.addReaction(`${ids.emojis.dismiss.name}:${ids.emojis.dismiss.id}`)
    if (resolvable) msg.addReaction(`${ids.emojis.resolve.name}:${ids.emojis.resolve.id}`)
    const ins = {
      wb_id: msg.id,
      ...data
    }
    return db.create('questions', ins)
  },
  /**
   * Create a feed vote
   * This method is intended to be used on messages inside the feed
   * @param {Message} msg - Message to start this action on
   * @param {String | Number} id - Zendesk ID to start this action on
   * @returns {Promise<Object>} - Database response
   */
  createFeedvote: async (msg, id) => {
    msg.addReaction(`${ids.emojis.upvote.name}:${ids.emojis.upvote.id}`)
    msg.addReaction(`${ids.emojis.downvote.name}:${ids.emojis.downvote.id}`)
    msg.addReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`)
    const ins = {
      expire: Date.now() + (604800000 * 2), // expire in 2 weeks
      type: 1,
      wb_id: msg.id,
      zd_id: id
    }
    return db.create('questions', ins)
  },
  /**
   * Verify reactions
   * This checks if reactions are able to be acted upon
   * Not every message with reactions can be acted on
   * @param {Object} ctx - WildBeast context object
   * @returns {Promise<void>}
   */
  verify: async (ctx) => {
    const { touch } = require('../features/exp')
    const perms = require('../features/perms')
    const queue = require('./admin-queue')
    const xp = require('../features/exp')

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

    db.getQuestion(msg.id).then(async question => {
      if (!question) return
      global.logger.trace(question)

      // this notification might be expired if it has an expiry
      if (question.expire) {
        const then = new Date(question.expire)
        const now = new Date()
        if (now > then) {
          // this notification has definitely expired
          msg.removeReactions()
          return db.delete('questions', msg.id)
        }
      }

      switch (question.type) {
        case 1: { // feed vote
          if (ids.emojis.reported && emoji.id === ids.emojis.reported.id) return msg.removeReaction(`${ids.emojis.report.name}:${ids.emojis.reported.id}`, userID) // no one but us should add this emoji :angery:
          if (emoji.id === ids.emojis.upvote.id || emoji.id === ids.emojis.downvote.id) {
            dlog(2, {
              user: user,
              action: 'vote',
              zd_id: question.zd_id
            })
            if (!xp.contains(userID, `Voted on ${question.zd_id}`)) xp.applyLimitedReward(userID, 1, question.zd_id)
            zd.applyVote(userID, question.zd_id, (emoji.id === ids.emojis.upvote.id) ? 'up' : 'down')
          } else if (emoji.id === ids.emojis.report.id) {
            // this is likely the report reaction
            if (!perms(1, user, msg)) return msg.removeReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`, userID)
            else {
              dlog(2, {
                user: user,
                action: 'report',
                zd_id: question.zd_id
              })
              if (msg.reactions[`${ids.emojis.report.name}:${ids.emojis.report.id}`].count === MB_CONSTANTS.thresholds.reports + 1) {
                if (ids.emojis.reported) msg.addReaction(`${ids.emojis.reported.name}:${ids.emojis.reported.id}`)
                queue.createDeletionRequest(await zd.getSubmission(question.zd_id, ['users', 'topics']), msg)
              }
            }
          }
          break
        }
        case 2: { // admin action: destruction
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
            msg.edit({ content: 'Report dismissed, left card untouched.', embed: null }).then(x => {
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
          break
        }
        case 3: { // admin action: merging
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
              xp.processHolds(msg.id, 4)
              setTimeout(() => {
                x.delete()
              }, MB_CONSTANTS.timeouts.queueDelete)
            })
            db.delete('questions', msg.id)
          }
          if (emoji.id === ids.emojis.dismiss.id) {
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
          break
        }
        case 4: { // chat vote
          if (emoji.id === ids.emojis.upvote.id || emoji.id === ids.emojis.downvote.id) {
            dlog(2, {
              user: user,
              action: 'vote',
              zd_id: question.zd_id
            })
            if (!xp.contains(userID, `Voted on ${question.zd_id}`)) xp.applyLimitedReward(userID, 1, question.zd_id)
            zd.applyVote(userID, question.zd_id, (emoji.id === ids.emojis.upvote.id) ? 'up' : 'down')
          } else if (emoji.id === ids.emojis.report.id) {
            // this is likely the report reaction
            if (!perms(1, user, msg)) return msg.removeReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`, userID)
            else {
              dlog(2, {
                user: user,
                action: 'report',
                zd_id: question.zd_id
              })
              if (msg.reactions[`${ids.emojis.report.name}:${ids.emojis.report.id}`].count === MB_CONSTANTS.thresholds.reports + 1) {
                if (ids.emojis.reported) msg.addReaction(`${ids.emojis.reported.name}:${ids.emojis.reported.id}`)
                queue.createDeletionRequest(await zd.getSubmission(question.zd_id, ['users', 'topics']), msg)
              }
            }
          }
          break
        }
      }
    })
  }
}
