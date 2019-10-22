const zd = require('../zendesk')
const db = require('../../databases/lokijs')
const inq = require('./inquirer')
const { Message } = require('eris')

module.exports = {
  /**
   * Refreshes the feed and set playing status
   * This gets recent submissions and posts them to the feed channel
   * This method is intended to run in an interval
   * @returns {Promise<void>}
   */
  refresh: async () => {
    const filterer = (x) => {
      return !db.findSync('questions', {
        zd_id: x.id,
        type: 1
      })
    }
    const data = await zd.getSubmissions({
      include: 'users,topics'
    })
    await bot.editStatus('online', {
      name: `${data[0].pagination.count} suggestions`,
      type: 3 // watching
    })
    const unknown = data.filter(filterer)
    unknown.reverse().forEach(x => { // we reverse this for reverse chronological order (newest last)
      bot.executeWebhook(process.env.DISCORD_WEBHOOK_ID, process.env.DISCORD_WEBHOOK_TOKEN, generateEmbed(x)).then(z => inq.createFeedvote(new Message(z, bot), x.id))
    })
  }
}

function generateEmbed (suggestion) {
  const content = suggestion.cleanContent.replace(MB_CONSTANTS.inviteRegex, '[invite censored]')
  return {
    wait: true,
    embeds: [{
      color: 0x7bffd3,
      title: suggestion.title.length > 250 ? suggestion.title.substring(0, 250) + '...' : suggestion.title,
      description: content.length === 0 ? '*No content*' : (content.length > 1024 ? `${content.slice(0, 990)}...\n*[Content has been cut off]*` : content),
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
