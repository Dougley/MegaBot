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
   * @param {Boolean} accepted - Whether or not this notification is for an accepted action
   * @param {String} user - ID of the user to notify
   * @param {Number} [gain=0] - How much EXP this action rewarded
   * @return {void}
   */
  send: (accepted, user, gain = 0) => {
    if (check(user)) {
      db.create('system', {
        type: 'notification',
        user: user,
        gain: gain,
        accepted: accepted
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
        `- You had ${notifs.filter(x => x.accepted)} reports approved\n` +
        `- You had ${notifs.filter(x => !x.accepted)} denied\n` +
        `- You've gained **${notifs.filter(x => x.accepted).map(x => x.gain).reduce((a, b) => a + b, 0)} EXP**`
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
