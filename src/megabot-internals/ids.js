const debug = {
  guild: '258274103935369219',
  custodianRole: '518849859822813206',
  custodianChannel: '459298531480567809',
  top10channel: '512580399923200001',
  queue: '512952879485681684',
  feed: '513433831089504266',
  leaderboard: '519105992261238786',
  modRoles: [],
  modChannel: '459298531480567809',
  deniedFeed: '530011587545661475',
  log: '519137610988388362',
  emojis: {
    confirm: {
      id: '459710143484002304',
      name: 'gearYes'
    },
    dismiss: {
      id: '459710143370756096',
      name: 'gearNo'
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
    },
    resolve: {
      id: '518121642166190080',
      name: 'bots2'
    },
    reverse: {
      id: '528144253667246080',
      name: 'refresh'
    }
  },
  channels: {
    '459298531480567809': 360000872832
  }
}

const production = {
  guild: '268811439588900865',
  custodianRole: '268815388882632704',
  custodianChannel: '284796966641205249',
  top10channel: '268812972401360906',
  queue: '308655657786146817',
  feed: '302112999794278400',
  log: '313447565712556033',
  leaderboard: '519570060453478400',
  modRoles: ['268815351360389121', '268815286067527690'],
  modChannel: '294530473290498049',
  deniedFeed: '347823023102885889',
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
    },
    resolve: {
      id: '401095659656183848',
      name: 'f1'
    },
    reverse: {
      id: '322646981476614144',
      name: 'reverse'
    }
  },
  channels: {
    '514128387921674240': 360000789911, // API
    '514128598316351508': 360000790031, // Account&Server
    '514128684177817630': 360000786212, // Text&Voice
    '514128815962980400': 360000789931, // Games&Nitro
    '514128911261499402': 360000786192, // Mobile
    '514129129910566913': 360000789851, // Overlay
    '514129231299477504': 360000789951, // Other
    '559958692615815178': 360000786252 // Merch
  }
}

module.exports = process.env.NODE_ENV === 'debug' ? debug : production
