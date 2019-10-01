const store = new Map()

module.exports = {
  /**
   * Calculate if timeout for a command has expired or not
   * @param {String | Number} id - ID of the object to calculate timeout for, can be anything but should ideally be a user ID
   * @param {String} handle - Name of the command to calculate timeout for
   * @param {Number} time - Time in seconds this command should timeout for
   * @return {Boolean | Number}
   */
  calculate: (id, handle, time) => {
    const now = new Date()
    const opts = `${id}:${handle}`
    if (store.has(opts)) {
      const proxy = new Date(store.get(opts))
      global.logger.trace(`Timeout: ${opts}, ${proxy}`)
      const last = proxy.setSeconds(proxy.getSeconds() + time)
      if (now < last) {
        return (last - now) / 1000
      } else {
        store.set(opts, new Date())
        return true
      }
    } else {
      store.set(opts, new Date())
      return true
    }
  },
  _store: store
}
