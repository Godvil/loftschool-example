const low = require('lowdb')
const path = require('path')
const FileSync = require('lowdb/adapters/FileSync')
console.log('dfdfd')
const adapter = new FileSync(path.join(__dirname, 'db.json'))
const db = low(adapter)

module.exports = db;