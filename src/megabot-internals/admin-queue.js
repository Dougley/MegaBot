const db = require('../databases/lokijs')
const ids = require('./ids')
const inq = require('./inquirer')
const xp = require('../features/exp')
const zd = require('./zendesk')

const Submission = require('./classes/Submission')

module.exports = {
  /**
   * Begin an admin action to delete a suggestion
   * @param {Submission} suggestion - The suggestion to start this action on
   * @param {Message} msg - The message that reported this suggestion
   * @return {Promise<void>}
   */
  createDeletionRequest: async (suggestion, msg) => {
    if (await db.find('questions', {
      zd_id: suggestion.id,
      type: 2
    }) && process.env.NODE_ENV !== 'debug') return
    const channel = bot.getChannel(ids.queue)
    const creator = await zd.getUser(suggestion.authorId)
    channel.createMessage({
      content: 'The following suggestion was marked for deletion, please confirm\n**Confirming this request destroys the suggestion IRREVERSIBLY, please be certain**',
      embed: {
        color: 0x3498db,
        author: {
          name: suggestion.sideloads.users[0].name,
          icon_url: suggestion.sideloads.users[0].photo ? suggestion.sideloads.users[0].photo.content_url : undefined
        },
        title: suggestion.title.length > 250 ? suggestion.title.substring(0, 250) + '...' : suggestion.title,
        description: suggestion.cleanContent.length > 2048 ? '*Content too long*' : suggestion.cleanContent,
        url: suggestion.htmlUrl,
        timestamp: suggestion.createdAt,
        footer: {
          text: suggestion.sideloads.topics[0].name
        },
        fields: [
          {
            name: 'Opinion',
            value: suggestion.voteSum,
            inline: true
          },
          {
            name: 'Voters',
            value: suggestion.voteCount,
            inline: true
          },
          {
            name: 'Comments',
            value: suggestion.commentCount,
            inline: true
          }
        ]
      }
    }).then(async x => {
      const users = await msg.getReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`)
      xp.holdEXP(x.id, {
        users: users.filter(x => x.id !== bot.user.id).map(x => x.id),
        gain: MB_CONSTANTS.rewards.report,
        type: 1,
        message: 'Reported invalid submission',
        zd_id: suggestion.id
      })
      xp.holdEXP(x.id, {
        users: [creator.external_id],
        gain: -Math.abs(MB_CONSTANTS.rewards.submit),
        type: 2,
        message: 'A suggestion you submitted got deleted',
        zd_id: suggestion.id
      })
      inq.startAdminDeleteRequest({
        type: 2,
        zd_id: suggestion.id
      }, x)
    })
  },
  /**
   * Begin an admin action to delete a comment
   * @param {String | Number} comment - The Zendesk ID of the comment to delete
   * @param {String | Number} card - The Zendesk ID of the suggestion this comment is associated with
   * @param {Message} msg - The message that reported this comment
   * @return {Promise<void>}
   */
  createCommentDeletion: async (comment, card, msg) => {
    if (await db.find('questions', {
      'ids.comment': comment,
      'ids.card': card,
      type: 6
    }) && process.env.NODE_ENV !== 'debug') return
    const channel = bot.getChannel(ids.queue)
    const content = await zd.getComment(card, comment)
    channel.createMessage({
      content: 'The following comment was reported.\n**Confirming this request deletes the comment IRREVERSIBLY, please be certain**',
      embed: {
        description: `[Suggestion this comment belongs to](${content.htmlUrl})`,
        fields: [{
          name: 'Content of the comment',
          value: content.cleanContent.length === 0 ? '*No content*' : (content.cleanContent.length > 1024 ? `${content.cleanContent.slice(0, 990)}...\n*[Content has been cut off]*` : content.cleanContent)
        }]
      }
    }).then(async x => {
      const users = await msg.getReaction(`${ids.emojis.report.name}:${ids.emojis.report.id}`)
      xp.holdEXP(x.id, {
        users: users.filter(x => x.id !== bot.user.id).map(x => x.id),
        gain: MB_CONSTANTS.rewards.commentRemove,
        type: 4,
        message: 'Reported a comment',
        ids: {
          comment: comment,
          card: card
        }
      })
      inq.startAdminCommentRemove(x, comment, card)
    })
  },
  /**
   * Begin an admin action to merge two submissions together
   * @param {Submission} dupe - The suggestion that should be merged
   * @param {Submission} target - The suggestion to merge the dupe into
   * @param {User} user - Eris user object of the user that started this action
   * @return {Promise<void>}
   */
  createMergeRequest: async (dupe, target, user) => {
    if (!(dupe instanceof Submission) || !(target instanceof Submission)) throw new TypeError("Didn't supply Submission objects")
    if (await db.find('questions', {
      'ids.target': target.id,
      'ids.dupe': dupe.id,
      type: 3
    }) && process.env.NODE_ENV !== 'debug') return
    const channel = bot.getChannel(ids.queue)
    channel.createMessage({
      content: `${user.username}#${user.discriminator} wishes to merge the following suggestions:`,
      embed: {
        color: 0x7a01fa,
        description: `**Suggestion being duped**: [${dupe.title}](${dupe.htmlUrl})\n**Target suggestion**: [${target.title}](${target.htmlUrl})`,
        fields: [
          {
            name: 'Dupe: Content',
            value: dupe.cleanContent.length === 0 ? '*No content*' : (dupe.cleanContent.length > 1024 ? `${dupe.cleanContent.slice(0, 990)}...\n*[Content has been cut off]*` : dupe.cleanContent)
          },
          {
            name: 'Target: Content',
            value: target.cleanContent.length === 0 ? '*No content*' : (target.cleanContent.length > 1024 ? `${target.cleanContent.slice(0, 990)}...\n*[Content has been cut off]*` : target.cleanContent)
          },
          {
            name: 'Dupe: Votes - Opinion',
            value: `${dupe.voteCount} - ${dupe.voteSum}`,
            inline: true
          },
          {
            name: 'Target: Votes - Opinion',
            value: `${target.voteCount} - ${target.voteSum}`,
            inline: true
          }
        ]
      }
    }).then(x => {
      xp.holdEXP(x.id, {
        users: [user.id],
        gain: MB_CONSTANTS.rewards.dupe,
        type: 3,
        message: 'Merged a suggestion',
        ids: {
          dupe: dupe.id,
          target: target.id
        }
      })
      inq.startAdminMergeRequest({
        type: 3,
        ids: {
          dupe: dupe.id,
          target: target.id
        }
      }, x)
    })
  }
}
