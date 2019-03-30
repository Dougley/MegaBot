const db = require('../databases/lokijs')
const inq = require('../megabot-internals/controllers/inquirer')
const ids = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 1
  },
  fn: async (msg, suffix) => {
    const query = {
      type: 3,
      ...(!ids.modRoles.some(x => msg.member.roles.includes(x)) ? { userID: msg.author.id } : {}),
      ...(suffix ? { '$loki': parseInt(suffix) } : {})
    }
    const report = db.chain('questions').find(query).simplesort('expire', { desc: true }).data()[0]
    if (!report) return msg.channel.createMessage('No report found, or the report is not yours to revoke')
    else {
      const x = await msg.channel.createMessage({
        content: 'Are you sure you want to cancel this report?\nThis will also revoke any outstanding transactions related to this report.',
        ...await generateEmbed(report)
      })
      inq.awaitReaction([ids.emojis.confirm, ids.emojis.dismiss], x, msg.author.id).then(z => {
        if (z.id === ids.emojis.confirm.id) {
          db.delete('holds', report.wb_id)
          bot.deleteMessage(ids.queue, report.wb_id)
          db.remove('questions', report)
          return x.edit({ content: 'Report revoked', embed: null })
        } else if (z.id === ids.emojis.dismiss.id) {
          x.edit({ content: 'Cancelled', embed: null })
        }
      }).catch(z => {
        if (z.message === 'Timed out') return x.edit({ content: 'Timed out', embed: null })
        else logger.error(z)
      })
    }
  }
}

const generateEmbed = async (x) => {
  const user = await global.bot.getRESTUser(x.userID)
  return {
    embed: {
      author: {
        name: `${user.username}#${user.discriminator}`,
        icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      },
      description: `Dupe request concerning ${x.ids.dupe} to be merged into ${x.ids.target}`,
      color: 0xbd6bd8
    }
  }
}
