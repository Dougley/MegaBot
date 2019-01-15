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

module.exports = {
  submissionRegex: /https?:\/\/[\w.]+\/hc\/[-a-zA-Z]+\/community\/posts\/(\d{12,})(?:-[\w-]+)?/,
  commentRegex: /https?:\/\/[\w.]+\/hc\/[-a-zA-Z]+\/community\/posts\/(\d{12,})(?:-[\w-]+)?\/comments\/(\d{12,})/,
  inviteRegex: /(?:https?:\/\/)?discord(\.gg|app\.com\/invite)\/([A-Za-z0-9-_]+)/g,
  isID: (input) => { return /\d{12,}/.test(input) },
  sanitize: (s) => {
    return s
      .replace(/_/g, '\\_')
      .replace(/\*/g, '\\*')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`')
      .replace(/\|/g, '\\|')
  },
  thresholds: {
    reports: 4, // 3 + 1, megabots reactions also count
    custodian: 150
  },
  timeouts: {
    queueDelete: 2000,
    feedScrape: 30000
  },
  rewards: {
    submit: 10,
    report: 5,
    dupe: 20,
    vote: 2,
    comment: 5,
    daily: 25,
    commentRemove: 1
  },
  limits: {
    vote: 5
  },
  limiter: limiter,
  strings: {
    dupe: (x) => `Hi there! This suggestion is the same as ${process.env.ZENDESK_ROOT_URL}/hc/en-us/community/posts/${x} so in an effort to keep duplicates out and keep everything neat and tidy, we're going to merge this ticket into that suggestion. This ticket will be deleted automatically after a week.`
  },
  generateErrorMessage: (e) => {
    switch (e.message) {
      case 'No such user' : {
        return `Your details couldn't be found, please make sure you've logged in at least once at ${process.env.ZENDESK_ROOT_URL}/hc/en-us/signin\nIf you just recently signed in for the first time, it might take a minute for me to detect it.`
      }
      case 'Not Found' : {
        return "Using your input, no content could be found. Please make sure you haven't made a typo"
      }
      case 'Internal Server Error': {
        return "Zendesk didn't respond properly for whatever reason, please try again later.\nThis issue might be related to problems over at Zendesk, please check https://status.zendesk.com"
      }
      case 'Suggestion closed': {
        return "The suggestion you're trying to execute this action on, is closed"
      }
      default: {
        logger.error(e)
        return "Something went wrong, and I'm not exactly sure what, try again later"
      }
    }
  }
}
