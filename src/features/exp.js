const database = require('../databases/lokijs')

module.exports = {
  getUser: database.getUser,
  getEXP: async (id) => {
    const data = await database.getUser(id)
    return data.properties.exp
  },
  applyEXP: giveEXP,
  holdEXP: async (queueid, data) => {
    return database.create('holds', {
      wb_id: queueid,
      ...data
    })
  },
  processHolds: async (id, type) => {
    const data = database.findManySync('holds', {
      wb_id: id
    })
    if (!data) return
    data.forEach(x => {
      const notify = require('./notifications')
      switch (x.type) {
        case 1 : {
          const rewardable = [1, 3]
          if (rewardable.includes(type)) {
            x.users.forEach(y => {
              giveEXP(y, x.gain, x.message)
            })
          }
          x.users.forEach(y => {
            notify.send(type, y, {
              id: x.zd_id,
              gain: x.gain
            })
          })
          break
        }
        case 2 : {
          if (type === 1) {
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
  userinfo.transactions.push({ modified: granted, reason: msg })
  userinfo.transactions = userinfo.transactions.slice(Math.max(userinfo.transactions.length - 50, 0))
  return database.edit(id, {
    properties: {
      ...userinfo.properties,
      exp: userinfo.properties.exp + granted
    },
    transactions: userinfo.transactions
  })
}
