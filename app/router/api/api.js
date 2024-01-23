const apiController = require('../../controllers/api.controller')

module.exports = {
    group: {
        prefix: '/api',
    },
    routes: [
        {
            method: 'post',
            path: '/api/stringCompare',
            handler: apiController.stringCompare
        },
        {
            method: 'get',
            path: '/api/signinng',
            handler: apiController.stringCompare
        },
        {
            method: 'post',
            path: '/api/authorize',
            handler: apiController.authorize
        },
        {
            method: 'post',
            path: '/api/getData',
            handler: apiController.getData
        },
        {
            method: 'post',
            path: '/api/submitData',
            handler: apiController.submitData
        },
        {
            method: 'post',
            path: '/api/submitAuditorData',
            handler: apiController.submitAuditorData
        },
        {
            method: 'post',
            path: '/api/submitFormdata',
            handler: apiController.submitFormdata
        },
        {
            method: 'post',
            path: '/api/submitOiFormdata',
            handler: apiController.submitOiFormdata
        },
        {
            method: 'get',
            path: '/api/getFile',
            handler: apiController.getFile
        },
        {
            method: 'post',
            path: '/api/fetchData',
            handler: apiController.fetchData
        }
    ]
}