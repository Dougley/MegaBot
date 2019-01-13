const Base = require('./Base')
const Striptags = require('striptags')
const Entities = require('html-entities').AllHtmlEntities
const decoder = new Entities()

/**
 * Represents a submission
 * @extends Base
 * @property {String} rawContent - The raw content of the submission, be aware that this might include HTML tags
 * @property {String} title - The title of the submission
 * @property {Number} authorId - The ID of the author that created this submission
 * @property {Boolean} pinned - Whether or not this submission is pinned
 * @property {Boolean} closed - Whether ot not this submission is closed
 * @property {String} status - The status of the submission
 * @property {Number} voteSum - The sum of all votes on the submission, can be negative
 * @property {Number} voteCount - The total number of times this submission has been voted on
 * @property {Number} commentCount - The total number of comments on this submission
 * @property {Number} followerCount - The total number of followers for this submission
 * @property {Number} topicId - The ID of the topic this submission belongs to
 */
class Submission extends Base {
  constructor (response, postdata) {
    super(response, postdata)
    this.rawContent = postdata.details
    this.title = postdata.title
    this.authorId = postdata.author_id
    this.pinned = postdata.pinned
    this.featured = postdata.featured
    this.closed = postdata.closed
    this.status = postdata.status
    this.voteSum = postdata.vote_sum
    this.voteCount = postdata.vote_count
    this.commentCount = postdata.comment_count
    this.followerCount = postdata.follower_count
    this.topicId = postdata.topic_id
  }

  /**
   * Get clean content of the submission
   * @readonly
   * @returns {String}
   */
  get cleanContent () {
    return decoder.decode(Striptags(this.rawContent))
  }
}

module.exports = Submission
