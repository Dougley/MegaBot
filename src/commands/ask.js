const inq = require('../megabot-internals/inquirer')
const ids = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 0,
    timeout: 0
  },
  fn: async (msg) => {
    const x = await msg.channel.createMessage('hello test')
    x.addReaction(`${ids.confirm.name}:${ids.confirm.id}`)
    x.addReaction(`${ids.dismiss.name}:${ids.dismiss.id}`)
    inq.create(x, {
      user: msg.author.id,
      type: 5,
      messages: {
        confirm: 'you did the thing!',
        dismiss: 'you didnt do the thing :('
      }
    })
  }
}
