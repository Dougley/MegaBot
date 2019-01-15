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
   * Create a notification, notifications are not immediately dispatched
   * @todo This method is adapted from the previous notification system, therefor some details are redundant
   * @param {Number} type - Type of notification to send
   * @param {String} user - ID of the user to notify
   * @param {Object} props - Optional properties, differs per notification type
   * @return {void | Promise<Message>}
   */
  send: (type, user, props) => {
    if (check(user)) {
      db.create('system', {
        type: 'notification',
        n_type: type,
        user: user,
        props: props
      })
    }
  },
  /**
   * Dispatch notifications to users
   * @return {Promise<void>}
   */
  dispatch: async () => {
    const messages = db.findManySync('system', {
      type: 'notification'
    })
    const users = new Set(messages.map(x => x.user))
    users.forEach(async user => {
      const notifs = messages.filter(z => z.user === user)
      const channel = await bot.getDMChannel(user)
      channel.createMessage(generateEmbed(
        'Since your last debriefing:\n\n' +
        `- You had ${notifs.filter(x => [1, 3, 4, 6].includes(x.n_type)).length} reports approved\n` +
        `- You had ${notifs.filter(x => [2, 5, 7].includes(x.n_type)).length} denied\n` +
        `- You've gained **${notifs.filter(x => [1, 3, 4, 6].includes(x.n_type)).map(x => x.props.gain).reduce((a, b) => a + b, 0)} EXP**`
      ))
    })
    db.findAndRemove('system', {
      type: 'notification'
    })
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
      title: 'MegaBot debriefing',
      color: 0x376df9,
      description: message,
      timestamp: new Date()
    }
  }
}
