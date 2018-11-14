const db = require('../databases/lokijs')

module.exports = {
  meta: {
    level: 2
  },
  fn: async (msg, suffix) => {
    const userd = await db.get('cache', `zd_u:${suffix}`)
    if (!userd) return msg.channel.createMessage('No cached data found')
    else {
      await db.delete('cache', `zd_u:${suffix}`)
      return msg.channel.createMessage('Cached data deleted')
    }
  }
}
