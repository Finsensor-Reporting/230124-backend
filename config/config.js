//=============================================================================
// config.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================

const dotEnv = require("dotenv");
dotEnv.config();

module.exports = {
  port: process.env.NODE_APP_PORT,
  database_url: process.env.NODE_APP_DB_URL,
  database_name: process.env.NODE_APP_DATABASE,
  environment: process.env.NODE_APP_ENVIRONMENT,
  
};
