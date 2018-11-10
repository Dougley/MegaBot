const SA = require('superagent')
const QS = require('querystring')

const ROOT_URL = process.env.ZENDESK_ROOT_URL

module.exports = {
  getSubmissions: async (sort = 'created_at', includes = ['users'], filter = '') => {
    const res = await SA
      .get(`${ROOT_URL}/api/v2/community/posts.json?${QS.stringify({sort_by: sort, include: includes, filter_by: filter})}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    return res.body
  },
  getSubmission: async (id, includes = ['users']) => {
    const res = await SA
      .get(`${ROOT_URL}/api/v2/community/posts/${id}.json?${QS.stringify({include: includes})}`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
    return res.body
  },
  postSubmission: async (userid, data) => {
    const userdata = await getUserDetails(userid)
    data = {...data, author_id: userdata.id, notify_subscribers: false}
    const res = await SA
      .post(`${ROOT_URL}/api/v2/community/posts.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({post: data})
    return res.body
  },
  destroySubmission: async (id) => {
    return SA
      .delete(`${ROOT_URL}/api/v2/community/posts/${id}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
  },
  applyVote: async (user, cardid, type = 'up') => {
    const userinfo = await getUserDetails(user)
    const res = await SA
      .post(`${ROOT_URL}/api/v2/community/posts/${cardid}/${type}.json`)
      .auth(`${process.env.ZENDESK_DEFAULT_ACTOR}/token`, process.env.ZENDESK_API_KEY)
      .send({vote: {user_id: userinfo.id}})
    return res.body
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
