const zd = require('./zendesk')
const db = require('../databases/lokijs')
const inq = require('./inquirer')
const { Message } = require('eris')

module.exports = {
  refresh: async () => {
    const filterer = (x) => {
      return !db.findSync('questions', {
        zd_id: x.id,
        type: 1
      })
    }
    const data = await zd.getSubmissions('created_at', ['users', 'topics'])
    const unknown = data.filter(filterer)
    unknown.reverse().forEach(x => { // we reverse this for reverse chronological order (newest last)
      bot.executeWebhook(process.env.DISCORD_WEBHOOK_ID, process.env.DISCORD_WEBHOOK_TOKEN, generateEmbed(x)).then(z => inq.createFeedvote(new Message(z, bot), x.id))
    })
  }
}

function generateEmbed (suggestion) {
  return {
    wait: true,
    embeds: [{
      color: 0x7bffd3,
      title: suggestion.title.length > 250 ? suggestion.title.substring(0, 250) + '...' : suggestion.title,
      description: suggestion.cleanContent.length > 2048 ? '*Content too long*' : suggestion.cleanContent,
      url: suggestion.htmlUrl,
      timestamp: suggestion.createdAt,
      footer: {
        text: `${suggestion.sideloads.topics.find(x => x.id === suggestion.topicId).name} - ID: ${suggestion.id}`
      },
      author: {
        name: suggestion.sideloads.users.find(x => x.id === suggestion.authorId).name,
        icon_url: suggestion.sideloads.users.find(x => x.id === suggestion.authorId).photo ? suggestion.sideloads.users.find(x => x.id === suggestion.authorId).photo.content_url : undefined
      }
    }]
  }
}
