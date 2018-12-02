const zd = require('../megabot-internals/zendesk')
const ids = require('../megabot-internals/ids')
const db = require('../databases/lokijs')
const top10 = require('../megabot-internals/top10')
const ar = require('./autorole')
const feed = require('../megabot-internals/feed')

logger.debug('Setting intervals')

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
}, 30000)

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
}, 120000)

setInterval(() => {
  logger.debug('Refreshing top10')
  top10.regenerate()
}, 3600000) // 1 hour

setInterval(() => {
  logger.debug('Refreshing feed')
  feed.refresh()
}, MB_CONSTANTS.timeouts.feedScrape)

setInterval(() => {
  logger.debug('Scanning for new custodians')
  ar.check()
}, 3600000) // 1 hour
