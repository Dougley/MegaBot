const supers = [
  '80413600807657472', // Dannysaur
  '107904023901777920' // Dougley
]

const modroles = [
  '268815351360389121', // Modinators
  '260793882546143232' // STAGING: Bot Dev
]

const adminroles = [
  '268815286067527690' // Discord Employee
]

const custodianrole = '268815388882632704'
// no need to add the other custodian roles, everyone has this role regardless

const db = require('../databases/lokijs')

/**
 * Calculate permissions for someone
 * @param {Number} level - The access level someone should have to run the command
 * @param {Member | User} user - The user to calculate permissions for
 * @param {Message} msg - The message that started the command
 * @return {Boolean}
 */
module.exports = (level, user, msg) => {
  const userdata = db.getUser(user.id)
  if (supers.includes(user.id)) return true // supers can do anything
  if (!msg.channel.guild) return level === 0 // this is a dm, only general commands allowed
  if (!user.roles || user.roles.length === 0) return level === 0 // no roles = no elevated access
  if (userdata.blocked) return false // blocked users dont get to run commands
  if (userdata.entitlements.includes('never-custodian')) return level === 0
  // check role permissions now
  if (modroles.some(x => user.roles.includes(x))) return level <= 2
  if (adminroles.some(x => user.roles.includes(x))) return level <= 3
  if (user.roles.includes(custodianrole)) return level <= 1
  return level === 0
}
