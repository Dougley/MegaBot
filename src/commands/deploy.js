const { promisify } = require('util')
const { exec } = require('child_process')
const dlog = require('../megabot-internals/dlog')
const execAsync = promisify(exec)
const intervals = require('../megabot-internals/intervals')

module.exports = {
  meta: {
    level: 3
  },
  fn: async (msg) => {
    const m = await msg.channel.createMessage('Update queued, waiting for jobs to complete...')
    intervals.forEach(x => clearInterval(x))
    MB_CONSTANTS.limiter.stop({
      dropWaitingJobs: false
    }).then(() => {
      m.edit('Jobs depleted, updating code from Git')
      return execAsync('git fetch origin && git reset --hard origin/master')
    }).then(x => {
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
