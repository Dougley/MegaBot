const zd = require('./zendesk')
const ids = require('./ids')
const db = require('../databases/lokijs')
const top10 = require('./controllers/top10')
const ar = require('./controllers/autorole')
const feed = require('./controllers/feed')
const dlog = require('./dlog')
const notifs = require('../features/notifications')

logger.debug('Setting intervals')

module.exports = [
  setInterval(() => {
    const collections = db.listCollections().map(x => x.name)
    const query = {
      '$and': [{
        expire: {
          '$lte': Date.now()
        }
      }, {
        expire: {
          '$type': 'number'
        }
      }]
    }
    collections.forEach(x => {
      logger.debug(`Tracing collection ${x} for expired records`)
      const data = db.findManySync(x, query)
      logger.trace(data)
      if (data.length > 0) {
        logger.debug(`Removing ${data.length} expired documents from ${x}`)
        db.findAndRemove(x, query)
      }
    })
  }, 30000), // 30 seconds

  setInterval(() => {
    logger.debug('Scanning for stale users')
    const query = {
      $and: [{
        'properties.lastSeen': {
          '$lte': Date.now() - (604800000 * 4) // 1 month
        }
      }, {
        entitlements: {
          $size: 0
        }
      }]
    }
    const data = db.findManySync('users', query)
    logger.trace(data)
    if (data.length > 0) {
      logger.debug(`Removing ${data.length} stale users.`)
      data.forEach(async (x) => {
        try {
          const rewards = Object.keys(require('./rewards').roles)
          const member = await global.bot.guilds.get(ids.guild).getRESTMember(x.wb_id)
          const roles = member.roles.filter(x => rewards.includes(x))
          dlog(4, {
            message: `About to remove roles from ${member.username}#${member.discriminator} (\`${x.wb_id}\`). For reference later, they've accrued a total of ${x.properties.exp} EXP, and had ${roles.length} roles`
          })
          roles.forEach(x => member.removeRole(x, 'Member considered stale'))
        } catch (e) { logger.warn(`Can't derole ${x.wb_id}: ${e.message}`) }
      })
      db.findAndRemove('users', query)
    }
  }, 86400000), // 1 day

  setInterval(() => {
    logger.debug('Scanning for duped suggestions that are queued for deletion')
    const query = {
      type: 'dupe-delete',
      executeTime: { $lte: Date.now() }
    }
    const data = db.findManySync('system', query)
    if (data.length > 0) {
      logger.debug(`Removing ${data.length} suggestions.`)
      data.forEach(x => zd.destroySubmission(x.zd_id))
      db.findAndRemove('system', query)
    }
  }, 3600000), // 1 hour

  setInterval(() => {
    const feedvotes = db.findManySync('questions', {
      type: 1
    }, 25)
    logger.debug('Tracing feedvotes for removed submissions')
    feedvotes.forEach(x => {
      zd.getSubmission(x.zd_id).catch(e => { // no 'then', we only care about errors right now
        if (e.message === 'Not Found') {
          logger.debug(`Failed to get ${x.zd_id}, removing`)
          bot.deleteMessage(ids.feed, x.wb_id).catch(() => {}) // who cares tbh
          db.delete('questions', x.wb_id)
        }
      })
    })
   }, 120000), // 2 minutes

  setInterval(() => {
    logger.debug('Dispatching notifications')
    notifs.dispatch()
  }, (3600000 * 2)), // 2 hours

  setInterval(() => {
    logger.debug('Refreshing top10')
    top10.regenerate()
  }, 3600000), // 1 hour

  setInterval(() => {
    logger.debug('Refreshing feed')
    feed.refresh()
  }, MB_CONSTANTS.timeouts.feedScrape),

  setInterval(() => {
    logger.debug('Scanning for new custodians')
    ar.check()
  }, 3600000) // 1 hour
]
