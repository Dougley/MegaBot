const ZD = require('../megabot-internals/zendesk')
const AQ = require('../megabot-internals/controllers/admin-queue')
const DB = require('../databases/lokijs')
const INQ = require('../megabot-internals/controllers/inquirer')
const ID = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 1,
    alias: ['d']
  },
  fn: async (msg, suffix) => {
    const message = await msg.channel.createMessage('Working on it...')
    try {
      const chunks = suffix.split(' ')
      if (chunks.length < 2) return message.edit('Invalid formatting')
      if (chunks.length > 6) return message.edit("Can't multimerge more than 5 suggestions!")
      const target = await ZD.getSubmission(MB_CONSTANTS.determineID(chunks.pop()), ['users', 'topics'])
      if (chunks.includes(target.id.toString())) return message.edit("You've included the target ID in your dupes")
      const dupes = await Promise.all(chunks.map(x => ZD.getSubmission(MB_CONSTANTS.determineID(x), ['users', 'topics'])))
      if (dupes.some(x => x.status === 'answered')) return message.edit('Some of your dupes are marked as answered, you cannot merge those')
      if (dupes.some(x => DB.findSync('questions', { 'ids.dupe': x.id, type: 3 }))) return message.edit('One or more of your dupes have already been submitted by another Custodian. Please check the IDs and try again')
      await message.edit({
        content: 'Is this correct?',
        ...generateEmbed(dupes, target)
      })
      await stall(2000)
      let emojis = [ID.emojis.dismiss, ID.emojis.confirm]
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value)
      const response = await INQ.awaitReaction(emojis, message, msg.author.id)
      if (response.id === ID.emojis.confirm.id) {
        const ids = (await Promise.all(dupes.map(x => AQ.createMergeRequest(x, target, msg.author)))).map(x => x['$loki'])
        await message.edit({
          content: 'Dupe request submitted',
          embed: {
            fields: [
              {
                name: 'Dupes',
                value: dupes.map(x => `[${x.title}](${x.htmlUrl})`).join('\n')
              },
              {
                name: 'Target',
                value: `[${target.title}](${target.htmlUrl})`
              }
            ],
            author: {
              name: msg.author.username,
              icon_url: msg.author.dynamicAvatarURL()
            },
            footer: {
              text: `Dupe IDs: ${ids.join(', ')}`
            }
          }
        })
      } else {
        message.edit({ content: 'Dupe request cancelled', embed: null })
      }
    } catch (e) {
      return message.edit({
        content: MB_CONSTANTS.generateErrorMessage(e),
        embed: null
      })
    }
  }
}

const stall = (timeout) => {
  return new Promise(resolve => {
    setTimeout(() => { return resolve() }, timeout)
  })
}

/**
 * @param {Submission[]} dupes
 * @param {Submission} target
 * @returns {Object}
 */
const generateEmbed = (dupes, target) => {
  const sum = (dupes.map(x => x.voteSum).reduce((a, b) => a + b, 0)) + target.voteSum
  const count = (dupes.map(x => x.voteCount).reduce((a, b) => a + b, 0)) + target.voteCount
  return {
    embed: {
      author: {
        name: target.sideloads.users[0].name,
        icon_url: target.sideloads.users[0].photo ? target.sideloads.users[0].photo.content_url : undefined
      },
      color: 0x7a01fa,
      timestamp: target.createdAt,
      title: target.title,
      footer: {
        text: target.sideloads.topics[0].name
      },
      description: target.cleanContent.length === 0 ? '*No content*' : (target.cleanContent.length > 1024 ? `${target.cleanContent.slice(0, 990)}...\n*[Content has been cut off]*` : target.cleanContent),
      fields: [
        {
          name: 'Votes - Opinion',
          value: `${count} - ${sum}`,
          inline: true
        }
      ]
    }
  }
}
