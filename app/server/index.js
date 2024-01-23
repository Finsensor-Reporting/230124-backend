//=============================================================================
// index.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================

const koa = require('koa');
const config = require('../../config/config');
const Routes = require('../router');
const vaultClient = require("node-vault")(config.vault);

class Server {
    constructor() {
        console.log("port number", config.port)
        this.port = config.port;
        this.app = new koa();
        this.routes = Routes;
    }


    start() {
        this._attachHeaders();
        // this.connectVault();
        this._setupRoutes();
        this._listen(this.app);
    }

    connectVault() {
        process.env.VAULT_ADDR = config.vault.endpoint
        process.env.VAULT_TOKEN = config.vault.token
        vaultClient.read('kv/db_encryption').then((res) => {
            if (res.data && res.data.encryption_key) {
                config.master_key = res.data.encryption_key
            }
        })
    }

    _attachHeaders() {
        this.app.use(async (ctx, next) => {
            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-parse-key, x-parse-id, organisation-id');
            ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
            await next();
        });
    }

    _openWebSocket() {

    }

    _startScheduler() {
    }

    _setupRoutes() {

        this.routes.create(this.app)
    }

    _listen(app) {
        app.listen(this.port, () => {
            console.log(`App is running on port ${this.port}`);
        })
    }
}

module.exports = new Server();