const ZD = require('../megabot-internals/zendesk')
const AQ = require('../megabot-internals/controllers/admin-queue')
const DB = require('../databases/lokijs')
const INQ = require('../megabot-internals/controllers/inquirer')
const ID = require('../megabot-internals/ids')

module.exports = {
  meta: {
    level: 1
  },
  fn: async (msg, suffix) => {
    const chunks = suffix.split(' ')
    let dupe, target
    try {
      dupe = await ZD.getSubmission(MB_CONSTANTS.submissionRegex.test(chunks[0]) ? chunks[0].match(MB_CONSTANTS.submissionRegex)[1] : chunks[0], ['users', 'topics'])
      target = await ZD.getSubmission(MB_CONSTANTS.submissionRegex.test(chunks[1]) ? chunks[1].match(MB_CONSTANTS.submissionRegex)[1] : chunks[1], ['users', 'topics'])
    } catch (e) {
      return msg.channel.createMessage(MB_CONSTANTS.generateErrorMessage(e))
    }
    if (dupe.id === target.id) return msg.channel.createMessage("Can't merge 2 of the same suggestions!")
    if (DB.findSync('questions', {
      'ids.dupe': dupe.id,
      type: 3
    })) return msg.channel.createMessage(`A dupe request targeting ${dupe.id} was already submitted`)
    if (dupe.status === 'answered' && !process.env.UNRESTRICTED_DUPE) return msg.channel.createMessage("You can't merge a suggestion that's marked as `Answered`. If you feel this is in error, contact Dannysaur")
    const x = await msg.channel.createMessage({
      content: 'This merge request will result in this suggestion when approved, is this correct?',
      ...generateEmbed(dupe, target)
    })
    await stall(2000)
    INQ.awaitReaction([ID.emojis.confirm, ID.emojis.dismiss], x, msg.author.id).then(z => {
      if (z.id === ID.emojis.confirm.id) {
        AQ.createMergeRequest(dupe, target, msg.author).then(() => x.edit({ content: 'Dupe request submitted', embed: null }))
      } else if (z.id === ID.emojis.dismiss.id) {
        x.edit({ content: 'Dupe request cancelled', embed: null })
      }
    }).catch(z => {
      if (z.message === 'Timed out') return x.edit({ content: 'You took too long to answer, operation cancelled.', embed: null })
      else logger.error(z)
    })
  }
}

const stall = (timeout) => {
  return new Promise(resolve => {
    setTimeout(() => { return resolve() }, timeout)
  })
}

const generateEmbed = (dupe, target) => {
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
          value: `${target.voteCount + dupe.voteCount} - ${target.voteSum + dupe.voteSum}`,
          inline: true
        }
      ]
    }
  }
}
