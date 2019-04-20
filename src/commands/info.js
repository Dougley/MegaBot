const ZD = require('../megabot-internals/zendesk')
const inquire = require('../megabot-internals/controllers/inquirer')
const DB = require('../databases/lokijs')

module.exports = {
  meta: {
    level: 0,
    timeout: 10,
    alias: ['url']
  },
  fn: (msg, suffix) => {
    const id = suffix.match(MB_CONSTANTS.submissionRegex) ? suffix.match(MB_CONSTANTS.submissionRegex)[1] : suffix
    if (MB_CONSTANTS.isID(id)) {
      const reqs = DB.findSync('questions', {
        $or: [{
          type: 3,
          'ids.dupe': parseInt(id)
        }, {
          type: 3,
          'ids.target': parseInt(id)
        }, {
          type: 2,
          zd_id: parseInt(id)
        }]
      })
      const dupedelete = DB.findSync('system', {
        type: 'dupe-delete',
        zd_id: parseInt(id)
      })
      ZD.getSubmission(id, ['users', 'topics']).then(x => {
        let str
        if (reqs) {
          if (reqs.type === 3) str = `This suggestion is ${reqs.ids.dupe === parseInt(id) ? `set to be merged into ${reqs.ids.target}` : `being targeted as a master for ${reqs.ids.dupe}`}`
          else if (reqs.type === 2) str = 'This suggestion is marked for deletion'
        } else if (dupedelete) str = 'This suggestion is queued to be deleted due to a successful merge'
        else str = 'This suggestion is normal' // required, cant leave embed fields unfinished
        return msg.channel.createMessage({
          embed: {
            color: 0x3498db,
            author: {
              name: x.sideloads.users[0].name,
              icon_url: x.sideloads.users[0].photo ? x.sideloads.users[0].photo.content_url : undefined
            },
            title: x.title.length > 250 ? x.title.substring(0, 250) + '...' : x.title,
            description: x.cleanContent.length > 2048 ? '*Content too long*' : x.cleanContent,
            url: x.htmlUrl,
            timestamp: x.createdAt,
            footer: {
              text: x.sideloads.topics[0].name
            },
            fields: [
              {
                name: 'Opinion',
                value: x.voteSum,
                inline: true
              },
              {
                name: 'Votes',
                value: x.voteCount,
                inline: true
              },
              {
                name: 'Comments',
                value: x.commentCount,
                inline: true
              },
              {
                name: 'Additional info',
                value: str
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
