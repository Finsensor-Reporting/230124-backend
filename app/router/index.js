//=============================================================================
// index.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================

const apiRoutes         = require('./api');
const KoaRouter         = require('koa-router')
const json              = require('koa-json');
const bodyParser        = require('koa-bodyparser');
const helmet            = require('koa-helmet');
const compose           = require('koa-compose') // to compose and customise calls explicitly
const mount             = require('koa-mount')
const koaBody = require('koa-body');
// const koa2Formidable = require('koa2-formidable')
class Routes {
    constructor() {
        this.apiRoutes = apiRoutes
    }

    create(app) {
        this.app = app;
        this.router = new KoaRouter()
        this._attachMiddleware(app)
        this._attachAPIRoutes(this.router)
    }

    _attachMiddleware(app) {
        this.app.use(
            koaBody({
              multipart: true, // Enable multipart (file) parsing
              formidable: {
                uploadDir: './uploads', // Specify the upload directory (change to your desired location)
                keepExtensions: true, // Keep the original file extensions
              },
            })
          );
        this.app.use(json())
        this.app.use(bodyParser());
        this.app.use(helmet.xssFilter());
        // this.app.use(koa2Formidable())
        app.use(this.router.routes()).use(this.router.allowedMethods()); 
        app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'"],
            scriptSrc: ["'self'"]
        }
        }))
    }
    _attachAPIRoutes() {
        this._attachRoutes(this.apiRoutes, '/api');
    }

    _attachRoutes(routeGroups, prefix = '') {
        let thisTemp = this
        routeGroups.forEach(({ group, routes }) => {
            routes.forEach(({ method, path, middleware, handler }) => {
               thisTemp.app.use(mount(prefix+group.prefix, thisTemp.router[method](path, compose([this._handleRouteError(middleware), handler])).middleware()))

            })
        })
    }

    _handleRouteError(route) {
        return async(ctx, next) => {
            if(typeof route == 'function')
                route(ctx).catch(next)
            else
                await next()
        }   
    }
}

module.exports = new Routes()