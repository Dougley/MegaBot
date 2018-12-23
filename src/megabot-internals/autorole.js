const db = require('../databases/lokijs')
const ids = require('./ids')
const dlog = require('./dlog')

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
        if (!user.roles.includes(ids.custodianRole)) {
          dlog(4, {
            message: `Granting ${user.username}#${user.discriminator} custodian, they passed the EXP threshold`
          })
          logger.debug(`Granting ${x.wb_id} custodian due to autorole`)
          user.addRole(ids.custodianRole, 'Autorole: EXP threshold reached').then(() => {
            bot.createMessage(ids.custodianChannel, `Please welcome <@${user.id}> to the custodians!`)
          })
        }
      } catch (e) {
        logger.warn(`Unable to autorole ${x.wb_id}: ${e.message}`)
      }
    })
  }
}
