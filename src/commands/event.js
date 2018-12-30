const db = require('../databases/lokijs')

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
          const countable = [1, 3, 4, 6]
          const names = Object.keys(data.participants)
          const finals = names.map(x => {
            const v = data.participants[x].filter(x => countable.includes(x.result))
            return { id: x, total: v.length, result: v.map(x => x.gain).reduce((a, b) => a + b, 0) }
          }).sort((a, b) => {
            return a.result - b.result
          })
          return msg.channel.createMessage(`The event has ended\n\nTop 10 participants:\n${finals.slice(finals.length - 10).map(x => `<@${x.id}>: ${x.total} actions with a gain of ${x.result} EXP`).join('\n')}`)
        }
      }
      default: {
        return msg.channel.createMessage('Unknown subaction')
      }
    }
  }
}
