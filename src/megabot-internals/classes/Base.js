/**
 * The base class for all subsequent classes
 * @property {Number} id - The ID of the object
 * @property {String} apiUrl - The corresponding API URL
 * @property {String} htmlUrl - The corresponding Community URL
 * @property {Date} createdAt - The time at which the object was created
 * @property {Date} updatedAt - The time at which the object was last updated
 * @property {Object} sideloads - Any data you might have sideloaded
 * @property {Object} pagination - Pagination information
 * @property {String | null} pagination.nextPage - The next page in the set
 * @property {String | null} pagination.previousPage - The previous page in the set
 * @property {Number | null} pagination.count - The number of objects in the set
 */
class Base {
  constructor (props, data) {
    this.id = data.id
    this.createdAt = new Date(data.created_at)
    this.updatedAt = new Date(data.updated_at)
    this.apiUrl = data.url
    this.htmlUrl = data.html_url
    this.sideloads = { users: props.users, topics: props.topics, posts: props.posts, comments: props.comments }
    this._raw = props
    this.pagination = {
      nextPage: props.next_page,
      previousPage: props.previous_page,
      count: props.count
    }
  }
}

module.exports = Base
