const debug = {
  roles: {
    '519254764978962434': 25
  }
}

const production = {
  roles: {
    '273149949720526848': 350, // record keeper
    '273149954120482816': 750, // book keeper
    '273149954850160640': 1500, // librarian
    '273149955512860673': 2400, // vizier
    '273149956167172107': 4770 // grand vizier
  }
}

module.exports = process.env.NODE_ENV === 'debug' ? debug : production
