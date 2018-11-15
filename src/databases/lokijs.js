const Loki = require('lokijs')
const db = new Loki('wildbeast.db', {
  autoload: true,
  autosave: true,
  autoloadCallback: loadCollections,
  autosaveInterval: 1000
})

function loadCollections () {
  const collections = ['users', 'questions', 'cache', 'bonuses'] // extend this to add more, beware that this might add extra strain
  collections.forEach(x => {
    if (!db.getCollection(x)) db.addCollection(x)
  })
}

module.exports = {
  get: async (coll, id) => {
    return db.getCollection(coll).findOne({
      wb_id: id
    })
  },
  create: async (coll, data) => {
    if (data._key) {
      data.wb_id = data._key
      delete data._key
    }
    const collection = db.getCollection(coll)
    return collection.insert(data)
  },
  delete: async (coll, key) => {
    const collection = db.getCollection(coll)
    return collection.remove(collection.findOne({ wb_id: key }))
  },
  edit: async (handle, data, coll = 'users') => {
    const collection = db.getCollection(coll)
    const orig = collection.find({ wb_id: handle })[0]
    const newdata = { ...orig, ...data } // spread ops, fancy!
    return collection.update(newdata)
  },
  getUser: ensureUser,
  getQuestion: async (id) => {
    return db.getCollection('questions').findOne({
      wb_id: id
    })
  },
  count: (coll) => {
    return db.getCollection(coll).chain().count()
  },
  _driver: db
}

function ensureUser (id) {
  const users = db.getCollection('users')
  const data = users.find({
    wb_id: id
  })[0]
  if (data) {
    global.logger.trace(data)
    return data
  } else {
    const shim = {
      wb_id: id,
      properties: {
        exp: 0
      },
      entitlements: [],
      overrides: [],
      transactions: [],
      blocked: false
    }
    users.insert(shim)
    return shim
  }
}
