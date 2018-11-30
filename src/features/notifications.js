const db = require('../databases/lokijs')

module.exports = {
  check: check,
  toggle: (id) => {
    const data = db.getUser(id)
    db.edit(id, {
      properties: {
        ...data.properties,
        notifications: !data.properties.notifications
      }
    })
    return !data.properties.notifications
  },
  send: async (type, user, props) => {
    if (!check(user)) return
    const channel = await bot.getDMChannel(user)
    switch (type) {
      case 1 : {
        return channel.createMessage(generateEmbed(`Your report for ${props.id} has been processed and accepted!\nYou gained ${props.gain} EXP`))
      }
      case 2 : {
        return channel.createMessage(generateEmbed(`Your report for ${props.id} has been processed and denied.`))
      }
      case 3 : {
        return channel.createMessage(generateEmbed(`Your report for ${props.id} has been processed and was dealt with.\nYou gained ${props.gain} EXP`))
      }
    }
  }
}

function check (id) {
  const data = db.getUser(id)
  return !!data.properties.notifications
}

function generateEmbed (message) {
  return {
    embed: {
      title: 'MegaBot notification',
      color: 0xFFFAFA,
      description: message,
      timestamp: new Date()
    }
  }
}
