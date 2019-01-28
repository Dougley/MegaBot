const chalk = require('chalk')
const log = console.log
const inspect = require('util').inspect
let raven

if (process.env.SENTRY_DSN) {
  const revision = require('child_process').execSync('git rev-parse HEAD').toString().trim()
  log(chalk`{bold.green DEBUG}: Initializing Sentry, setting release to ${revision}`)
  raven = require('raven')
  raven.config(process.env.SENTRY_DSN, {
    release: revision,
    parseUser: false
  }).install()
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
      if (exit) process.exit(1)
    } else {
      if (raven && raven.installed) {
        exit ? log(chalk`{bold.black.bgRed FATAL}: ${e.stack ? e.stack : e.message}`) : log(chalk`{bold.red ERROR}: ${e.stack ? e.stack : e.message}`)
        raven.captureException(e, { level: exit ? 'fatal' : 'error' }, () => { // sentry logging MUST happen before we might exit
          if (exit) process.exit(1)
        })
      } else {
        exit ? log(chalk`{bold.black.bgRed FATAL}: ${e.stack ? e.stack : e.message}`) : log(chalk`{bold.red ERROR}: ${e.stack ? e.stack : e.message}`)
        if (exit) process.exit(1)
      }
    }
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
  _raven: raven
}
