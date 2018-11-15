const { promisify } = require('util')
const { exec } = require('child_process')
const execAsync = promisify(exec)

module.exports = {
  meta: {
    level: 10
  },
  fn: async (msg) => {
    const m = await msg.channel.createMessage('Starting update process, updating git tree...')
    execAsync('git pull').then(x => {
      logger.trace(x)
      m.edit('Git tree updated, updating modules...')
      return execAsync('npm i --production')
    }).then(x => {
      logger.trace(x)
      return execAsync('git rev-parse HEAD')
    }).then(x => {
      logger.trace(x)
      m.edit(`Updated to ref \`${x.stdout.trim()}\`, terminating process.`).then(() => process.exit(0))
    }).catch(e => {
      logger.error(e)
      m.edit('Command failed!')
    })
  }
}
