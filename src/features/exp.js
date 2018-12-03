const database = require('../databases/lokijs')

module.exports = {
  getUser: database.getUser,
  getEXP: async (id) => {
    const data = await database.getUser(id)
    return data.properties.exp
  },
  applyEXP: giveEXP,
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
        if (results.length < 4) giveEXP(id, MB_CONSTANTS.rewards.vote, `Voted on ${zdid}`)
      }
    }
  },
  holdEXP: async (queueid, data) => {
    return database.create('holds', {
      wb_id: queueid,
      ...data
    })
  },
  processHolds: async (id, nototype) => {
    const data = database.findManySync('holds', {
      wb_id: id
    })
    if (!data) return
    data.forEach(x => {
      const notify = require('./notifications')
      switch (x.type) { // data type
        case 1 : {
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
        case 2 : {
          if (nototype === 1) { // notification type
            const user = database.findManySync('users', {
              wb_id: x.users[0]
            })
            if (!user) return
            else giveEXP(x.users[0], x.gain, x.message)
          }
          break
        }
      }
      database.remove('holds', x)
    })
  },
  contains: (id, term) => {
    const data = database.getUser(id)
    return !!data.transactions.find(x => x.reason === term)
  },
  touch: async (id) => {
    const data = database.getUser(id)
    const then = new Date(data.properties.lastSeen)
    const now = new Date()
    if (then.getDate() !== now.getDate()) giveEXP(id, MB_CONSTANTS.rewards.daily, 'Daily login bonus')
    data.properties.lastSeen = Date.now()
    database.edit(id, data)
  }
}

async function giveEXP (id, granted, msg) {
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
