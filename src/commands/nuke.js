const zd = require('../megabot-internals/zendesk')
const ids = require('../megabot-internals/ids')
const dlog = require('../megabot-internals/dlog')
const { awaitReaction } = require('../megabot-internals/controllers/inquirer')

module.exports = {
  meta: {
    level: 3
  },
  fn: async (msg, suffix) => {
    const message = await msg.channel.createMessage('Hang on...')
    try {
      const user = await zd.getUser(suffix)
      await message.edit('User found, paginating content, this can take a while...')
      const suggestions = await getAllSuggestions(user.id)
      const comments = await getAllComments(user.id)
      await message.edit({
        content: `Please confirm, you're about to purge all content from user ${user.id}\nThis is irreversible!`,
        embed: {
          fields: [
            {
              name: 'Total suggestions',
              value: suggestions.length,
              inline: true
            },
            {
              name: 'Total comments',
              value: comments.length,
              inline: true
            }
          ]
        }
      })
      const reply = await awaitReaction([ids.emojis.confirm, ids.emojis.dismiss], message, msg.author.id)
      if (reply.id === ids.emojis.confirm) {
        message.edit('Alright, queueing up content to be deleted.')
        await dlog(4, {
          message: `${msg.author.username}#${msg.author.discriminator} has purged all content from a Zendesk user with ID ${user.id}`
        })
        comments.forEach(x => zd.deleteComment(x.postId, x.id))
        suggestions.forEach(x => zd.destroySubmission(x.id))
      } else {
        message.edit('Leaving content untouched')
      }
    } catch (e) {
      if (e.message === 'Timed out') return message.edit('Reaction processing timed out, try again!')
      message.edit('Something went wrong! D:')
      logger.error(e)
    }
  }
}

const getAllComments = async (id) => {
  let votes = []
  let keepGoing = true
  let page = 1
  while (keepGoing) {
    let data = await zd.getCommentsFromUser(id, {
      page: page,
      priority: 9
    })
    await votes.push.apply(votes, data)
    if (data[0] && data[0].pagination.nextPage !== null) page++
    else keepGoing = false
  }
  return votes
}

const getAllSuggestions = async (id) => {
  let votes = []
  let keepGoing = true
  let page = 1
  while (keepGoing) {
    let data = await zd.getSubmissionsFromUser(id, {
      page: page,
      priority: 9
    })
    await votes.push.apply(votes, data)
    if (data[0] && data[0].pagination.nextPage !== null) page++
    else keepGoing = false
  }
  return votes
}
