const Base = require('./Base')
const Submission = require('./Submission')

/**
 * Represents a vote
 * @extends Base
 * @property {Number} id - The ID of the vote
 * @property {String} apiUrl - The corresponding API URL
 * @property {Date} createdAt - The time at which the vote was created
 * @property {Date} updatedAt - The time at which the vote was last updated
 * @property {Object} sideloads - Any data you might have sideloaded
 * @property {Number} value - The value of the vote
 * @property {Number} itemId - The ID of the corresponding item
 * @property {String} itemType - The type of the item
 * @property {Number} userId - The ID of the user that submitted the vote
 */
class Vote extends Base {
  constructor (props, data) {
    super(props, data)
    this.userId = data.user_id
    this.value = data.value
    this.itemId = data.item_id
    this.itemType = data.item_type
  }

  /**
   * Get the corresponding submission if possible
   * @returns {Promise<Submission>}
   */
  async getSubmission () {
    const res = await require('superagent')
      .get(`${process.env.ZENDESK_ROOT_URL}/api/v2/community/posts/${this.itemId}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    return new Submission(res.body, res.body.post)
  }
}

module.exports = Vote
