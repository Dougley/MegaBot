const debug = {
  confirm: {
    id: '459710143484002304',
    name: 'yes'
  },
  dismiss: {
    id: '459710143370756096',
    name: 'no'
  },
  channels: {
    '459298531480567809': 360000872832
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
  },
  channels: {
    '268813057449263104': 360000786192, // IOS
    '501766464546799626': 360000789931, // Store
    '284800887086514178': 360000786192, // Android
    '294546433212940289': 360000786212 // Desktop
  }
}

module.exports = process.env.NODE_ENV === 'debug' ? debug : production
