const zd = require('../megabot-internals/zendesk')

module.exports = {
  meta: {
    level: 0,
    timeout: 5,
    alias: ['find']
  },
  fn: async (msg, suffix) => {
    if (!suffix || suffix.length < 1) return msg.channel.createMessage('Enter a search term!')
    msg.channel.sendTyping()
    const data = await zd.searchSubmissions(suffix)
    if (data.length > 0) msg.channel.createMessage(generateEmbed(data.slice(Math.max(data.length - 5, 0)), suffix))
    else msg.channel.createMessage('Nothing found with your query!')
  }
}

const generateEmbed = (data, suffix) => {
  return {
    content: 'Found the following suggestions',
    embed: {
      color: 0x008080,
      description: data.map(x => `[${x.title}](${x.htmlUrl}) - ${x.id}`).join('\n') +
        '\n\n' +
        `[Full results](${process.env.ZENDESK_ROOT_URL}/hc/en-us/search?utf8=✓?${require('querystring').stringify({ query: suffix })})`,
      footer: {
        text: `Showing the top 5 results.`
      }
    }
  }
}
