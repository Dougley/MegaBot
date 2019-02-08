const Redis = require('ioredis')

const db = new Redis({
  port: 6379,
  host: '127.0.0.1',
  db: 2
})

db.on('error', logger.error)

/**
 * @export {Redis}
 */
module.exports = db
