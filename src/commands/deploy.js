const { promisify } = require('util')
const { exec } = require('child_process')
const dlog = require('../megabot-internals/dlog')
const execAsync = promisify(exec)

module.exports = {
  meta: {
    level: 10
  },
  fn: async (msg) => {
    const m = await msg.channel.createMessage('Starting update process, updating git tree...')
    execAsync('git fetch origin && git reset --hard origin/master').then(x => {
      logger.trace(x)
      m.edit('Git tree updated, updating modules...')
      return execAsync('npm i --production')
    }).then(x => {
      logger.trace(x)
      return execAsync('git rev-parse HEAD')
    }).then(async x => {
      logger.trace(x)
      await dlog(4, {
        message: `Successfully updated to revision \`${x.stdout.trim()}\``
      })
      m.edit(`Updated to ref \`${x.stdout.trim()}\`, terminating process.`).then(() => process.exit(0))
    }).catch(e => {
      logger.error(e)
      m.edit('Command failed!')
    })
  }
}
