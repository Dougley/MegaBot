const SA = require('superagent')
const QS = require('querystring')

const ROOT_URL = process.env.ZENDESK_ROOT_URL

const Submission = require('./classes/Submission')
const Vote = require('./classes/Vote')
const Comment = require('./classes/Comment')

module.exports = {
  /**
   * Gets a list of recent submissions
   * @param {String} sort - How posts should be sorted, defaults to 'created_at'
   * @param {Array} includes - Sideloads for extra records
   * @param {String} filter - List only posts with a certain state
   * @param {Number} page - Pagination, the page number to get
   * @returns {Promise<Submission[]>} - Zendesk response
   */
  getSubmissions: async (sort = 'created_at', includes = ['users'], filter = '', page = 0) => {
    const res = await SA
      .get(`${ROOT_URL}/api/v2/community/posts.json?${QS.stringify({sort_by: sort, include: includes, filter_by: filter, page: page})}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    return res.body.posts.map(x => new Submission(res.body, x))
  },
  /**
   * Get information about a single submission
   * @param {Number | String} id - The ID of the submission
   * @param {Array} includes - Sideloads for extra records
   * @returns {Promise<Submission>} - Zendesk response
   */
  getSubmission: async (id, includes = ['users']) => {
    const res = await SA
      .get(`${ROOT_URL}/api/v2/community/posts/${id}.json?${QS.stringify({include: includes})}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    return new Submission(res.body, res.body.post)
  },
  /**
   * Create a submission
   * @param {String} userid - Discord ID of the user you're acting on behalf on
   * @param {Object} data - Zendesk-compatible payload
   * @returns {Promise<Submission>} - Zendesk response
   */
  postSubmission: async (userid, data) => {
    const userdata = await getUserDetails(userid)
    data = {...data, author_id: userdata.id, notify_subscribers: false}
    const res = await SA
      .post(`${ROOT_URL}/api/v2/community/posts.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({post: data})
    return new Submission(res.body, res.body.post)
  },
  /**
   * Permanently destroy a submisson
   * @param {Number | String} id - The ID of the submission to destroy
   * @returns {Promise<Request>}
   */
  destroySubmission: async (id) => {
    return SA
      .delete(`${ROOT_URL}/api/v2/community/posts/${id}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
  },
  /**
   * Create a vote on a submission
   * @param {String} user - Discord ID of the user you're acting on behalf on
   * @param {Number | String} cardid - ID of the submission
   * @param {String} [type=up] - Type of vote, can be 'down' or 'up', defaults to 'up'
   * @returns {Promise<Object>} - Zendesk response
   */
  applyVote: async (user, cardid, type = 'up') => {
    const userinfo = await getUserDetails(user)
    const res = await SA
      .post(`${ROOT_URL}/api/v2/community/posts/${cardid}/${type}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({vote: {user_id: userinfo.id}})
    return new Vote(res.body, res.body.vote)
  },
  /**
   * Get all votes for a submission
   * @param {Number | String} id - The ID of the submission
   * @param {Number} page - Pagination, the page number to get
   * @returns {Promise<Vote[]>}
   */
  getVotes: async (id, page = 0) => {
    const res = await SA
      .get(`${ROOT_URL}/api/v2/community/posts/${id}/votes.json?${QS.stringify({page: page})}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    return res.body.votes.map(x => new Vote(res.body, x))
  },
  /**
   * Return a list of comments on a record
   * @param {Number | String} id - ID of the record to query
   * @param {String} [type=posts] - Type of record to query, can be 'users' or 'posts', defaults to 'posts'
   * @param {Array} includes - Sideloads for extra records
   * @param {Number} page - Pagination, the page number to get
   * @returns {Promise<Comment[]>} - Zendesk response
   */
  listComments: async (id, type = 'posts', includes = ['users'], page = 0) => {
    const res = await SA
      .get(`${ROOT_URL}/api/v2/community/${type}/${id}/comments.json?${QS.stringify({include: includes, page: page})}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    return res.body.comments.map(x => new Comment(res.body, x))
  },
  /**
   * Return information on a single comment
   * @param {Number | String} postid - ID of the submission
   * @param {Number | String} commentid - ID of the comment
   * @param {Array} includes - Sideloads for extra records
   * @returns {Promise<Comment>} - Zendesk response
   */
  getComment: async (postid, commentid, includes = ['users']) => {
    const res = await SA
      .get(`${ROOT_URL}/api/v2/community/posts/${postid}/comments/${commentid}.json?${QS.stringify({include: includes})}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    return new Comment(res.body, res.body.comment)
  },
  /**
   * Create a comment on a submission
   * @param {String} user - Discord ID of the user you're acting on behalf on
   * @param {Number | String} id - Submission ID
   * @param {String} comment - Comment to post
   * @returns {Promise<Comment>} - Zendesk response
   */
  createComment: async (user, id, comment) => {
    const userinfo = await getUserDetails(user)
    const res = await SA
      .post(`${ROOT_URL}/api/v2/community/posts/${id}/comments.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({comment: {body: comment, author_id: userinfo.id}, notify_subscribers: false})
    return new Comment(res.body, res.body.comment)
  },
  /**
   * Permanently delete a comment
   * @param {Number | String} postid - Submission ID
   * @param {Number | String} commentid - Comment ID
   * @returns {Promise<Request>} - Zendesk response
   */
  deleteComment: async (postid, commentid) => {
    return SA
      .delete(`${ROOT_URL}/api/v2/community/posts/${postid}/comments/${commentid}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
  }
}

async function getUserDetails (id) {
  if (process.env.NODE_ENV === 'debug' && process.env.DEBUG_USER_SEARCH_OVERRIDE) id = process.env.DEBUG_USER_SEARCH_OVERRIDE
  const data = await SA
    .get(`${ROOT_URL}/api/v2/users/search.json?${QS.stringify({query: id})}`)
    .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
  if (process.env.NODE_ENV === 'debug' && process.env.DEBUG_USER_SEARCH_OVERRIDE) return data.body.users[0]
  if (data.body.count === 0 || !data.body.users.find(x => x.external_id === id)) throw new Error('No such user')
  else return data.body.users.find(x => x.external_id === id)
}
