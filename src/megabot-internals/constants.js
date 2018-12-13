module.exports = {
  regex: /https?:\/\/[\w.]+\/hc\/[-a-zA-Z]+\/community\/posts\/(\d{12,})(?:-[\w-]+)?/,
  isID: (input) => { return /\d{12,}/.test(input) },
  thresholds: {
    reports: 3,
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
    daily: 25
  },
  limits: {
    vote: 5
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
