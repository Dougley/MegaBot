const commands = require('../internal/command-loader').commands
const aliases = require('../internal/command-loader').alias
const timeout = require('../engines/timeout')

module.exports = async (ctx) => {
  const msg = ctx[0]
  if (msg.author.bot) return
  const prefix = process.env.BOT_PREFIX
  if (msg.content.indexOf(prefix) === 0) {
    let cmd = msg.content.substr(prefix.length).split(' ')[0].toLowerCase()
    if (aliases.has(cmd)) cmd = aliases.get(cmd)
    if (commands[cmd]) {
      const suffix = msg.content.substr(prefix.length).split(' ').slice(1).join(' ')
      if (!msg.channel.guild && commands[cmd].meta.noDM) return
      let time = true
      if (commands[cmd].meta.timeout) time = timeout.calculate((msg.channel.guild ? msg.channel.guild.id : msg.author.id), cmd, commands[cmd].meta.timeout)
      if (time !== true) return msg.channel.createMessage(`This command is still on cooldown, try again in ${Math.floor(time)} seconds.`)
      const level = commands[cmd].meta.level
      // TODO: level checking
      try {
        commands[cmd].fn(msg, suffix)
      } catch (e) {
        global.logger.error(e)
        msg.channel.createMessage('An error occurred processing this command, please try again later.')
      } finally {
        global.logger.command({
          cmd: cmd,
          opts: suffix,
          m: msg
        })
      }
    }
  }
}
