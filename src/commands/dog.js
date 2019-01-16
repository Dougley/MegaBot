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
    const start = await SA.get('https://random.dog/woof.json')
    const image = await SA.get(start.body.url)
    if (image.body.byteLength > 4500000) return msg.channel.createMessage(start.body.url)
    const url = new URL(start.body.url)
    return msg.channel.createMessage('', {
      file: image.body,
      name: encodeURIComponent(url.pathname)
    })
  }
}
