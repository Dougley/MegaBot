const db = require('../databases/lokijs')
const countable = [1, 3, 4, 6]

module.exports = {
  meta: {
    level: 2
  },
  fn: (msg, suffix) => {
    const chunks = suffix.split(' ')
    switch (chunks[0].toLowerCase()) {
      case 'start': {
        if (db.findSync('system', {
          type: 'event',
          endDate: null
        })) return msg.channel.createMessage('An event is already running!')
        else {
          db.create('system', {
            type: 'event',
            startDate: new Date(),
            endDate: null,
            participants: {},
            paused: false
          })
          return msg.channel.createMessage('A new event has been started!')
        }
      }
      case 'pause': {
        const data = db.findSync('system', {
          type: 'event',
          endDate: null
        })
        if (!data) return msg.channel.createMessage('No event running!')
        data.paused = true
        return msg.channel.createMessage('The event has been paused, no further actions will be counted')
      }
      case 'unpause': {
        const data = db.findSync('system', {
          type: 'event',
          endDate: null
        })
        if (!data) return msg.channel.createMessage('No event running!')
        data.paused = false
        return msg.channel.createMessage('The event has been unpaused, resumed counting new actions')
      }
      case 'stop': {
        const data = db.findSync('system', {
          type: 'event',
          endDate: null
        })
        if (!data) return msg.channel.createMessage('No event running!')
        else {
          data.endDate = new Date()
          data.expire = Date.now() + (604800000 * 4) // 1 month
          const finals = generateParticipants(data)
          return msg.channel.createMessage({
            content: 'The event has ended',
            embed: generateEmbed(finals)
          })
        }
      }
      case 'list': {
        const { formatDistance } = require('date-fns')
        const data = db.findManySync('system', {
          type: 'event',
          endDate: { $ne: null }
        })
        return msg.channel.createMessage({
          embed: {
            color: 0x2faffd,
            title: 'List of the most recent events',
            description: data.slice(data.length - 10)
              .map(x => `**${x['$loki']}**: ${formatDistance(new Date(x.endDate), new Date(), { addSuffix: true })} - ${Object.keys(x.participants).length} participants`)
              .join('\n') + '\n\n *Only 10 events are displayed max, event data is saved for a month after ending*',
            footer: {
              icon_url: global.bot.user.dynamicAvatarURL('png', 32),
              text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
            }
          }
        })
      }
      case 'show': {
        const data = db.findSync('system', {
          type: 'event',
          '$loki': parseInt(chunks[1]),
          endDate: { $ne: null }
        })
        if (!data) return msg.channel.createMessage('No event found!')
        else {
          const participants = generateParticipants(data)
          return msg.channel.createMessage({
            embed: {
              color: 0x2faffd,
              title: `Event ID ${data['$loki']}`,
              description: participants.length > 1 ? participants.slice(0, 10).map(x => `<@${x.id}>: ${x.total} actions with a gain of ${x.result} EXP`).join('\n') : 'No participants :(',
              fields: [{
                name: 'Start date',
                value: new Date(data.startDate).toDateString(),
                inline: true
              }, {
                name: 'End date',
                value: new Date(data.endDate).toDateString(),
                inline: true
              }, {
                name: 'Participants',
                value: participants.length,
                inline: true
              }]
            }
          })
        }
      }
      case 'stats': {
        const data = db.findSync('system', {
          type: 'event',
          '$loki': parseInt(chunks[1]),
          endDate: { $ne: null }
        })
        if (!data) return msg.channel.createMessage('No event found!')
        else {
          const participants = generateParticipants(data)
          if (!participants.map(x => x.id).includes(chunks[2])) return msg.channel.createMessage('No data.')
          else {
            const place = participants.map(x => x.id).indexOf(chunks[2])
            const x = participants[place]
            return msg.channel.createMessage(`That user has ${x.total} actions with a gain of ${x.result} EXP, and placed on position ${place + 1}`)
          }
        }
      }
      default: {
        return msg.channel.createMessage('Unknown subaction')
      }
    }
  }
}

const generateParticipants = (data) => {
  const names = Object.keys(data.participants)
  return names.map(x => {
    const v = data.participants[x].filter(x => countable.includes(x.result))
    return { id: x, total: v.length, result: v.map(x => x.gain).reduce((a, b) => a + b, 0) }
  }).sort((a, b) => b.result - a.result)
}

const generateEmbed = (finals) => {
  return {
    color: 0x2faffd,
    title: 'Top 10 participants',
    description: finals.slice(0, 10).map(x => `<@${x.id}>: ${x.total} actions with a gain of ${x.result} EXP`).join('\n'),
    footer: {
      icon_url: global.bot.user.dynamicAvatarURL('png', 32),
      text: `MegaBot ${process.env.NODE_ENV === 'debug' ? 'Development version' : 'v' + require('../../package').version}`
    }
  }
}
