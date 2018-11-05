const debug = {
  confirm: {
    id: '459710143484002304',
    name: 'yes'
  },
  dismiss: {
    id: '459710143370756096',
    name: 'no'
  }
}

const production = {
  confirm: {
    id: '302137375092375553',
    name: 'approve'
  },
  dismiss: {
    id: '302137375113609219',
    name: 'deny'
  }
}

module.exports = process.env.NODE_ENV === 'debug' ? debug : production
