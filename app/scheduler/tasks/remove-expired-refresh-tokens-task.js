//=============================================================================
// remove-expired-refresh-tokens-tasks.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================

const BaseTask = require('./base-tasks')
// const { sequelize } = require('../../models')

class RemoveExpiredRefreshTokensTask extends BaseTask {
    async handle() {

        // await sequelize
        //     .query(`DELETE FROM refresh_tokens where created_at < now()-'7 day'::interval`)
    }
}

module.exports = RemoveExpiredRefreshTokensTask