const db = require('../databases/lokijs')
const ids = require('./ids')
const dlog = require('./dlog')

module.exports = {
  check: () => {
    if (process.env.DISABLE_AUTOROLE) return
    const aggregation = db.findManySync('users', {
      '$and': [{
        'properties.exp': {
          $gte: MB_CONSTANTS.thresholds.custodian
        }
      }, {
        entitlements: {
          $containsNone: ['cant-autorole']
        }
      }]
    })
    logger.trace(aggregation)
    aggregation.forEach(async x => {
      const user = bot.guilds.get(ids.guild).members.get(x.wb_id) ? bot.guilds.get(ids.guild).members.get(x.wb_id) : await bot.guilds.get(ids.guild).getRESTMember(x.wb_id)
      if (ids.modRoles.some(x => user.roles.includes(x))) return
      if (!user) {
        logger.debug(`Found user document ${x.wb_id}, but user isn't in server? Deleting.`)
        return db.delete('users', x.wb_id)
      }
      if (!user.roles.includes(ids.custodianRole)) {
        dlog(4, {
          message: `Granting ${user.username}#${user.discriminator} custodian, they passed the EXP threshold`
        })
        logger.debug(`Granting ${x.wb_id} custodian due to autorole`)
        user.addRole(ids.custodianRole, 'Autorole: EXP threshold reached')
      }
    })
  }
}
