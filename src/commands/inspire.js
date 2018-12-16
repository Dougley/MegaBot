const SA = require('superagent')

module.exports = {
  meta: {
    level: 1,
    cost: 5,
    timeout: 15
  },
  fn: async (msg) => {
    const start = await SA.get('https://inspirobot.me/api?generate=true')
    const image = await SA.get(start.text)
    return msg.channel.createMessage('', {
      file: image.body,
      name: `quote.${image.type.match(/.+\/(.+)/)[1]}`
    })
  }
}
