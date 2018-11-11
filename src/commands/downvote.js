const ZD = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 0,
    timeout: 5
  },
  fn: (msg, suffix) => {
    const id = suffix.match(MB_CONSTANTS.regex) ? suffix.match(MB_CONSTANTS.regex)[1] : suffix
    ZD.applyVote(msg.author.id, id, 'down').then(x => {
      return x.getSubmission()
    }).then(x => {
      msg.channel.createMessage(`Your vote for \`${x.title}\` was applied successfully!`)
    }).catch(e => {
      msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    })
  }
}
