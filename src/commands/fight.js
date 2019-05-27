const { applyEXP } = require('../features/exp')

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
  'A wild {r} appears!\n{r} uses Bite! It\'s not very effective...\n{s} uses Mega Punch! It\'s very effective!\n{s} has won!',
  'As {s} ran all sweaty and tired reaching out for a last punch, {r} dashed to the side, leaving {s} tumbling onto the ground.',
  '{s} tried to modify the Dupe Bomber 3000 to take down {r} with tons of dupe reports, but Dannysaur got there first and denied them all... Which broke the machine.',
  '{s} Mega Evolved and tried to wipe out {r} with Hyper Beam! But {r} used Mimic and reversed it back onto {s} instead!',
  '{s} threw a snowball at {r} but unfortunately it hits a window at Discord HQ. Oops',
  '{s} tricked {r} into waking up the Sleeping Pizza. The Sleeping Pizza does not like being woken up, so it turned both {s} and {r} into Calzone Pizza. Rest In Pepperoni.',
  '{s} went to tackle {r}, but they did a dank meme and lowkey dabbed out of the way',
  '{s} hit the Smash ball, but fell off the stage before they could use it on {r}',
  '{s} threw a pokeball at {r}, but it was only a Goldeen'
]

module.exports = {
  meta: {
    level: 1,
    noDM: true
  },
  fn: async (msg, suffix) => {
    if (!/<@!?([0-9]*)>/.test(suffix)) return msg.channel.createMessage('Please mention someone!')
    let id = suffix.match(/<@!?([0-9]*)>/)[1]
    if (id === msg.author.id) return msg.channel.createMessage("Can't execute this action on yourself")
    applyEXP(msg.author.id, -Math.abs(2), `Used fight`)
    const user = bot.users.get(id) || await bot.getRESTUser(id)
    const random = templates[Math.floor(Math.random() * templates.length)].replace(/{s}/g, msg.author.username).replace(/{r}/g, user.username)
    msg.channel.createMessage(MB_CONSTANTS.sanitize(random))
  }
}
