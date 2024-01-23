//=============================================================================
// base-task.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================

class BaseTask {

    async handle() {
        this.info('Empty task!')
    }

    info(message) {
        console.log(message)
    }

    saveLog(message) {

    }

}

module.exports = BaseTask