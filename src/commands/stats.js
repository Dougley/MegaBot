const db = require('../databases/lokijs')
const ids = require('../megabot-internals/ids')
const { formatDistance } = require('date-fns')

module.exports = {
  meta: {
    level: 0,
    alias: ['xp']
  },
  fn: (msg) => {
    const data = db.getUser(msg.author.id)
    msg.author.getDMChannel().then(async c => {
      if (data.entitlements.includes('fake-stats')) msg.channel.createMessage(`<@${msg.author.id}>, an unexpected error occurred while getting your stats, try again later.`)
      await c.createMessage(generateEmbed(msg.author, data))
      if (msg.channel.guild) return msg.delete()
      if (!data.entitlements.includes('fake-stats')) await msg.addReaction(`${ids.emojis.confirm.name}:${ids.emojis.confirm.id}`)
    }).catch(() => {
      msg.channel.createMessage("Failed to DM you, make sure you've enabled them")
    })
  }
}

function generateEmbed (userdata, data) {
  const transactionTranslator = (tx) => {
    return `[${formatDistance(new Date(tx.time), new Date(), { addSuffix: true })}] ` +
      `${tx.modified > 0 ? '+' : ''}${tx.modified} "${tx.reason}"`
  }
  const pending = db.findManySync('holds', {
    users: {
      $contains: userdata.id
    }
  })
  return {
    embed: {
      title: `${userdata.username}'s stats`,
      timestamp: new Date(),
      color: 0xa09edd,
      footer: {
        icon_url: global.bot.user.dynamicAvatarURL('png', 32),
        text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
      },
      thumbnail: {
        url: `https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}.png`
      },
      fields: [
        {
          name: 'EXP',
          value: data.properties.exp
        },
        {
          name: 'Pending transactions',
          value: pending.length,
          inline: true
        },
        {
          name: 'Pending EXP',
          value: pending.map(x => x.gain).reduce((a, b) => a + b, 0),
          inline: true
        },
        {
          name: 'Recently processed transactions',
          value: (data.transactions.length > 0) ? '```inform7\n' + data.transactions.slice(Math.max(data.transactions.length - 5, 0)).map(transactionTranslator).join('\n') + '\n```' : 'None'
        }
      ]
    }
  }
}
