module.exports = {
  meta: {
    level: 2,
    alias: ['reboot', 'restart']
  },
  fn: async (msg) => {
    if (msg.content.endsWith('-f')) {
      msg.channel.createMessage('Forcefully shutting down...').then(() => {
        process.exit(0)
      })
    } else {
      const m = await msg.channel.createMessage('Shutdown queued, stopping after jobs are done (to force a shutdown, `!shutdown -f`)')
      MB_CONSTANTS.limiter.stop({
        dropWaitingJobs: false
      }).then(() => {
        m.edit('Shutting down...').then(() => {
          process.exit(0)
        })
      })
    }
  }
}
