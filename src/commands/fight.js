const templates = [
  '{s} tried to throw a snowball at {r} but it hits Dabbit\'s car, and Dabbit is not pleased!',
  '{s} tackled {r} down with a fish.',
  '{s} fought {r}, but it was not effective...',
  '{s} tried to throw a bucket of water at {r}, but accidentally threw it all over MegaBot!',
  '{s} got tired of ks’ puns and tried to fight but accidentally hit {r}',
  '{s} tried to hit {r}, but {r} had a reverse card up their sleeve so {s} got hit instead',
  '{s} tried to fight {r}, but ended up being given cereal soup by Dabbit.',
  '{s} tried to attack {r}, but they slipped and crashed into Ghoul\'s car, making a huge cat shaped dent in the hood',
  '{s} tried to fight {r} but was attacked by a gang of kittens',
  '{s} challenged {r} to a race in Mario Kart but the CPU won instead!', // fuck you joey
  '{r} dodged a mighty fine swing from {s}, and then backhanded {s} in self defense.',
  '{s} begged their pet to attack {r}, but the pet stared back with no indication of understanding.',
  '{s} fought like a dog, but {r} fought back like a bear, winning the fight!',
  'A wild {r} appears!\n{r} uses Bite! It\'s not very effective...\n{s} uses Mega Punch! It\'s very effective!\n{s} has won!'
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
