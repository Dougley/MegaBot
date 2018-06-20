require('dotenv').config()
global.logger = require('./src/internal/logger')
require('./src/internal/env-check')

const Eris = require('eris')
const bot = new Eris(process.env.BOT_TOKEN)
const Events = require('./src/internal/directory-loader')('./src/events')

bot._ogEmit = bot.emit
bot.emit = function emit () {
  this._anyListeners.forEach(listener => listener.apply(this, [arguments]))
  return this._ogEmit.apply(this, arguments)
}
bot.onAny = function onAny (func) {
  if (!this._anyListeners) this._anyListeners = []
  this._anyListeners.push(func)
}

bot.on('debug', global.logger.debug)

bot.onAny((ctx) => {
  if (Events[ctx[0]]) {
    Events[ctx[0]](Array.from(ctx).slice(1))
  }
})

bot.connect()

process.on('warn', global.logger.warn)

process.on('unhandledRejection', (err) => {
  global.logger.error(err)
})

process.on('uncaughtException', (err) => {
  // probably not the most stylish way to handle this, but it works
  global.logger.error(err, true) // we're exiting here, uncaughts are scary
})
