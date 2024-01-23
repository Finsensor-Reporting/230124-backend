const apiServices = require('../services/api.service')
const Router = require('koa-router')
const router = new Router();
const cryptoServices = require('../services/cryptography.service')
const moment = require('moment')
class apiController {
    constructor() {

    }

    // async stringCompare(ctx) {
    //     try {
    //         let api_id = ctx.request.headers['x-parse-application-id'] ? ctx.request.headers['x-parse-application-id'] : ctx.request.headers['x-parse-rest-api-id']
    //         let api_key = ctx.request.headers['x-parse-rest-api-key'] ? ctx.request.headers['x-parse-rest-api-key'] : ''
    //         let organisation_id = ctx.request.headers['organisation-id'] ? ctx.request.headers['organisation-id'] : ''
    //         var is_encrypted = ctx.request.body.is_encrypted ? ctx.request.body.is_encrypted : false
    //         var enc_mode = ctx.request.body.enc_mode ? ctx.request.body.enc_mode : ''
    //         var api_data = ctx.request.body.api_data ? ctx.request.body.api_data : ''
    //         var enc_hash = ctx.request.body.enc_hash ? ctx.request.body.enc_hash : ''
    //         var enc_key = ctx.request.body.enc_key ? ctx.request.body.enc_key : ''
    //         if (is_encrypted) {
    //             if (api_id && api_key) {
    //                 if (enc_mode && enc_mode.toLowerCase() == 'asymmetric') {
    //                     if (api_data && enc_hash && enc_key) {
    //                         let params = ctx.request.body
    //                         params.api_id = api_id
    //                         params.api_key = api_key
    //                         let decryptedData = await cryptoServices.asymmetricDecryptAdvanced(params)
    //                         if (decryptedData.success) {
    //                             ctx.request.body = decryptedData.data
    //                             await apiServices.stringCompare(ctx).then(async function (response) {
    //                                 if (response && response.status == 'success') {
    //                                     var encryptData = {
    //                                         api_id: api_id,
    //                                         api_key: api_key,
    //                                         data_to_encrypt: response
    //                                     }
    //                                     try {
    //                                         await cryptoServices.asymmetricEncryptAdvanced(encryptData).then(function (encryptedResult) {
    //                                             if (encryptedResult.status == 'success') {
    //                                                 return ctx.body = encryptedResult
    //                                             }
    //                                             else {
    //                                                 return ctx.body = encryptedResult
    //                                             }
    //                                         })
    //                                     } catch (err) {
    //                                         console.log("err----", err);
    //                                     }
    //                                 } else {
    //                                     return ctx.body = response
    //                                 }
    //                             })
    //                         } else {
    //                             return ctx.body = {
    //                                 status: 'failed',
    //                                 message: 'failed to decrypt api_data'
    //                             }
    //                         }
    //                     } else if (!api_data) {
    //                         return ctx.body = {
    //                             status: 'failed',
    //                             message: 'api_data not found in the request'
    //                         }
    //                     } else if (!enc_hash) {
    //                         return ctx.body = {
    //                             status: 'failed',
    //                             message: 'enc_hash not found in the request'
    //                         }
    //                     } else if (enc_key) {
    //                         return ctx.body = {
    //                             status: 'failed',
    //                             message: 'enc_key not found in the request'
    //                         }
    //                     }
    //                 } else {
    //                     return ctx.body = {
    //                         status: 'failed',
    //                         message: 'encryption mode used is invalid'
    //                     }
    //                 }
    //             } else if (organisation_id) {
    //                 if (enc_mode && enc_mode.toLowerCase() == 'asymmetric') {
    //                     if (api_data && enc_hash && enc_key) {
    //                         let params = ctx.request.body
    //                         params.organisation_id = organisation_id
    //                         let decryptedData = await cryptoServices.asymmetricDecryptAdvanced(params)
    //                         if (decryptedData.success) {
    //                             ctx.request.body = decryptedData.data
    //                             await apiServices.stringCompare(ctx).then(async function (response) {
    //                                 if (response && response.status == 'success') {
    //                                     var encryptData = {
    //                                         organisation_id: organisation_id,
    //                                         data_to_encrypt: response
    //                                     }
    //                                     try {
    //                                         await cryptoServices.asymmetricEncryptAdvanced(encryptData).then(function (encryptedResult) {
    //                                             if (encryptedResult.status == 'success') {
    //                                                 return ctx.body = encryptedResult
    //                                             }
    //                                             else {
    //                                                 return ctx.body = encryptedResult
    //                                             }
    //                                         })
    //                                     } catch (err) {
    //                                         console.log("err----", err);
    //                                     }
    //                                 } else {
    //                                     return ctx.body = response
    //                                 }
    //                             })
    //                         } else {
    //                             return ctx.body = {
    //                                 status: 'failed',
    //                                 message: 'failed to decrypt api_data'
    //                             }
    //                         }
    //                     } else if (!api_data) {
    //                         return ctx.body = {
    //                             status: 'failed',
    //                             message: 'api_data not found in the request'
    //                         }
    //                     } else if (!enc_hash) {
    //                         return ctx.body = {
    //                             status: 'failed',
    //                             message: 'enc_hash not found in the request'
    //                         }
    //                     } else if (enc_key) {
    //                         return ctx.body = {
    //                             status: 'failed',
    //                             message: 'enc_key not found in the request'
    //                         }
    //                     }
    //                 } else {
    //                     return ctx.body = {
    //                         status: 'failed',
    //                         message: 'encryption mode used is invalid'
    //                     }
    //                 }
    //             } else if (!api_id && !api_key) {
    //                 return ctx.body = {
    //                     status: 'failed',
    //                     error: "The required x-parse-application-id and x-parse-rest-api-key not found",
    //                     error_code: "dv-010",
    //                     response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
    //                 }
    //             } else if (!api_id) {
    //                 return ctx.body = {
    //                     status: 'failed',
    //                     error: "The required x-parse-application-id was not found",
    //                     error_code: "dv-011",
    //                     response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
    //                 }
    //             } else if (!api_key) {
    //                 return ctx.body = {
    //                     status: 'failed',
    //                     error: "The required x-parse-rest-api-key was not found",
    //                     error_code: "dv-012",
    //                     response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
    //                 }
    //             }
    //         } else {
    //             let response = await apiServices.stringCompare(ctx)
    //             return ctx.body = response
    //         }
    //     } catch (err) {
    //         return ctx.body = err
    //     }

