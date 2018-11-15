const db = require('../databases/lokijs')
const xp = require('../megabot-internals/exp')

module.exports = {
  meta: {
    level: 1,
    timeout: 30
  },
  fn: async (msg, suffix) => {
    const data = await db.get('bonuses', suffix.toLowerCase())
    if (!data) return msg.channel.createMessage('Sorry, no such reward code')
    else {
      msg.channel.createMessage(`Good thinking! You gained ${data.reward} extra EXP! The code you've used is now invalidated`)
      xp.grantEXP(msg.author.id, data.reward, 'Reward code used')
      return db.delete('bonuses', suffix.toLowerCase())
    }
  }
}
