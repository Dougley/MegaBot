const db = require('../databases/lokijs')

module.exports = {
  check: check,
  /**
   * Toggle someone's notification settings
   * @param {String} id - String of the user to toggle
   * @return {Boolean}
   */
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
  /**
   * Send notifications
   * @param {Number} type - Type of notification to send
   * @param {String} user - ID of the user to notify
   * @param {Object} props - Optional properties, differs per notification type
   * @return {void | Promise<Message>}
   */
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
      case 4 : {
        return channel.createMessage(generateEmbed(`Your dupe report concerning ${props.ids.dupe} and ${props.ids.target} has been processed and accepted!\nYou gained ${props.gain} EXP`))
      }
      case 5 : {
        return channel.createMessage(generateEmbed(`Your dupe report concerning ${props.ids.dupe} and ${props.ids.target} has been processed and denied.`))
      }
      case 6 : {
        return channel.createMessage(generateEmbed(`The comment you reported with ID ${props.ids.comment} for suggestion ${props.ids.card} has been deleted\nYou gained ${props.gain} EXP`))
      }
      case 7 : {
        return channel.createMessage(generateEmbed(`Your report for comment with ID ${props.ids.comment} for suggestion ${props.ids.card} has been denied.`))
      }
    }
  }
}

/**
 * Check if someone's notifications are enabled
 * @param {String} id - String of the user to check
 * @return {Boolean}
 */
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
