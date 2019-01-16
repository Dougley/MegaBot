const db = require('../../databases/lokijs')
const ids = require('../ids')
const dlog = require('../dlog')

module.exports = {
  /**
   * Check if users reached the threshold for the custodian role
   * @returns {void}
   */
  check: () => {
    if (process.env.DISABLE_AUTOROLE) return
    const aggregation = db.findManySync('users', {
      '$and': [{
        'properties.exp': {
          $gte: MB_CONSTANTS.thresholds.custodian
        }
      }, {
        entitlements: {
          $containsNone: ['cant-autorole', 'never-custodian']
        }
      }]
    })
    logger.trace(aggregation)
    aggregation.forEach(async x => {
      try {
        const user = bot.guilds.get(ids.guild).members.get(x.wb_id) ? bot.guilds.get(ids.guild).members.get(x.wb_id) : await bot.guilds.get(ids.guild).getRESTMember(x.wb_id)
        if (ids.modRoles.some(x => user.roles.includes(x))) return
        if (!user.roles.includes(ids.custodianRole) && !x.properties.propmted) {
          x.properties.propmted = true
          dlog(4, {
            message: `Prompting ${user.username}#${user.discriminator} to buy the custodian role, they accumulated enough exp to buy the role`
          })
          bot.getDMChannel(user.id).then(x => {
            x.createMessage(MB_CONSTANTS.strings.custodianInvite)
          })
        }
      } catch (e) {
        logger.warn(`Unable to prompt ${x.wb_id}: ${e.message}`)
      }
    })
  }
}
