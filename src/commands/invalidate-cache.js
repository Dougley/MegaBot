const db = require('../databases/redis')

module.exports = {
  meta: {
    level: 2
  },
  fn: async (msg, suffix) => {
    db.unlink(`zd_u:${suffix}`)
    return msg.channel.createMessage('Cached data deleted')
  }
}
