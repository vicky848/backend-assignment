const sqlite3 = require('sqlite3')
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'contacts.db'), (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the contacts database.');
});


module.exports = db;