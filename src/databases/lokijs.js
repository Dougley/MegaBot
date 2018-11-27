const Loki = require('lokijs')
const db = new Loki('wildbeast.db', {
  autoload: true,
  autosave: true,
  autoloadCallback: loadCollections,
  autosaveInterval: 1000
})

const collections = ['users', 'questions', 'cache', 'bonuses', 'holds', 'system'] // extend this to add more, beware that this might add extra strain

function loadCollections () {
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
  getSync: (coll, id) => {
    return db.getCollection(coll).findOne({
      wb_id: id
    })
  },
  find: async (coll, search) => {
    return db.getCollection(coll).findOne(search)
  },
  findSync: (coll, search) => {
    return db.getCollection(coll).findOne(search)
  },
  findMany: async (coll, search, limit = Infinity) => {
    return db.getCollection(coll).chain().find(search).limit(limit).data()
  },
  findManySync: (coll, search, limit = Infinity) => {
    return db.getCollection(coll).chain().find(search).limit(limit).data()
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
    const orig = collection.findOne({ wb_id: handle })
    const newdata = { ...orig, ...data } // spread ops, fancy!
    return collection.update(newdata)
  },
  findAndRemove: (coll, query) => {
    return db.getCollection(coll).findAndRemove(query)
  },
  listCollections: () => {
    return db.listCollections()
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
  const data = users.findOne({
    wb_id: id
  })
  if (data) {
    global.logger.trace(data)
    return data
  } else {
    const shim = {
      wb_id: id,
      properties: {
        exp: 0,
        lastSeen: Date.now(),
        notifications: false
      },
      entitlements: [],
      overrides: [],
      transactions: [],
      blocked: false
    }
    return users.insert(shim)
  }
}
