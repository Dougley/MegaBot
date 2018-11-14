const db = require('../databases/lokijs')

module.exports = {
  meta: {
    level: 2,
    alias: ['lookup'] // legacy
  },
  fn: async (msg, suffix) => {
    const chunks = suffix.split(' ')
    const userinfo = await db.get('users', chunks[0])
    if (!userinfo) return msg.channel.createMessage('This user is unknown to me')
    const userdata = await global.bot.getRESTUser(chunks[0])
    if (!chunks[1]) {
      msg.channel.createMessage(generateInformationalEmbed(userdata, userinfo))
    } else {
      switch (chunks[1]) {
        case 'entitlements': {
          break
        }
        case 'overrides': {
          break
        }
        case 'blocked':
        case 'block': {
          await db.edit(chunks[0], {
            blocked: !userinfo.blocked
          })
          msg.channel.createMessage(`This user is now ${userinfo.blocked ? 'un' : ''}blocked`)
        }
      }
    }
  }
}

function generateInformationalEmbed (userdata, userinfo) {
  return {
    embed: {
      title: `MegaBot lookup on ${userdata.username}#${userdata.discriminator}`,
      timestamp: new Date(),
      color: 0x7289DA, // blurple
      footer: {
        icon_url: global.bot.user.dynamicAvatarURL('png', 32),
        text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
      },
      thumbnail: {
        url: `https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}.png`
      },
      fields: [
        {
          name: 'Entitlements',
          value: (userinfo.entitlements.length > 0) ? userinfo.entitlements.join(', ') : 'None',
          inline: true
        },
        {
          name: 'Overrides',
          value: (userinfo.overrides.length > 0) ? userinfo.overrides.join(', ') : 'None',
          inline: true
        },
        {
          name: 'Blocked?',
          value: userinfo.blocked ? 'Yes' : 'No',
          inline: true
        },
        {
          name: 'EXP',
          value: userinfo.properties.exp,
          inline: true
        },
        {
          name: 'Recent transactions',
          value: (userinfo.transactions.length > 0) ? userinfo.transactions.slice(0, 5).map(transactionTranslator).join('\n') : 'None'
        }
      ]
    }
  }
}

function transactionTranslator (tx) {
  return `Applied ${tx.modified} for ${tx.reason}`
}
