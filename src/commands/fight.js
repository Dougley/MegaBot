const templates = [
  '{s} tried to throw a snowball at {r} but it hits Dabbit\'s car, and Dabbit is not pleased!',
  '{s} tackled {r} down with a fish.',
  '{s} fought {r}, but it was not effective...',
  '{s} tried to throw a bucket of water at {r}, but accidentally threw it all over MegaBot!'
]

module.exports = {
  meta: {
    level: 1,
    noDM: true
  },
  fn: (msg, suffix) => {
    if (!/<@!?([0-9]*)>/.test(suffix)) return msg.channel.createMessage('Please mention someone!')
    let id = suffix.match(/<@!?([0-9]*)>/)[1]
    if (id === msg.author.id) return msg.channel.createMessage("Can't execute this action on yourself")
    const user = bot.users.get(id) || bot.getRESTUser(id)
    const random = templates[Math.floor(Math.random() * templates.length)].replace(/{s}/g, msg.author.username).replace(/{r}/g, user.username)
    msg.channel.createMessage(random)
  }
}
