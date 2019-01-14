const Base = require('./Base')

/**
 * Represents a topic
 * @extends Base
 * @property {String} name - The name of the topic
 * @property {String} description - The description of the topic
 * @property {Number} position - The position of the topic relative to other topics in the community
 * @property {Number} followerCount - The number of users following the topic
 * @property {String} manageableBy - The set of users who can manage this topic
 * @property {Number} userSegmentId - The id of the user segment to which this topic belongs
 */
module.exports = class Topic extends Base {
  constructor (response, postdata) {
    super(response, postdata)
    this.name = postdata.name
    this.description = postdata.description
    this.position = postdata.position
    this.followerCount = postdata.follower_count
    this.manageableBy = postdata.manageable_by
    this.userSegmentId = postdata.user_segment_id
  }
}
