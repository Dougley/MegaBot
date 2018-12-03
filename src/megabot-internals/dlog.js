const ids = require('./ids')

module.exports = (type, opts) => {
  const channel = bot.getChannel(ids.log)
  const now = new Date()
  switch (type) {
    case 1 : { // command
      return channel.createMessage(`\`[${now.toLocaleTimeString()}]\` 🔧 ${opts.user.username}#${opts.user.discriminator} (\`${opts.user.id}\`) ran command \`${opts.cmd}\``)
    }
    case 2 : { // inquire action
      return channel.createMessage(`\`[${now.toLocaleTimeString()}]\` 🧾 ${opts.user.username}#${opts.user.discriminator} (\`${opts.user.id}\`) ran reaction action **${opts.action}** on ${opts.zd_id}`)
    }
    case 3 : { // permissions error
      return channel.createMessage(`\`[${now.toLocaleTimeString()}]\` 🛑 ${opts.user.username}#${opts.user.discriminator} (\`${opts.user.id}\`) tried running a command they don't have access to (${opts.cmd})`)
    }
  }
}
