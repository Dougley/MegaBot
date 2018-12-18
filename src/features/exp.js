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
    switch (type) {
      case 1 : { // votes
        const now = new Date()
        const results = data.transactions.filter(x => {
          const then = new Date(x.time)
          return then.getDate() === now.getDate()
        }).filter(x => /Voted on ([0-9])+/.test(x.reason))
        logger.trace(results)
        if (results.length <= MB_CONSTANTS.limits.vote) giveEXP(id, MB_CONSTANTS.rewards.vote, `Voted on ${zdid}`)
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
    return database.create('holds', {
      wb_id: queueid,
      ...data
    })
  },
  /**
   * Process a hold
   * This finalizes an already pending transaction
   * @param {String} id - ID of the entity that is responsible for processing, this was supplied in holdEXP()
   * @param {Number} nototype - Type of reward to process, this coincides with what notification to send
   * @return {Promise<void>}
   */
  processHolds: async (id, nototype) => {
    const data = database.findManySync('holds', {
      wb_id: id
    })
    if (!data) return
    data.forEach(x => {
      const notify = require('./notifications')
      switch (x.type) { // data type
        case 1 : { // reporters: report processed
          const rewardable = [1, 3] // notification type
          if (rewardable.includes(nototype)) {
            x.users.forEach(y => {
              giveEXP(y, x.gain, x.message)
            })
          }
          x.users.forEach(y => {
            notify.send(nototype, y, {
              id: x.zd_id,
              gain: x.gain
            })
          })
          break
        }
        case 2 : { // suggestor: submission destroyed
          if (nototype === 1) { // notification type
            const user = database.findManySync('users', {
              wb_id: x.users[0]
            })
            if (!user) return
            else giveEXP(x.users[0], x.gain, x.message)
          }
          break
        }
        case 3 : { // reporters: dupe processed
          const rewardable = [4] // notification type
          if (rewardable.includes(nototype)) {
            x.users.forEach(y => {
              giveEXP(y, x.gain, x.message)
            })
          }
          x.users.forEach(y => {
            notify.send(nototype, y, {
              ids: {
                dupe: x.ids.dupe,
                target: x.ids.target
              },
              gain: x.gain
            })
          })
          break
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
    if (then.getDate() !== now.getDate()) giveEXP(id, MB_CONSTANTS.rewards.daily, 'Daily login bonus')
    data.properties.lastSeen = Date.now()
    database.edit(id, data)
  }
}

/**
 * Grant users EXP
 * @param {String} id - ID of the user to grant EXP to
 * @param {Number} granted - Amount of EXP to grant, can be negative
 * @param {String} msg - Reason why this EXP got granted
 * @return {Promise<Object>}
 */
async function giveEXP (id, granted, msg) {
  if (id === bot.user.id) return // cant reward exp to myself
  const userinfo = await database.getUser(id)
  if (userinfo.entitlements.includes('gains-no-exp')) return
  userinfo.transactions.push({ modified: granted, reason: msg, time: Date.now() })
  userinfo.transactions = userinfo.transactions.slice(Math.max(userinfo.transactions.length - 50, 0))
  return database.edit(id, {
    properties: {
      ...userinfo.properties,
      exp: userinfo.properties.exp + granted
    },
    transactions: userinfo.transactions
  })
}
