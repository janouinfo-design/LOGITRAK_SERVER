const  { SECRET_KEY } = require('../../../configs/')
const { verifyToken } = require('../../../utils/security.utl')

exports.checkToken = (req, res, next) =>{
    console.log('req.body:', req.body)
    if(req.body.auth_key != SECRET_KEY){
         res.status(401).json({result: undefined , error: [{message:"Incorrect key"}]})
         return
    }
    next()
}

exports.isValidToken = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) return res.sendStatus(401)

    token = /Bear/.test(token) ? token.split(' ')[1] : token

    const verifiedToken = await verifyToken(token.trim(), 'access')

    if (!verifiedToken.isValid && verifiedToken.result == 'jwt expired') return res.sendStatus(403)
    else if (!verifiedToken.isValid) return res.status(500).json(verifiedToken)

    req.user = verifiedToken.result
    next()
}

exports.isAuth = async (req, res, next) => {
    console.log('cookies', req.cookies);
    let token = (req.cookies || {}).token;

    if (!token) return res.sendStatus(401);

    token = /Bear/.test(token) ? token.split(' ')[1] : token

    console.log('token:', token)

    const verifiedToken = await verifyToken(token, 'refresh')

    if (!verifiedToken.isValid && verifiedToken.result == 'jwt expired') return res.sendStatus(403)
    else if (!verifiedToken.isValid) return res.status(500).json(verifiedToken)

    next()
}