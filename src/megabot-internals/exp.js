const database = require('../databases/lokijs')

module.exports = {
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
  processHolds: async (id, granted) => {
    const data = await database.get('holds', id)
    if (!data) return
    if (granted) {
      data.users.forEach(x => {
        giveEXP(x, data.gain, data.message)
      })
    }
    database.delete('holds', id)
  },
  touch: async (id) => {
    const data = database.getUser(id)
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
      exp: userinfo.properties.exp + granted
    },
    transactions: userinfo.transactions
  })
}
