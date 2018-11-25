module.exports = {
  meta: {
    level: 2,
    aliases: ['reboot', 'restart']
  },
  fn: (msg) => {
    msg.channel.createMessage('Shutting down...').then(() => {
      process.exit(0)
    })
  }
}
