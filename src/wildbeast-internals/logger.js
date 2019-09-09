const chalk = require('chalk')
const log = console.log
const inspect = require('util').inspect
let sentry

if (process.env.SENTRY_DSN) {
  const revision = require('child_process').execSync('git rev-parse --short HEAD').toString().trim()
  log(chalk`{bold.green DEBUG}: Initializing Sentry, setting release to ${revision}`)
  sentry = require('@sentry/node')
  const { Modules } = sentry.Integrations
  const { Dedupe } = require('@sentry/integrations')
  sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [ new Modules(), new Dedupe() ],
    release: `megabot@${revision}`
  })
}

module.exports = {
  debug: (msg) => {
    if (process.env.NODE_ENV === 'debug') log(chalk`{bold.green DEBUG}: ${msg}`)
  },
  http: (msg) => {
    if (process.env.NODE_ENV === 'debug' && !process.env.SUPRESS_HTTP_TRACELOG) log(chalk`{bold.grey HTTP-TRACE}: ${inspect(msg)}`)
  },
  log: (msg) => {
    log(chalk`{bold.blue INFO}: ${msg}`) // nothing too interesting going on here
  },
  error: (e, exit = false) => {
    if (!(e instanceof Error)) { // in case strings get logged as errors, for whatever reason
      exit ? log(chalk`{bold.black.bgRed FATAL}: ${e}`) : log(chalk`{bold.red ERROR}: ${e}`)
    } else {
      sentry.captureException(e)
      exit ? log(chalk`{bold.black.bgRed FATAL}: ${e.stack ? e.stack : e.message}`) : log(chalk`{bold.red ERROR}: ${e.stack ? e.stack : e.message}`)
    }
    if (exit) process.exit(1)
  },
  warn: (msg) => {
    log(chalk`{bold.yellow WARN}: ${msg}`)
  },
  trace: (msg) => {
    if (process.env.NODE_ENV === 'debug') log(chalk`{bold.cyan TRACE}: ${inspect(msg)}`)
  },
  command: (opts) => { // specifically to log commands being ran
    log(chalk`{bold.magenta CMD}: ${opts.cmd} by ${opts.m.author.username} in ${opts.m.channel.guild ? opts.m.channel.guild.name : 'DM'}`)
  },
  _sentry: sentry
}
