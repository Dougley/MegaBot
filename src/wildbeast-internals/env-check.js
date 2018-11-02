const required = [
  'BOT_TOKEN',
  'BOT_PREFIX'
]

for (let x of required) {
  if (!process.env[x]) {
    global.logger.error(`Missing environment variable ${x}`, true)
  }
}
