const exp = require('../megabot-internals/exp')

module.exports = {
  meta: {
    level: 2,
    timeout: 10
  },
  fn: async (msg) => {
    await exp.grantEXP(msg.author.id, 10)
    msg.channel.createMessage(`You got 10 EXP`)
  }
}
