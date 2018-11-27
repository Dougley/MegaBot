const ZD = require('../megabot-internals/zendesk')
const IDs = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 0,
    timeout: 10,
    noDM: true,
    alias: ['suggest']
  },
  fn: (msg, suffix) => {
    if (!IDs.channels[msg.channel.id]) return
    const chunks = suffix.split(' | ').map(x => x.trim())
    if (suffix.trim().length < 5 || chunks.length === 0) return msg.channel.createMessage('Please enter a suggestion, at least a title is required')
    if (chunks[0].length >= 255) return msg.channel.createMessage('Your title is too long, consider splitting more of your title into the description (`!submit title | description`)')
    ZD.postSubmission(msg.author.id, {
      title: chunks[0],
      details: chunks[1] ? chunks[1] : undefined,
      topic_id: IDs.channels[msg.channel.id]
    }).then(x => {
      msg.delete()
      msg.channel.createMessage({
        content: `<@${msg.author.id}>, your suggestion was submitted!`,
        embed: {
          color: 0x3498db,
          author: {
            name: msg.author.username,
            icon_url: msg.author.dynamicAvatarURL()
          },
          title: x.title,
          description: x.cleanContent,
          url: x.htmlUrl,
          timestamp: new Date()
        }
      })
    }).catch(e => {
      msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    })
  }
}
