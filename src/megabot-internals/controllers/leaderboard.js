const db = require('../../databases/lokijs')
const ids = require('../ids')

module.exports = {
  /**
   * Regenerate custodian leaderboard
   * This function returns void, and takes no arguments
   * @returns {Promise<void>}
   */
  update: async () => {
    const channel = bot.getChannel(ids.leaderboard)
    const editable = (await channel.getMessages()).filter(x => x.author.id === bot.user.id)
    const lbstr = `${(new Date()).getMonth()}-${(new Date()).getUTCFullYear()}`
    const users = db.chain('users')
      .find({
        entitlements: {
          $containsNone: ['no-leaderboard', 'never-custodian']
        },
        leaderboardData: {
          $contains: lbstr
        }
      })
      .where(x => {
        // FIXME: This might be disadvantageous to people not in cache
        const user = bot.guilds.get(ids.guild).members.get(x.wb_id) // cant async here :(
        if (user) return user.roles.includes(ids.custodianRole)
        else return false
      })
      .sort((a, b) => {
        return b.leaderboardData[lbstr] - a.leaderboardData[lbstr]
      })
      .limit(10)
      .data()
    const toedit = editable.slice(0, 10)
    users.forEach(async data => {
      let x = toedit.pop()
      const user = bot.users.get(data.wb_id) ? bot.users.get(data.wb_id) : await bot.getRESTUser(data.wb_id)
      if (x) x.edit(generateEmbed(data, user, users.indexOf(data) + 1))
      else channel.createMessage(generateEmbed(data, user, users.indexOf(data) + 1))
    })
    if (toedit.length > 0) toedit.forEach(x => x.delete())
  }
}

const getNumberWithOrdinal = (n) => { // https://stackoverflow.com/a/31615643
  let s = ['th', 'st', 'nd', 'rd']
  let v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const getColor = (pos) => {
  switch (pos) {
    case 1 : return 0xE5C100
    case 2 : return 0xC0C0C0
    case 3 : return 0xcd7f32
    default : return 0x5c72f5
  }
}

const generateEmbed = (data, user, position) => {
  const { format } = require('date-fns')
  const month = (new Date()).getMonth()
  return {
    embed: {
      color: getColor(position),
      title: `${getNumberWithOrdinal(position)} place`,
      description: `${user.username}#${user.discriminator}`,
      thumbnail: {
        url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      },
      timestamp: new Date(),
      fields: [
        {
          name: `EXP gained in ${format(new Date(), 'MMMM')}`,
          value: data.leaderboardData[month]
        }
      ]
    }
  }
}
