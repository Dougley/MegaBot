const notify = require('../features/notifications')

module.exports = {
  meta: {
    level: 1,
    forceDM: true
  },
  fn: (msg) => {
    const res = notify.toggle(msg.author.id)
    msg.channel.createMessage(`Your notifications have been turned ${res ? 'on' : 'off'}`)
  }
}
