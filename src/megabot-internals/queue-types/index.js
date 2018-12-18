const loader = require('../../wildbeast-internals/directory-loader')('./')
const final = {}

Object.keys(loader).filter(x => /([0-9]+)-.+/.test(x)).forEach(x => {
  const match = x.match(/([0-9]+)-.+/)[1]
  final[match] = loader[x]
})

module.exports = final
