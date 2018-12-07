const db = require('../databases/lokijs')
const ids = require('./ids')

module.exports = {
  update: async () => {
    const channel = bot.getChannel(ids.leaderboard)
    const editable = (await channel.getMessages()).filter(x => x.author.id === bot.user.id)
    const users = db.getRawCollection('users').chain().simplesort('properties.exp', { desc: true }).limit(10).data()
    const toedit = editable.slice(0, 10)
    users.forEach(async data => {
      let x = toedit.pop()
      data.position = users.indexOf(data) + 1
      const user = bot.users.get(data.wb_id) ? bot.users.get(data.wb_id) : await bot.getRESTUser(data.wb_id)
      if (x) x.edit(generateEmbed(data, user))
      else channel.createMessage(generateEmbed(data, user))
    })
  }
}

const getNumberWithOrdinal = (n) => { // https://stackoverflow.com/a/31615643
  let s = ['th', 'st', 'nd', 'rd']
  let v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const generateEmbed = (data, user) => {
  return {
    embed: {
      color: 0x5c72f5,
      title: `${getNumberWithOrdinal(data.position)} place`,
      description: `${user.username}#${user.discriminator}`,
      thumbnail: {
        url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      },
      timestamp: new Date(),
      fields: [
        {
          name: 'EXP',
          value: data.properties.exp
        }
      ]
    }
  }
}
