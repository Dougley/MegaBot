const database = require('../databases/lokijs')

module.exports = {
  getEXP: async (id) => {
    const data = await database.getUser(id)
    return data.properties.exp
  },
  grantEXP: async (id, granted, msg) => {
    const userinfo = await database.getUser(id)
    userinfo.transactions.push({ modified: granted, reason: msg }).slice(Math.max(userinfo.transactions.length - 50, 0))
    return database.edit(id, {
      properties: {
        exp: userinfo.properties.exp + granted
      },
      transactions: userinfo.transactions
    })
  }
}
