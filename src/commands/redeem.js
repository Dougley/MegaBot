const db = require('../databases/lokijs')
const xp = require('../features/exp')

module.exports = {
  meta: {
    level: 1,
    timeout: 30
  },
  fn: async (msg, suffix) => {
    if (db.count('bonuses') === 0) return msg.channel.createMessage('There are no reward codes active right now')
    const data = await db.get('bonuses', suffix.toLowerCase())
    if (!data) return msg.channel.createMessage('Sorry, no such reward code')
    else {
      msg.channel.createMessage(`That code rewarded you with ${data.reward} extra EXP! The code you've used is now invalidated`)
      xp.applyEXP(msg.author.id, data.reward, 'Reward code used')
      return db.delete('bonuses', suffix.toLowerCase())
    }
  }
}
