const Base = require('./Base')
const Striptags = require('striptags')

/**
 * Represents a comment
 * @property {Number} id - The ID of the comment
 * @property {String} apiUrl - The corresponding API URL
 * @property {String} htmlUrl - The corresponding Community URL
 * @property {Date} createdAt - The time at which the comment was created
 * @property {Date} updatedAt - The time at which the comment was last updated
 * @property {Object} sideloads - Any data you might have sideloaded
 * @property {String} rawContent - The raw content of the comment, be aware that this might include HTML tags
 */
class Comment extends Base {
  constructor (props, data) {
    super(props, data)
    this.rawContent = data.body
    this.authorId = data.author_id
    this.postId = data.post_id
    this.official = data.official
    this.voteSum = data.vote_sum
    this.voteCount = data.vote_count
  }

  /**
   * Get clean content of the comment
   * @returns {string}
   */
  get cleanContent () {
    return Striptags(this.rawContent)
  }
}

module.exports = Comment
