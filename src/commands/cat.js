const SA = require('superagent')

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
    return msg.channel.createMessage('', {
      file: image.body,
      name: `cat.${image.type.match(/.+\/(.+)/)[1]}`
    })
  }
}
