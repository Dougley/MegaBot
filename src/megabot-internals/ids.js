const debug = {
  top10channel: '512580399923200001',
  queue: '512952879485681684',
  feed: '513433831089504266',
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
  queue: '308655657786146817',
  feed: '302112999794278400',
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
    },
    reported: {
      id: '323058409203171328',
      name: 'reported'
    }
  },
  channels: {
    '514128387921674240': 360000789911, // API
    '514128598316351508': 360000790031, // Account&Server
    '514128684177817630': 360000786212, // Text&Voice
    '514128815962980400': 360000789931, // Games&Nitro
    '514128911261499402': 360000786192, // Mobile
    '501766464546799626': 360000789931, // Store
    '514129129910566913': 360000789851, // Overlay
    '514129231299477504': 360000789951 // Other
  }
}

module.exports = process.env.NODE_ENV === 'debug' ? debug : production
