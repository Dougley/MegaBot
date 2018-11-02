const database = require('../databases/lokijs')

module.exports = {
  getEXP: async (id) => {
    const data = await database.getUser(id)
    return data.properties.exp
  },
  grantEXP: async (id, granted) => {
    const currentexp = await module.exports.getEXP(id)
    return database.edit(id, {
      properties: {
        exp: currentexp + granted
      }
    })
  }
}
