module.exports = {
  regex: /https?:\/\/[\w.]+\/hc\/[-a-zA-Z]+\/community\/posts\/(\d{12,})(?:-[\w-]+)?/,
  isID: (input) => { return /\d{12,}/.test(input) },
  generateErrorMessage: (e) => {
    switch (e.message) {
      case 'No such user' : {
        return `Your details couldn't be found, please make sure you've logged in at least once at ${process.env.ZENDESK_ROOT_URL}/hc/en-us/signin`
      }
      case 'Not Found' : {
        return "Using your input, no content could be found. Please make sure you haven't made a typo"
      }
      case 'Internal Server Error': {
        return "Zendesk didn't respond properly for whatever reason, please try again later.\nThis issue might be related to problems over at Zendesk, please check https://status.zendesk.com"
      }
      default: {
        logger.error(e)
        return "Something went wrong, and I'm not exactly sure what, try again later"
      }
    }
  }
}
