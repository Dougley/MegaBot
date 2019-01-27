const database = require('../databases/lokijs')

module.exports = {
  getUser: database.getUser,
  /**
   * Get someone's total EXP value
   * @param {String} id - ID of the user to check
   * @return {Promise<Number>}
   */
  getEXP: async (id) => {
    const data = await database.getUser(id)
    return data.properties.exp
  },
  applyEXP: giveEXP,
  /**
   * Apply a limited reward to someone
   * Some rewards are limited to prevent abuse
   * This method is not required to apply rewards that are considered limited, this is a helper
   * @param {String} id - ID of the user to give the reward to
   * @param {Number} type - Type of the reward to give
   * @param {String} [zdid] - ID of the Zendesk suggestion this action relates to, not required for some types
   * @return {Promise<void>}
   */
  applyLimitedReward: async (id, type, zdid) => {
    const data = await database.getUser(id)
    const transactions = data.transactions.filter(x => {
      const then = new Date(x.time)
      const now = new Date()
      return then.getDate() === now.getDate()
    })
    switch (type) {
      case 1 : { // votes
        const results = transactions.filter(x => /Voted on ([0-9])+/.test(x.reason))
        logger.trace(results)
        if (results.length < MB_CONSTANTS.limits.vote) giveEXP(id, MB_CONSTANTS.rewards.vote, `Voted on ${zdid}`)
        break
      }
      case 2 : { // comments
        const results = transactions.filter(x => /Commented on ([0-9])+/.test(x.reason))
        logger.trace(results)
        if (results.length < MB_CONSTANTS.limits.comment) giveEXP(id, MB_CONSTANTS.rewards.comment, `Commented on ${zdid}`)
        break
      }
      case 3 : { // dupes
        const results = transactions.filter(x => /Merged a suggestion/.test(x.reason))
        logger.trace(results)
        if (results.length < MB_CONSTANTS.limits.dupe) giveEXP(id, MB_CONSTANTS.rewards.dupe, `Merged a suggestion`)
        break
      }
      case 4 : { // submit
        const results = transactions.filter(x => /Submitted suggestion/.test(x.reason))
        logger.trace(results)
        if (results.length < MB_CONSTANTS.limits.submit) giveEXP(id, MB_CONSTANTS.rewards.comment, `Submitted suggestion`)
        break
      }
    }
  },
  /**
   * Check if the limit for limited rewards has been reached
   * @param {String} id - ID of the user to check
   * @param {Number} type - Type of the reward to check
   * @return {Promise<Boolean>} - If true, this reward won't be applied anymore for the rest of the day
   */
  checkIfExhausted: async (id, type) => {
    const data = await database.getUser(id)
    const transactions = data.transactions.filter(x => {
      const then = new Date(x.time)
      const now = new Date()
      return then.getDate() === now.getDate()
    })
    switch (type) {
      case 1 : { // votes
        const results = transactions.filter(x => /Voted on ([0-9])+/.test(x.reason))
        logger.trace(results)
        return results.length < MB_CONSTANTS.limits.vote
      }
      case 2 : { // comments
        const results = transactions.filter(x => /Commented on ([0-9])+/.test(x.reason))
        logger.trace(results)
        return results.length < MB_CONSTANTS.limits.comment
      }
      case 3 : { // dupes
        const results = transactions.filter(x => /Merged a suggestion/.test(x.reason))
        logger.trace(results)
        return results.length < MB_CONSTANTS.limits.dupe
      }
      case 4 : { // submit
        const results = transactions.filter(x => /Submitted suggestion/.test(x.reason))
        logger.trace(results)
        return results.length < MB_CONSTANTS.limits.submit
      }
    }
  },
  /**
   * Create a hold for EXP
   * A hold is a transaction that is considered pending
   * Pending transactions are usually processed after an admin-queue action, but this is not required
   * @param {String} queueid - ID of the entity that is responsible for processing
   * @param {Object} data - Data to inject into the database
   * @return {Promise<Object>}
   */
  holdEXP: async (queueid, data) => {
    const event = database.findSync('system', {
      type: 'event',
      endDate: null,
      paused: false
    })
    return database.create('holds', {
      wb_id: queueid,
      event: !!event,
      ...data
    })
  },
  /**
   * Process a hold
   * This finalizes an already pending transaction
   * @param {String} id - ID of the entity that is responsible for processing, this was supplied in holdEXP()
   * @param {Number} nototype - Type of reward to process
   * @return {Promise<void>}
   */
  processHolds: async (id, nototype) => {
    const data = database.findManySync('holds', {
      wb_id: id
    })
    const event = database.findSync('system', {
      type: 'event',
      endDate: null
    })
    if (!data) return
    data.forEach(x => {
      if (event && x.type !== 2 && x.event) {
        x.users.forEach(y => {
          if (!event.participants[y]) event.participants[y] = []
          event.participants[y].push({
            type: x.type,
            result: nototype,
            gain: x.gain
          })
        })
      }
      const notify = require('./notifications')
      switch (x.type) { // data type
        case 1 : // reporters: report processed
        case 4 : { // reporters: comment delete processed
          const rewardable = [1, 3, 6] // notification type
          if (rewardable.includes(nototype)) {
            x.users.forEach(y => {
              giveEXP(y, x.gain, x.message)
            })
          }
          x.users.forEach(y => {
            notify.send(rewardable.includes(nototype), y, x.gain)
          })
          break
        }
        case 2 : { // suggestor: submission destroyed
          if (nototype === 1) { // notification type
            const user = database.findSync('users', {
              wb_id: x.users[0]
            })
            if (user) giveEXP(x.users[0], x.gain, x.message)
          }
          break
        }
        case 3 : { // reporters: dupe processed
          if (nototype === 4) {
            x.users.forEach(y => {
              module.exports.applyLimitedReward(y, 3)
            })
          }
          x.users.forEach(async y => {
            const reached = await module.exports.checkIfExhausted(y, 3)
            notify.send(nototype === 4, y, (!reached) ? x.gain : 0)
          })
        }
      }
      database.remove('holds', x)
    })
  },
  /**
   * Check if recent transactions already contain a given reason
   * @param {String} id - ID of the user to check
   * @param {String} term - Search query
   * @return {Boolean}
   */
  contains: (id, term) => {
    const data = database.getUser(id)
    return !!data.transactions.find(x => x.reason === term)
  },
  /**
   * Bump the last seen date for someone
   * This also rewards the daily bonus if needed
   * @param {String} id - ID of the user to bump
   * @return {Promise<void>}
   */
  touch: async (id) => {
    const data = database.getUser(id)
    const then = new Date(data.properties.lastSeen)
    const now = new Date()
    data.properties.lastSeen = Date.now()
    if (then.getDate() !== now.getDate()) giveEXP(id, MB_CONSTANTS.rewards.daily, 'Daily login bonus')
  }
}

/**
 * Grant users EXP
 * @param {String} id - ID of the user to grant EXP to
 * @param {Number} granted - Amount of EXP to grant, can be negative
 * @param {String} msg - Reason why this EXP got granted
 * @return {Object | void}
 */
function giveEXP (id, granted, msg) {
  if (id === bot.user.id) return // cant reward exp to myself
  const userinfo = database.getSync('users', id)
  if (userinfo.entitlements.includes('gains-no-exp')) return
  userinfo.transactions.push({ modified: granted, reason: msg, time: Date.now() })
  if (userinfo.transactions.length > 50) userinfo.transactions = userinfo.transactions.slice(userinfo.transactions.length - 50)
  return database.editSync(id, {
    properties: {
      ...userinfo.properties,
      exp: userinfo.properties.exp + granted
    },
    transactions: userinfo.transactions
  })
}
