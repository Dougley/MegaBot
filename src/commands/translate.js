const ZD = require('../megabot-internals/zendesk')
const TL = require('@vitalets/google-translate-api')
const DB = require('../databases/lokijs')
const inquire = require('../megabot-internals/controllers/inquirer')

module.exports = {
  meta: {
    level: 1,
    timeout: 10,
    alias: ['tr']
  },
  fn: async (msg, suffix) => {
    try {
      let id
      if (suffix) id = suffix.match(MB_CONSTANTS.submissionRegex) ? suffix.match(MB_CONSTANTS.submissionRegex)[1] : suffix
      else id = (DB.chain('questions').find({ type: 1 }).simplesort('expire', { desc: true }).data()[0]).zd_id // galaxybrain
      const suggestion = await ZD.getSubmission(id, ['topics', 'users'])
      const translation = await TL(suggestion.cleanContent, { to: 'en' })
      const title = await TL(suggestion.title, { to: 'en' })
      return msg.channel.createMessage({
        content: `Translated from \`${translation.from.language.iso}\` by Google Translate\nMachine translations are not always reliable, ask someone that speaks this language natively if you're not sure.`,
        embed: {
          color: 0xFFA500,
          author: {
            name: suggestion.sideloads.users[0].name,
            icon_url: suggestion.sideloads.users[0].photo ? suggestion.sideloads.users[0].photo.content_url : undefined
          },
          title: title.text.length > 250 ? title.text.substring(0, 250) + '...' : title.text,
          description: translation.text.length === 0 ? '*No content*' : (translation.text.length > 1024 ? `${translation.text.slice(0, 990)}...\n*[Content has been cut off]*` : translation.text),
          url: suggestion.htmlUrl,
          timestamp: suggestion.createdAt,
          footer: {
            text: suggestion.sideloads.topics[0].name
          }
        }
      }).then(x => inquire.createChatvote(x, suggestion.id))
    } catch (e) {
      return msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    }
  }
}
