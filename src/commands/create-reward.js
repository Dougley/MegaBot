const db = require('../databases/lokijs')

module.exports = {
  meta: {
    level: 2
  },
  fn: async (msg, suffix) => {
    const chunks = suffix.split(' | ')
    if (chunks.length !== 2) return msg.channel.createMessage('Invalid formatting')
    if (isNaN(parseInt(chunks[1]))) return msg.channel.createMessage('Last argument must be a number')
    if (await db.get('bonuses', chunks[0].toLowerCase())) return msg.channel.createMessage("A code with that name already exists and isn't used yet")
    db.create('bonuses', {
      wb_id: chunks[0].toLowerCase(),
      reward: parseInt(chunks[1])
    })
    msg.channel.createMessage('Reward code created')
  }
}
