const ids = require('../ids')
const db = require('../../databases/lokijs')

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
   * Begin an admin action to delete a suggestion
   * This method is intended to be used on messages inside admin-queue
   * @param {Object} data - Data to be inserted into the database
   * @param {Message} msg - Message to start this action on
   * @returns {Promise<Object>} - Database response
   */
  startAdminDeleteRequest: async (data, msg) => {
    msg.addReaction(`${ids.emojis.confirm.name}:${ids.emojis.confirm.id}`)
    msg.addReaction(`${ids.emojis.dismiss.name}:${ids.emojis.dismiss.id}`)
    msg.addReaction(`${ids.emojis.resolve.name}:${ids.emojis.resolve.id}`)
    const ins = {
      expire: Date.now() + (604800000 * 4), // expire in 1 month
      wb_id: msg.id,
      ...data
    }
    return db.create('questions', ins)
  },
  /**
   * Begin an admin action to merge suggestions
   * This method is intended to be used on messages inside admin-queue
   * @param {Object} data - Data to be inserted into the database
   * @param {Message} msg - Message to start this action on
   * @returns {Promise<Object>} - Database response
   */
  startAdminMergeRequest: async (data, msg) => {
    msg.addReaction(`${ids.emojis.confirm.name}:${ids.emojis.confirm.id}`)
    msg.addReaction(`${ids.emojis.dismiss.name}:${ids.emojis.dismiss.id}`)
    msg.addReaction(`${ids.emojis.reverse.name}:${ids.emojis.reverse.id}`)
    const ins = {
      expire: Date.now() + (604800000 * 4), // expire in 1 month
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
   * Create a chat-vote-like question to report comments
   * @param {Message} msg - Message to start this action on
   * @param {String | Number} comment - Zendesk ID of the comment
   * @param {String | Number} card - Zendesk ID of the suggestion that has the comment
   * @returns {Promise<Object>} - Database response
   */
  createCommentReporter: async (msg, comment, card) => {
    msg.addReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`)
    const ins = {
      type: 5,
      expire: Date.now() + 432000000, // expire in 5 days
      wb_id: msg.id,
      ids: {
        comment: comment,
        card: card
      }
    }
    return db.create('questions', ins)
  },
  /**
   * Begin an admin action to delete a comment
   * This method is intended to be used on messages inside admin-queue
   * @param {Message} msg - Message to start this action on
   * @param {String | Number} comment - Zendesk ID of the comment
   * @param {String | Number} card - Zendesk ID of the suggestion that has the comment
   * @returns {Promise<Object>} - Database response
   */
  startAdminCommentRemove: async (msg, comment, card) => {
    msg.addReaction(`${ids.emojis.confirm.name}:${ids.emojis.confirm.id}`)
    msg.addReaction(`${ids.emojis.dismiss.name}:${ids.emojis.dismiss.id}`)
    const ins = {
      type: 6,
      wb_id: msg.id,
      ids: {
        comment: comment,
        card: card
      }
    }
    return db.create('questions', ins)
  },
  /**
   * Await a reaction on a message
   * This returns an object of the reaction that was returned, given the reaction was whitelisted
   * @param {Array<Object>} whitelist - Array of emoji objects that should be listened to
   * @param {Message} msg - The message to listen to
   * @param {String} user - ID of the user to listen to
   * @return {Promise<Object>} - The emoji reacted with
   */
  awaitReaction: (whitelist, msg, user) => {
    return new Promise((resolve, reject) => {
      whitelist.forEach(x => msg.addReaction(`${x.name}:${x.id}`))
      bot.on('messageReactionAdd', function compute (message, emoji, userid) {
        const time = setTimeout(() => {
          bot.removeListener('messageReactionAdd', compute)
          msg.removeReactions()
          return reject(new Error('Timed out'))
        }, 30000)
        if (message.id === msg.id && userid === user && emoji.id && whitelist.map(x => x.id).includes(emoji.id)) {
          clearTimeout(time)
          bot.removeListener('messageReactionAdd', compute)
          msg.removeReactions()
          return resolve(emoji)
        }
      })
    })
  }
}
