const top10 = require('../megabot-internals/top10')

module.exports = function () {
  global.logger.log(`Fully ready!`)
  global.logger.debug('Setting interval for top10')
  setInterval(top10.regenerate, 3600000) // 1 hour
}
