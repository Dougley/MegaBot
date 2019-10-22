const db = require('../databases/lokijs')
const ID = require('../megabot-internals/ids')
const dlog = require('../megabot-internals/dlog')
const { awaitReaction } = require('../megabot-internals/controllers/inquirer')

module.exports = {
  meta: {
    level: 1
  },
  fn: async (msg) => {
    const info = await db.getUser(msg.author.id)
    const m = await msg.channel.createMessage(`You're currently opted ${info.entitlements.contains('no-leaderboard-selfassign') ? 'out from' : 'in to'} the leaderboard, do you want to change this?`)
    const reaction = await awaitReaction([ID.emojis.dismiss, ID.emojis.confirm], m, msg.author)
    if (reaction.id === ID.emojis.confirm.id) {
      if (info.entitlements.contains('no-leaderboard-selfassign')) {
        info.entitlements.splice(info.entitlements.indexOf('no-leaderboard-selfassign'), 1)
      } else {
        info.entitlements.push('no-leaderboard-selfassign')
      }
      await db.edit(msg.author.id, info)
      await m.edit(`Opted ${info.entitlements.contains('no-leaderboard-selfassign') ? 'out' : 'in'}`)
      await dlog(4, {
        message: `${msg.author.username}#${msg.author.discriminator} (\`${msg.author.id}\`) opted themselves ${info.entitlements.contains('no-leaderboard-selfassign') ? 'out from' : 'in to'} the leaderboard`
      })
    } else await m.edit('Cancelled')
  }
}
