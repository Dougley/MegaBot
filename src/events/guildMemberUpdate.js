const ids = require('../megabot-internals/ids')

module.exports = function (ctx) {
  const guild = ctx[0]
  const newMember = ctx[1]
  const oldMember = ctx[2]
  if (guild.id === ids.guild) {
    if (!oldMember.roles.includes(ids.custodianRole) && newMember.roles.includes(ids.custodianRole)) {
      bot.createMessage(ids.custodianChannel, `Please welcome <@${newMember.id}> to the custodians!`)
    }
  }
}
