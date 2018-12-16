const SA = require('superagent')

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
    return msg.channel.createMessage('', {
      file: image.body,
      name: `dog.${image.type.match(/.+\/(.+)/)[1]}`
    })
  }
}
