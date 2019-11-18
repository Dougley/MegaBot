const SA = require('superagent')

module.exports = {
  meta: {
    level: 1,
    cost: 5,
    timeout: 15
  },
  fn: async (msg) => {
    msg.channel.sendTyping()
    const start = (await SA.get('https://random-d.uk/api/v2/random')).body.url
    return msg.channel.createMessage({
      embed: {
        color: 0x31c670,
        image: {
          url: start
        },
        footer: {
          text: fact
        }
      }
    })
  }
}
