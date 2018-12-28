const ZD = require('../megabot-internals/zendesk')
const ids = require('../megabot-internals/ids')
const inq = require('../megabot-internals/inquirer')
const db = require('../databases/lokijs')

module.exports = {
  /**
   * Regenerate top 10 suggestions
   * This function returns void, and takes no arguments
   * @returns {Promise<void>}
   */
  regenerate: async () => {
    const channel = bot.getChannel(ids.top10channel)
    const editable = (await channel.getMessages()).filter(x => x.author.id === bot.user.id)
    ZD.getSubmissions({
      sort_by: 'votes',
      include: 'users,topics',
      filter_by: 'none'
    }).then(submissions => {
      if (editable.length > 10) {
        // delete extraneous messages
        const remove = editable.slice(Math.max(editable.length - 10, 1)).map(x => x.id)
        channel.deleteMessages(remove).catch(() => {
          // this didnt work, might be too old
          // try removing manually
          remove.forEach(x => channel.deleteMessage(x))
        })
      }
      const toedit = editable.slice(0, 10)
      submissions.slice(0, 10).forEach(async c => {
        let x = toedit.pop()
        if (x) {
          const maybeid = await db.find('questions', {
            wb_id: x.id,
            type: 4
          })
          if (maybeid && maybeid.zd_id !== c.id) await x.removeReactions() // in case the message doesnt reflect the suggestion we're about to display
          x.edit(generateEmbed(c)).then(x => inq.createTopvote(x, c.id))
        } else channel.createMessage(generateEmbed(c)).then(x => inq.createTopvote(x, c.id))
      })
    })
  }
}

function generateEmbed (data) {
  return {
    embed: {
      title: data.title,
      description: data.cleanContent.length === 0 ? '*No content*' : (data.cleanContent.length > 1024 ? `${data.cleanContent.slice(0, 990)}...\n*[Content has been cut off]*` : data.cleanContent),
      url: data.htmlUrl,
      timestamp: data.createdAt,
      // color: (data.status) ? parseInt(data.status.hex_color.substr(1), 16) : 0x595f68,
      footer: {
        text: data.sideloads.topics.find(x => x.id === data.topicId).name
      },
      author: {
        name: data.sideloads.users.find(x => x.id === data.authorId).name,
        icon_url: data.sideloads.users.find(x => x.id === data.authorId).photo ? data.sideloads.users.find(x => x.id === data.authorId).photo.content_url : undefined
      },
      fields: [
        {
          name: 'Votes',
          value: data.voteSum,
          inline: true
        }
      ]
    }
  }
}
