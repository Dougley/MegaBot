const ids = require('./ids')

/**
 * Create a log message inside Discord
 * @param {Number} type - Type of log message to send
 * @param {Object} opts - Optional arguments to include, differs with every log type
 * @returns {Promise<Message>}
 */
module.exports = (type, opts) => {
  const channel = bot.getChannel(ids.log)
  const now = new Date()
  switch (type) {
    case 1 : { // command
      return channel.createMessage(`\`[${now.toLocaleTimeString()}]\` 🔧 ${opts.user.username}#${opts.user.discriminator} (\`${opts.user.id}\`) ran command \`${opts.cmd}\``)
    }
    case 2 : { // inquire action
      return channel.createMessage(`\`[${now.toLocaleTimeString()}]\` 📑 ${opts.user.username}#${opts.user.discriminator} (\`${opts.user.id}\`) ran reaction action **${opts.action}** on ${opts.zd_id}`)
    }
    case 3 : { // permissions error
      return channel.createMessage(`\`[${now.toLocaleTimeString()}]\` 🛑 ${opts.user.username}#${opts.user.discriminator} (\`${opts.user.id}\`) tried running a command they don't have access to (${opts.cmd})`)
    }
    case 4 : { // custom
      return channel.createMessage(`\`[${now.toLocaleTimeString()}]\` ℹ ${opts.message}`)
    }
    case 5 : { // admin queue
      return channel.createMessage(`\`[${now.toLocaleTimeString()}]\` 🆔 ${opts.user.username}#${opts.user.discriminator} (\`${opts.user.id}\`) ${opts.action} an admin-queue report with ID ${opts.zd_id}`)
    }
  }
}
