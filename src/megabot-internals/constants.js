const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({
  reservoir: 700,
  reservoirRefreshAmount: 700,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 1
})

limiter._oldStop = limiter.stop
limiter.stop = async function stop () {
  this.stopped = true
  return this._oldStop.apply(this, arguments)
}

limiter.on('failed', async (error, jobInfo) => {
  if (error.message !== 'Not Found' && jobInfo.retryCount < 1) {
    logger.warn('A job failed! Retrying it in 25ms')
    return 25
  } else if (jobInfo.retryCount >= 1) logger.error(error)
})
limiter.on('retry', () => { logger.warn('Retrying a previously failed job...') })

module.exports = {
  submissionRegex: /https?:\/\/[\w.]+\/hc\/[-a-zA-Z]+\/community\/posts\/(\d{12,})(?:-[\w-]+)?/,
  commentRegex: /https?:\/\/[\w.]+\/hc\/[-a-zA-Z]+\/community\/posts\/(\d{12,})(?:-[\w-]+)?\/comments\/(\d{12,})/,
  inviteRegex: /(?:https?:\/\/)?discord(\.gg|app\.com\/invite)\/((?!discord-feedback)[A-Za-z0-9-_]+)/g,
  isID: (input) => { return /\d{12,}/.test(input) },
  determineID: function (input) {
    if (this.submissionRegex.test(input)) return input.match(this.submissionRegex)[1]
    else if (this.commentRegex.test(input)) return input.match(this.submissionRegex).slice(1)
    else if (this.isID(input)) return input
    else return new TypeError('Invalid ID')
  },
  sanitize: (s) => {
    return s
      .replace(/_/g, '\\_')
      .replace(/\*/g, '\\*')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`')
      .replace(/\|/g, '\\|')
  },
  thresholds: {
    reports: 7,
    custodian: 150
  },
  timeouts: {
    queueDelete: 2000,
    feedScrape: 30000
  },
  rewards: {
    submit: 10,
    report: 8,
    dupe: 20,
    vote: 2,
    comment: 5,
    daily: 25,
    commentRemove: 6
  },
  limits: {
    vote: 5,
    submit: 1,
    comment: 3,
    dupe: 5
  },
  limiter: limiter,
  strings: {
    dupe: (x) => `Hi there! This suggestion is the same as ${process.env.ZENDESK_ROOT_URL}/hc/en-us/community/posts/${x} so in an effort to keep duplicates out and keep everything neat and tidy, we're going to merge this ticket into that suggestion. This ticket will be deleted automatically after a week.`,
    custodianInvite: "Hey there! Just wanted to let you know we've seen you around in DFeedback, being awesome, and you've accrued enough experience to buy the coveted Custodian role! It gives you access to more channels, new commands and an absolutely awesome community! Just use this command `!buy roles 1` in this bot's DMs to buy it!"
  },
  generateErrorMessage: (e) => {
    switch (e.message) {
      case 'No such user' : {
        return `Seems this is the first time you're using the feedback system, please login first at ${process.env.ZENDESK_ROOT_URL}/hc/en-us/signin for everything to work properly.\nIf you just recently signed in for the first time, it might take a minute for me to detect it.`
      }
      case 'Not Found' : {
        return "I haven't found anything using your input. Please make sure you haven't made a typo"
      }
      case 'Internal Server Error': {
        return "Zendesk didn't respond properly for whatever reason, please try again later.\nThis issue might be related to problems over at Zendesk, please check https://status.zendesk.com"
      }
      case 'Suggestion closed': {
        return "The suggestion you're trying to execute this action on, is closed"
      }
      case 'Invalid ID' : {
        return "Some ID's you've entered are malformed, please double check them"
      }
      case 'Timed out' : {
        return 'You took too long to respond to this, please try again'
      }
      default: {
        logger.error(e)
        return "Something went wrong, and I'm not exactly sure what, try again later"
      }
    }
  }
}
