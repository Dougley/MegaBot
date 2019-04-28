const ZD = require('../megabot-internals/zendesk')
const XP = require('../features/exp')

module.exports = {
  meta: {
    level: 0,
    timeout: 5,
    alias: ['vote']
  },
  fn: (msg, suffix) => {
    const id = suffix.match(MB_CONSTANTS.submissionRegex) ? suffix.match(MB_CONSTANTS.submissionRegex)[1] : suffix
    ZD.applyVote({
      discordId: msg.author.id,
      cardId: id
    }).then(x => {
      return x.getSubmission()
    }).then(x => {
      if (!XP.contains(msg.author.id, `Voted on ${id}`)) XP.applyLimitedReward(msg.author.id, 1, id)
      msg.channel.createMessage({
        content: 'Your vote was applied successfully!',
        embed: {
          title: x.title,
          url: x.htmlUrl,
          color: 0x3498db,
          footer: {
            text: `ID: ${x.id}`
          }
        }
      })
    }).catch(e => {
      msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    })
  }
}
