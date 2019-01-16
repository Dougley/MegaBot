const SA = require('superagent')
const { URL } = require('url')

module.exports = {
  meta: {
    level: 1,
    cost: 5,
    timeout: 15
  },
  fn: async (msg) => {
    msg.channel.sendTyping()
    const start = await SA.get('https://aws.random.cat/meow')
    const image = await SA.get(start.body.file)
    if (image.body.byteLength > 4500000) return msg.channel.createMessage(start.body.file)
    const url = new URL(start.body.file)
    return msg.channel.createMessage('', {
      file: image.body,
      name: encodeURIComponent(url.pathname)
    })
  }
}
