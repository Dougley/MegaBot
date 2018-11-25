const supers = [
  '110813477156720640', // Dabbit Prime
  '107904023901777920' // Dougley
]

const modroles = [
  '268815351360389121', // Modinators
  '268815286067527690', // Discord Employee
  '260793882546143232' // STAGING: Bot Dev
]

const custodianrole = '268815388882632704'
// no need to add the other custodian roles, everyone has this role regardless

const db = require('../databases/lokijs')

module.exports = (level, user, msg, type) => {
  const userdata = db.getUser(user.id)
  if (supers.includes(user.id)) return true // supers can do anything
  if (!msg.channel.guild) return level === 0 // this is a dm, only general commands allowed
  if (type && userdata.overrides.includes(type)) {
    switch (type) {
      case 'admin-commands': {
        return level <= 2
      }
    }
  }
  if (!user.roles || user.roles.length === 0) return level === 0 // no roles = no elevated access
  if (userdata.blocked) return false // blocked users dont get to run commands
  // check role permissions now
  for (const role of user.roles) {
    if (role === custodianrole) return level <= 1
    if (modroles.includes(role)) return level <= 2
  }
  return level === 0
}
