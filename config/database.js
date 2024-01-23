//=============================================================================
// organisation.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================

const { MongoClient } = require("mongodb");
const config  = require('./config')
const client = new MongoClient(config.database_url, { useUnifiedTopology: true })
client.connect();
let database = client.db(config.database_name)
module.exports = database