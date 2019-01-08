const db = require('../databases/lokijs')

module.exports = {
  meta: {
    level: 2
  },
  fn: (msg) => {
    const { inspect } = require('util')
    const counts = inspect(MB_CONSTANTS.limiter.counts(), { compact: false })
    msg.channel.createMessage({
      embed: {
        color: 0xe45207,
        fields: [{
          name: 'Total running',
          value: db.count('questions'),
          inline: true
        }, {
          name: 'Reports in queue',
          value: db.count('questions', {
            type: { $in: [2, 3, 6] }
          }),
          inline: true
        }, {
          name: 'Revision',
          value: `\`${require('child_process').execSync('git rev-parse HEAD').toString().trim()}\``
        }, {
          name: 'Buffer stats',
          value: '```js\n' + counts + '\n```'
        }],
        footer: {
          icon_url: global.bot.user.dynamicAvatarURL('png', 32),
          text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
        }
      }
    })
  }
}
