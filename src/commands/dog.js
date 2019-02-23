const SA = require('superagent')

module.exports = {
  meta: {
    level: 1,
    cost: 5,
    timeout: 15
  },
  fn: async (msg) => {
    msg.channel.sendTyping()
    const start = (await SA.get('https://random.dog/woof.json')).body.url
    const fact = (await SA.get('https://dog-api.kinduff.com/api/facts')).body.facts[0]
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
