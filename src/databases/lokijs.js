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
  /**
   * Get a document from the database
   * This gets a document by a predefined key, it does not allow searching
   * If you need to search for documents, use find()
   * @param {String} coll - The collection to get this document from
   * @param {String} id - ID of the document to use
   * @return {Promise<Object>}
   */
  get: async (coll, id) => {
    return db.getCollection(coll).findOne({
      wb_id: id
    })
  },
  /**
   * Synchronously get a document from the database
   * This method is similar to get()
   * This gets a document by a predefined key, it does not allow searching
   * If you need to search for documents, use find()
   * @param {String} coll - The collection to get this document from
   * @param {String} id - ID of the document to use
   * @return {Object}
   */
  getSync: (coll, id) => {
    return db.getCollection(coll).findOne({
      wb_id: id
    })
  },
  /**
   * Search for a document
   * This allows arbitrary searching by any data point in a document
   * If you need to get a single document by ID, use get()
   * If you want to find many documents instead of a single one, use findMany()
   * @param {String} coll - The collection to get this document from
   * @param {Object} search - LokiJS compatible search payload
   * @return {Promise<Object>}
   */
  find: async (coll, search) => {
    return db.getCollection(coll).findOne(search)
  },
  /**
   * Synchronously search for a document
   * This allows arbitrary searching by any data point in a document
   * If you need to get a single document by ID, use get()
   * If you want to find many documents instead of a single one, use findMany()
   * @param {String} coll - The collection to get this document from
   * @param {Object} search - LokiJS compatible search payload
   * @return {Promise<Object>}
   */
  findSync: (coll, search) => {
    return db.getCollection(coll).findOne(search)
  },
  /**
   * Search for many documents
   * This allows arbitrary searching by any data point in many document
   * If you need to get a single document by ID, use get()
   * If you want to find a single document, use find()
   * @param {String} coll - The collection to get this document from
   * @param {Object} search - LokiJS compatible search payload
   * @param {Number} [limit=Infinity] - How many documents to return
   * @return {Promise<Array<Object>>}
   */
  findMany: async (coll, search, limit = Infinity) => {
    return db.getCollection(coll).chain().find(search).limit(limit).data()
  },
  /**
   * Synchronously search for many documents
   * This allows arbitrary searching by any data point in many document
   * If you need to get a single document by ID, use get()
   * If you want to find a single document, use find()
   * @param {String} coll - The collection to get this document from
   * @param {Object} search - LokiJS compatible search payload
   * @param {Number} [limit=Infinity] - How many documents to return
   * @return {Array<Object>}
   */
  findManySync: (coll, search, limit = Infinity) => {
    return db.getCollection(coll).chain().find(search).limit(limit).data()
  },
  /**
   * Create a document
   * @param {String} coll - The name of the collection to add this document to
   * @param {Object} data - The document's data to insert
   * @return {Promise<Object>}
   */
  create: async (coll, data) => {
    if (data._key) {
      data.wb_id = data._key
      delete data._key
    }
    const collection = db.getCollection(coll)
    return collection.insert(data)
  },
  /**
   * Delete a document from the database
   * @param {String} coll - The name of the collection where the document is located
   * @param {String} key - The key of the document
   * @return {Promise<Object>}
   */
  delete: async (coll, key) => {
    const collection = db.getCollection(coll)
    return collection.remove(collection.findOne({ wb_id: key }))
  },
  /**
   * Edit a document
   * @param {String} handle - The handle of the document you're trying to edit
   * @param {Object} data - The data to merge with the document
   * @param {String} [coll='users'] - The collection where the document is located
   * @return {Promise<Object>}
   */
  edit: async (handle, data, coll = 'users') => {
    const collection = db.getCollection(coll)
    const orig = collection.findOne({ wb_id: handle })
    const newdata = { ...orig, ...data } // spread ops, fancy!
    return collection.update(newdata)
  },
  /**
   * Synchronously edit a document
   * @param {String} handle - The handle of the document you're trying to edit
   * @param {Object} data - The data to merge with the document
   * @param {String} [coll='users'] - The collection where the document is located
   * @return {Object}
   */
  editSync: (handle, data, coll = 'users') => {
    const collection = db.getCollection(coll)
    const orig = collection.findOne({ wb_id: handle })
    const newdata = { ...orig, ...data } // spread ops, fancy!
    return collection.update(newdata)
  },
  /**
   * Delete many documents from a collection
   * @param {String} coll - The collection where the documents are located
   * @param {Object} query - LokiJS search object
   * @return {void}
   */
  findAndRemove: (coll, query) => {
    return db.getCollection(coll).findAndRemove(query)
  },
  /**
   * Remove a document from the database
   * This method assumes you already have the document you're trying to delete
   * If you need to delete by key, use delete()
   * @param {String} coll - the collection where this document is located
   * @param {Object} doc - The document to delete
   * @return {Object}
   */
  remove: (coll, doc) => {
    return db.getCollection(coll).remove(doc)
  },
  /**
   * Get an array of all collections in the database
   * @return {Collection<any>[]}
   */
  listCollections: () => {
    return db.listCollections()
  },
  getUser: ensureUser,
  /**
   * Abstraction to get a 'question' from the database
   * This is used in reaction verification
   * @param {String} id - Handle of the document to get
   * @return {Promise<Object>}
   */
  getQuestion: async (id) => {
    return db.getCollection('questions').findOne({
      wb_id: id
    })
  },
  /**
   * Get a raw collection from the database
   * @param {String} coll - The name of the collection to get
   * @return {Collection}
   */
  getRawCollection: (coll) => {
    return db.getCollection(coll)
  },
  /**
   * Count the amount of documents in a collection
   * @param {String} coll - The name of the collection to count
   * @return {Number}
   */
  count: (coll) => {
    return db.getCollection(coll).chain().count()
  },
  _driver: db
}

/**
 * Ensure a user document
 * This makes sure there's always a user document available for someone
 * @param {String} id - The ID of the user to get
 * @return {Object}
 */
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
      onetimeRewards: [],
      blocked: false
    }
    return users.insert(shim)
  }
}
