//=============================================================================
// auth.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================

const jwt                               = require('jsonwebtoken')
const appConfig                         = require('../../config/config')
class Auth{
    async verifyJWT(ctx, next){
        const authHeader = ctx.request.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
    
        if (!token)
            return next(new UnauthenticatedException())
    
        await jwt.verify(token, appConfig.appKey, async (err, user) => {
            if (err)
                return next(new UnauthenticatedException('Invalid token!'))
    
            try {
                // req.user = await UserRepository.findById(user.id)
                next()
            } catch (e) {
                return res.status(e.status || 401).send({ message: 'User not found!' })
            }
        })
}
}
module.exports = new Auth()