const exp = require('../megabot-internals/exp')

module.exports = {
  meta: {
    level: 2,
    timeout: 10
  },
  fn: async (msg) => {
    const currentexp = await exp.getEXP(msg.author.id)
    msg.channel.createMessage(`You currently have ${currentexp} EXP`)
  }
}
