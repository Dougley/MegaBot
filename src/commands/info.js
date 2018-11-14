const ZD = require('../megabot-internals/zendesk')
const inquire = require('../megabot-internals/inquirer')

module.exports = {
  meta: {
    level: 0,
    timeout: 10
  },
  fn: (msg, suffix) => {
    const id = suffix.match(MB_CONSTANTS.regex) ? suffix.match(MB_CONSTANTS.regex)[1] : suffix
    if (MB_CONSTANTS.isID(id)) {
      ZD.getSubmission(id).then(x => {
        console.log(x.sideloads.users[0])
        return msg.channel.createMessage({
          embed: {
            color: 0x3498db,
            author: {
              name: x.sideloads.users[0].name,
              icon_url: x.sideloads.users[0].photo ? x.sideloads.users[0].photo.content_url : undefined
            },
            title: x.title,
            description: x.cleanContent,
            url: x.htmlUrl,
            timestamp: x.createdAt,
            fields: [
              {
                name: 'Opinion',
                value: x.voteSum,
                inline: true
              },
              {
                name: 'Voters',
                value: x.voteCount,
                inline: true
              }
            ]
          }
        }).then(z => { inquire.createChatvote(z, x.id) })
      }).catch(e => {
        return msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
      })
    } else return msg.channel.createMessage('You can only use this command to return info on suggestions!')
  }
}
