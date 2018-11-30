const templates = [
  '{s} gave {r} an awkward hug.',
  '{s} pretended to give {r} a hug, but put a "Kick Me" sign on them.',
  '{s} gave {r} a great bear hug!',
  '{r}, {s} just gave you the best hug of your life!',
  '{s} gave {r} a friendly little hug.',
  '{s} tried to give {r} a hug but was denied.',
  '{s} tackle-hugs {r}.'
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
