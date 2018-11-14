const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 0,
    timeout: 5,
    alias: ['vote']
  },
  fn: (msg, suffix) => {
    const id = suffix.match(MB_CONSTANTS.regex) ? suffix.match(MB_CONSTANTS.regex)[1] : suffix
    ZD.applyVote(msg.author.id, id).then(x => {
      return x.getSubmission()
    }).then(x => {
      msg.channel.createMessage({
        content: 'Your vote was applied successfully!',
        embed: {
          title: x.title,
          url: x.htmlUrl,
          color: 0x3498db
        }
      })
    }).catch(e => {
      msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    })
  }
}
