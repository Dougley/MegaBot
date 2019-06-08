const ZD = require('../megabot-internals/zendesk')
const inquire = require('../megabot-internals/controllers/inquirer')
const DB = require('../databases/lokijs')

module.exports = {
  meta: {
    level: 0,
    timeout: 10,
  },
  fn: async (msg, suffix) => {
    if (MB_CONSTANTS.commentRegex.test(suffix)) {
      const chunks = suffix.match(MB_CONSTANTS.commentRegex)
      const comment = await ZD.getComment(chunks[1], chunks[2], ['posts', 'users'])
      const x = await msg.channel.createMessage({
        embed: {
          color: 0x600b99,
          title: `Comment`, // we add this so the url param works
          author: {
            name: comment.sideloads.users[0].name,
            icon_url: comment.sideloads.users[0].photo ? comment.sideloads.users[0].photo.content_url : undefined
          },
          fields: [
            {
              name: 'Suggestion this comment belongs to',
              value: `[${comment.sideloads.posts[0].title}](${comment.sideloads.posts[0].html_url})`
            }
          ],
          url: comment.htmlUrl,
          description: comment.cleanContent.length === 0 ? '*No content*' : (comment.cleanContent.length > 1024 ? `${comment.cleanContent.slice(0, 990)}...\n*[Content has been cut off]*` : comment.cleanContent),
          timestamp: comment.createdAt
        }
      })
      inquire.createCommentReporter(x, chunks[2], chunks[1])
    } else {
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
                  name: 'Status',
                  value: str
                }
              ]
            }
          }).then(z => {
            inquire.createChatvote(z, x.id)
          })
        }).catch(e => {
          return msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
        })
      } else return msg.channel.createMessage('You can only use this command to return info on suggestions!')
    }
  }
}
