const top10 = require('../megabot-internals/controllers/top10')

module.exports = {
  meta: {
    level: 2
  },
  fn: (msg) => {
    msg.channel.createMessage('Regenerating top-10, this might take a while...')
    top10.regenerate()
  }
}
