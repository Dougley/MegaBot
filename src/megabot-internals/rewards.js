const debug = {
  roles: {
    '518849859822813206': 25,
    '519254764978962434': 25,
    '535192644666654740': 25,
    '535192680012054528': 25
  },
  things: [
    { name: 'Recurring reward', cost: 25 },
    { name: 'Onetime reward', cost: 25, oneTime: true }
  ]
}

const production = {
  roles: {
    '268815388882632704': 150, // custodian
    '273149949720526848': 350, // record keeper
    '273149954120482816': 750, // book keeper
    '273149954850160640': 1500, // librarian
    '273149955512860673': 2400, // vizier
    '273149956167172107': 4770 // grand vizier
  },
  things: []
}

module.exports = process.env.NODE_ENV === 'debug' ? debug : production