    // }
    async stringCompare(ctx) {
        try {
            // console.log(ctx);
            let response = await apiServices.stringCompare(ctx);
            // ctx.set('Content-Type', 'text/javascript');
            return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
    async signinng(ctx) {
        try {
            console.log(ctx);
            let response = await apiServices.stringCompare(ctx);
            return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
    async authorize(ctx) {
        try {
            console.log(ctx);
            let response = await apiServices.authorize(ctx);
            return ctx.body = ("<script>window.close();</script > ")
        } catch (err) {
            return ctx.body = err
        }
    }
    async getData(ctx) {
        try {
            console.log(ctx);
            let response = await apiServices.getData(ctx);
            return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
    async submitData(ctx) {
        try {
            // console.log(ctx);
            let response = await apiServices.submitData(ctx);
            return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
    async submitAuditorData(ctx) {
        try {
            console.log(ctx);
            let response = await apiServices.submitAuditorData(ctx);
            return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
    async submitFormdata(ctx) {
        try {
            // console.log(ctx);
            let response = await apiServices.submitFormdata(ctx);
            return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
    async submitOiFormdata(ctx) {
        try {
            // console.log(ctx);
            let response = await apiServices.submitOiFormdata(ctx);
            return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
    async getFile(ctx) {
        try {
            console.log(ctx);
            let response = await apiServices.getFile(ctx);
            // ctx.set('Content-Type', 'text/plain');
            // ctx.set('Content-Disposition', 'attachment; filename=downloadedFile.txt');
                return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
    async fetchData(ctx) {
        try {
            console.log(ctx);
            let response = await apiServices.fetchData(ctx);
            // ctx.set('Content-Type', 'text/plain');
            // ctx.set('Content-Disposition', 'attachment; filename=downloadedFile.txt');
            return ctx.body = response
        } catch (err) {
            return ctx.body = err
        }
    }
}
module.exports = new apiController()

