const debug = {
  top10channel: '512580399923200001',
  emojis: {
    confirm: {
      id: '459710143484002304',
      name: 'yes'
    },
    dismiss: {
      id: '459710143370756096',
      name: 'no'
    },
    upvote: {
      id: '512217422418280448',
      name: 'up'
    },
    downvote: {
      id: '512217422464548865',
      name: 'down'
    },
    report: {
      id: '512218443383177216',
      name: 'rep'
    }
  },
  channels: {
    '459298531480567809': 360000872832
  }
}

const production = {
  top10channel: '268812972401360906',
  emojis: {
    confirm: {
      id: '302137375092375553',
      name: 'approve'
    },
    dismiss: {
      id: '302137375113609219',
      name: 'deny'
    },
    upvote: {
      id: '302138464986595339',
      name: 'upvote'
    },
    downvote: {
      id: '302138465426997248',
      name: 'downvote'
    },
    report: {
      id: '302137374920671233',
      name: 'report'
    }
  },
  channels: {
    '268813057449263104': 360000786192, // IOS
    '501766464546799626': 360000789931, // Store
    '284800887086514178': 360000786192, // Android
    '294546433212940289': 360000786212 // Desktop
  }
}

module.exports = process.env.NODE_ENV === 'debug' ? debug : production