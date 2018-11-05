const inq = require('../megabot-internals/inquirer')

module.exports = {
  meta: {
    level: 0,
    timeout: 0
  },
  fn: async (msg) => {
    inq.create(msg.channel, {
      user: msg.author.id,
      type: 5,
      question: 'are you sure you want to do the thing?',
      messages: {
        confirm: 'you did the thing!',
        dismiss: 'you didnt do the thing :('
      }
    })
  }
}
