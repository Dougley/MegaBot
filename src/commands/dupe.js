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
      if (chunks.length < 2) return await message.edit("Invalid formatting, make sure there's a space between each ID.")
      if (chunks.length > 6) return await message.edit("Can't multimerge more than 5 suggestions!")
      const target = await ZD.getSubmission(MB_CONSTANTS.determineID(chunks.pop()), ['users', 'topics'])
      const dupes = await Promise.all(chunks.map(x => ZD.getSubmission(MB_CONSTANTS.determineID(x), ['users', 'topics'])))
      const zduser = await ZD.searchUser(msg.author.id)
      const result = { pass: [], fail: [] }
      for (const x of dupes) {
        if (x.id === target.id || result.pass.some(z => z.id === x.id)) result.fail.push(`${x.id} [Duplicate ID]`)
        else if (x.status === 'answered') result.fail.push(`${x.id} [Suggestion answered]`)
        else if (DB.findSync('questions', { 'ids.dupe': x.id, type: 3 })) result.fail.push(`${x.id} [Already submitted]`)
        else if (x.authorId === zduser.id) result.fail.push(`${x.id} [Own suggestion]`)
        else result.pass.push(x)
      }
      if (result.pass.length === 0) return await message.edit('Your merge request resulted in no usable results!\n```ini\n' + result.fail.join('\n') + '```')
      else {
        await message.edit({
          content: (result.fail.length > 0 ? '\n⚠ **Warning**, some IDs were automatically removed due to rule violations:\n```ini\n' + result.fail.join('\n') + '```' : 'Is this correct?'),
          ...generateEmbed(result.pass, target)
        })
      }
      await stall(2000)
      let emojis = [ID.emojis.dismiss, ID.emojis.confirm]
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value)
      const response = await INQ.awaitReaction(emojis, message, msg.author.id)
      if (response.id === ID.emojis.confirm.id) {
        const ids = (await Promise.all(result.pass.map(x => AQ.createMergeRequest(x, target, msg.author)))).map(x => x['$loki'])
        await message.edit({
          content: 'Dupe request submitted',
          embed: {
            fields: [
              {
                name: 'Dupes',
                value: result.pass.map(x => `[${x.title}](${x.htmlUrl})`).join('\n')
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
        await message.edit({ content: 'Dupe request cancelled', embed: null })
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
