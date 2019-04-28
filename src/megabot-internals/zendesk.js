const SA = require('superagent')
const QS = require('querystring')
const DB = require('../databases/redis')

const ROOT_URL = `${process.env.ZENDESK_ROOT_URL}/api/v2`
const schedule = async (...args) => {
  if (typeof args[0] === 'object') args[0] = { expiration: 10000, ...args[0] }
  else args.unshift({ expiration: 10000 })
  return MB_CONSTANTS.limiter.schedule(...args)
}

const Submission = require('./classes/Submission')
const Vote = require('./classes/Vote')
const Comment = require('./classes/Comment')
const Topic = require('./classes/Topic')

module.exports = {
  /**
   * Gets a list of recent submissions
   * @param {Object} opts - Options to pass to Zendesk
   * @param {String} [opts.sort_by=created_at] - How posts should be sorted
   * @param {Array | String} [opts.include=users] - Array or comma separated string of types to sideload alongside this request
   * @param {String} [opts.filter_by] - Filter posts to only show posts with a certain state
   * @param {Number} [opts.page=1] - Pagination, which page of data to get
   * @param {Number} [opts.per_page=20] - Pagination, how many records to return per page
   * @see {@link https://developer.zendesk.com/rest_api/docs/help_center/topics#list-topics Zendesk docs on this route}
   * @see {@link https://developer.zendesk.com/rest_api/docs/support/side_loading Zendesk docs on sideloading}
   * @returns {Promise<Submission[]>} - Zendesk response
   */
  getSubmissions: async (opts = {}) => {
    const defaults = {
      sort_by: 'created_at',
      include: 'users',
      page: 1,
      per_page: 20
    }
    if (opts.include && Array.isArray(opts.include)) opts.include = opts.include.join(',')
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/community/posts.json?${QS.stringify({ ...defaults, ...opts })}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body.posts.map(x => new Submission(res.body, x))
  },
  /**
   * List submissions from a user
   * @param {Number | String} id - The Zendesk ID of the user
   * @param {Object} opts - Optional params to pass to Zendesk
   * @returns {Promise<Submission[]>}
   */
  getSubmissionsFromUser: async (id, opts = {}) => {
    const defaults = {
      sort_by: 'created_at',
      include: 'users',
      page: 1,
      per_page: 20,
      ...opts
    }
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/community/users/${id}/posts.json?${QS.stringify(defaults)}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body.posts.map(x => new Submission(res.body, x))
  },
  /**
   * List comments from a user
   * @param {Number | String} id - The Zendesk ID of the user
   * @param {Object} opts - Optional params to pass to Zendesk
   * @returns {Promise<Comment[]>}
   */
  getCommentsFromUser: async (id, opts = {}) => {
    const defaults = {
      sort_by: 'created_at',
      include: 'users',
      page: 1,
      per_page: 20,
      ...opts
    }
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/community/users/${id}/comments.json?${QS.stringify(defaults)}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body.comments.map(x => new Comment(res.body, x))
  },
  /**
   * Get information about a single submission
   * @param {Number | String} id - The ID of the submission
   * @param {Array} [includes=['users']] - Sideloads for extra records
   * @returns {Promise<Submission>} - Zendesk response
   */
  getSubmission: async (id, includes = ['users']) => {
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/community/posts/${id}.json?${QS.stringify({ include: includes.join(',') })}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return new Submission(res.body, res.body.post)
  },
  /**
   * Search for submissions
   * @param {String | Number} query - Search query
   * @returns {Promise<Submission[]>} - Zendesk response
   */
  searchSubmissions: async (query) => {
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/help_center/community_posts/search.json?${QS.stringify({ query: query })}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body.results.map(x => new Submission(res.body, x))
  },
  /**
   * Create a submission
   * @param {String} userid - Discord ID of the user you're acting on behalf on
   * @param {Object} data - Zendesk-compatible payload
   * @returns {Promise<Submission>} - Zendesk response
   */
  postSubmission: async (userid, data) => {
    const userdata = await getUserDetails(userid)
    data = { author_id: userdata.id, notify_subscribers: false, ...data }
    const res = await schedule(() => SA
      .post(`${ROOT_URL}/community/posts.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({ post: data }))
    logger.http(res.body)
    return new Submission(res.body, res.body.post)
  },
  /**
   * Edit a submission
   * @param {String} id - Zendesk ID of the submission
   * @param {Object} data - Zendesk-compatible payload
   * @returns {Promise<Submission>} - Zendesk response
   */
  editSubmission: async (id, data) => {
    const res = await schedule(() => SA
      .put(`${ROOT_URL}/community/posts/${id}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({ post: data }))
    logger.http(res.body)
    return new Submission(res.body, res.body.post)
  },
  /**
   * Permanently destroy a submission
   * @param {Number | String} id - The ID of the submission to destroy
   * @returns {Promise<Request>}
   */
  destroySubmission: async (id) => {
    return schedule(() => SA
      .delete(`${ROOT_URL}/community/posts/${id}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
  },
  /**
   * Create a vote on a submission
   * @param {Object} ctx - Context of the request
   * @param {String} [ctx.discordId] - Discord ID of the user you're acting on behalf on, not required if opts.user_id is defined
   * @param {Number} [ctx.priority=5] - What priority this request should run at, must be a number from 0 to 9
   * @param {Number | String} ctx.cardId - The ID of the suggestion you're executing this action on
   * @param {String} [ctx.type=up] - What vote to apply, can be 'up' or 'down'
   * @param {Object} [opts={}] - Options for the request
   * @param {Number} [opts.user_id] - Zendesk ID of the user you're acting on behalf on, not required if ctx.discordId is defined
   * @returns {Promise<Vote>} - Zendesk response
   */
  applyVote: async (ctx, opts = {}) => {
    if (ctx.discordId) {
      opts.user_id = (await getUserDetails(ctx.discordId)).id
    }
    const defaults = {
      type: 'up',
      ...ctx
    }
    const res = await schedule({ priority: ctx.priority || 5 }, () => SA
      .post(`${ROOT_URL}/community/posts/${defaults.cardId}/${defaults.type}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({ vote: opts }))
    logger.http(res.body)
    return new Vote(res.body, res.body.vote)
  },
  /**
   * Delete a vote
   * @param id - ID of the vote
   * @return {Promise<Request>}
   */
  deleteVote: async (id) => {
    return schedule(() => SA
      .delete(`${ROOT_URL}help_center/votes/${id}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    )
  },
  /**
   * Get all votes for a submission
   * @param {Number | String} id - The ID of the submission
   * @param {Object} opts - Options to pass to Zendesk
   * @param {Number} [opts.page=1] - Pagination, which page of data to get
   * @param {Number} [opts.per_page=20] - Pagination, how many records to return per page
   * @param {Number} [opts.priority=5] - The priority this request should run at, must be a number from 0 to 9
   * @returns {Promise<Vote[]>}
   */
  getVotes: async (id, opts) => {
    const options = {
      per_page: 20,
      page: 1,
      priority: 5,
      ...opts
    }
    const res = await schedule({ priority: options.priority || 5 }, () => SA
      .get(`${ROOT_URL}/community/posts/${id}/votes.json?${QS.stringify(options)}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body.votes.map(x => new Vote(res.body, x))
  },
  /**
   * Return a list of comments on a record
   * @param {Number | String} id - ID of the record to query
   * @param {Object} opts - Options to pass to Zendesk
   * @param {String} [opts.type=posts] - Type of record to query, can be 'users' or 'posts'
   * @param {Array | String} [opts.include=users] - Array or comma separated string of types to sideload alongside this request
   * @param {Number} [opts.page=1] - Pagination, which page of data to get
   * @param {Number} [opts.per_page=20] - Pagination, how many records to return per page
   * @param {Number} [opts.priority=5] - The priority this request should run at, must be a number from 0 to 9
   * @returns {Promise<Comment[]>} - Zendesk response
   */
  listComments: async (id, opts) => {
    const options = {
      type: 'posts',
      includes: 'users',
      page: 1,
      per_page: 20,
      priority: 5,
      ...opts
    }
    if (Array.isArray(options.includes)) options.includes = options.includes.join(',')
    const res = await schedule({ priority: options.priority || 5 }, () => SA
      .get(`${ROOT_URL}/community/${options.type}/${id}/comments.json?${QS.stringify(options)}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body.comments.map(x => new Comment(res.body, x))
  },
  /**
   * Return information on a single comment
   * @param {Number | String} postid - ID of the submission
   * @param {Number | String} commentid - ID of the comment
   * @param {Array} [includes=['users']] - Sideloads for extra records
   * @returns {Promise<Comment>} - Zendesk response
   */
  getComment: async (postid, commentid, includes = ['users']) => {
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/community/posts/${postid}/comments/${commentid}.json?${QS.stringify({ include: includes.join(',') })}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return new Comment(res.body, res.body.comment)
  },
  /**
   * Create a comment on a submission
   * @param {Object} ctx - Context of the request
   * @param {String} [ctx.discordId] - Discord ID of the user you're acting on behalf on, not required if opts.author_id is defined
   * @param {Number} [ctx.priority=5] - What priority this request should run at, must be a number from 0 to 9
   * @param {String | Number} ctx.id - Zendesk ID of the suggestion you're commenting on
   * @param {Object} opts - Options to pass to Zendesk,
   * @param {String | Number} [opts.author_id] - Zendesk ID of the user you're acting on behalf on, not required if ctx.discordId is defined
   * @param {String} opts.body - The actual comment you're creating
   * @param {Boolean} [opts.official] - Whether or not the comment should be marked as official
   * @param {Date} [opts.created_at] - Time at which the comment was captured, defaults to the current date
   * @see {@link https://developer.zendesk.com/rest_api/docs/help_center/post_comments#create-comment Zendesk docs on this route}
   * @returns {Promise<Comment>} - Zendesk response
   */
  createComment: async (ctx, opts) => {
    if (ctx.discordId) {
      opts.author_id = (await getUserDetails(ctx.discordId)).id
    }
    const res = await schedule({ priority: ctx.priority || 5 }, () => SA
      .post(`${ROOT_URL}/community/posts/${ctx.id}/comments.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({ comment: opts, notify_subscribers: false }))
    logger.http(res.body)
    return new Comment(res.body, res.body.comment)
  },
  /**
   * Permanently delete a comment
   * @param {Number | String} postid - Submission ID
   * @param {Number | String} commentid - Comment ID
   * @returns {Promise<Request>} - Zendesk response
   */
  deleteComment: async (postid, commentid) => {
    return schedule(() => SA
      .delete(`${ROOT_URL}/community/posts/${postid}/comments/${commentid}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
  },
  /**
   * Search for user details
   * @param {String | Number} query - Search query
   * @returns {Promise<Object>} - Zendesk response
   */
  searchUser: async (query) => {
    return getUserDetails(query)
  },
  /**
   * Get user details
   * @param {String | Number} id - ID of the user to get
   * @returns {Promise<Object>} - Zendesk response
   */
  getUser: async (id) => {
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/users/${id}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body.user
  },
  /**
   * Get a list of all topics for community
   * @return {Promise<Topic[]>}
   */
  getTopics: async () => {
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/community/topics.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body.topics.map(x => new Topic(res.body, x))
  },
  /**
   * Return a specific community topic
   * @param {String | Number} id - The ID of the topic
   * @return {Promise<Topic>}
   */
  getTopic: async (id) => {
    const res = await schedule(() => SA
      .get(`${ROOT_URL}/community/topics/${id}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return new Topic(res.body, res.body.topic)
  },
  /**
   * Create a subscription to a submission
   * @param {String | Number} postid - The ID of the submission to subscribe to
   * @param {String} userid - The Discord ID of the user you're acting on behalf on
   * @returns {Promise<Object>} - Zendesk response
   */
  createSubscription: async (postid, userid) => {
    const user = await getUserDetails(userid)
    const res = await schedule(() => SA
      .post(`${ROOT_URL}/community/posts/${postid}/subscriptions.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({ subscription: { user_id: user.id } }))
    logger.http(res.body)
    return res.body
  },
  /**
  * Delete a subscription to a submission
   * @param {String | Number} postid - The ID of the submission to unsubscribe from
   * @param {String} userid - The Discord ID of the user you're acting on behalf on
   * @returns {Promise<Object>} - Zendesk response
   */
  deleteSubscription: async (postid, userid, subscriptionid) => {
    const user = await getUserDetails(userid)
    const res = await schedule(() => SA
      .delete(`${ROOT_URL}/community/posts/${postid}/subscriptions/${subscriptionid}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
    logger.http(res.body)
    return res.body
  }
}

async function getUserDetails (id) {
  if (process.env.NODE_ENV === 'debug' && process.env.DEBUG_USER_SEARCH_OVERRIDE) id = process.env.DEBUG_USER_SEARCH_OVERRIDE
  let cache = await DB.get(`zd_u:${id}`)
  if (cache) {
    logger.debug('Returning user cache')
    return JSON.parse(cache)
  }
  const data = await schedule(() => SA
    .get(`${ROOT_URL}/users/search.json?${QS.stringify({ external_id: id })}`)
    .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY))
  logger.trace(data.body)
  if (process.env.NODE_ENV === 'debug' && process.env.DEBUG_USER_SEARCH_OVERRIDE && data.body.count !== 0) return data.body.users[0]
  if (data.body.count === 0 || !data.body.users.find(x => x.external_id === id)) throw new Error('No such user')
  else {
    await DB.set(`zd_u:${id}`, JSON.stringify({
      ...data.body.users.find(x => x.external_id === id)
    }), 'EX', 604800) // expire in 1 week
    return data.body.users.find(x => x.external_id === id)
  }
}
