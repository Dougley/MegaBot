const ZD = require('../megabot-internals/zendesk')
const ids = require('../megabot-internals/ids')
const inq = require('../megabot-internals/inquirer')

module.exports = {
  regenerate: async () => {
    const channel = bot.getChannel(ids.top10channel)
    const editable = (await channel.getMessages()).filter(x => x.author.id === bot.user.id)
    ZD.getSubmissions('votes', ['users', 'topics']).then(submissions => {
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
      submissions.slice(0, 10).forEach(c => {
        let x = toedit.pop()
        if (x) x.edit(generateEmbed(c)).then(x => inq.createChatvote(x, c.id, false, false))
        else channel.createMessage(generateEmbed(c)).then(x => inq.createChatvote(x, c.id, false, false))
      })
    })
  }
}

function generateEmbed (data) {
  return {
    embed: {
      title: data.title,
      description: data.cleanContent.length > 1750 ? '*Content too long, check the site instead*' : data.cleanContent,
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
