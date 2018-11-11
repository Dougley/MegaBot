/**
 * The base class for all subsequent classes
 */
class Base {
  constructor (props, data) {
    this.id = data.id
    this.createdAt = new Date(data.created_at)
    this.updatedAt = new Date(data.updated_at)
    this.apiUrl = data.url
    this.htmlUrl = data.html_url
    this.sideloads = {users: props.users, topics: props.topics, posts: props.posts, comments: props.comments}
    this._raw = props
  }
}

module.exports = Base
