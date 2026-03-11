const jwt = require('jsonwebtoken')
const SECRET_KEY = 'OMNI-APP-SECRET-KEY'

exports.hashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        require('bcrypt').hash(password, 10, (err, hash) => {
            resolve(err ? { success: false, data: err.message } : { success: true, data: hash })
        })
    })
}

exports.comparePassword = async (password, hash) => {
    return new Promise((resolve, reject) => {
        require('bcrypt').compare(password, hash, (err, isEqual) => {
            resolve(isEqual)
        })
    })
}

exports.generateToken = async (data, options = { type: 'refresh' }) => {
    options = options || {};
    options.type = options.type || 'refresh'
    options.expiresIn = process.env[options.type.toUpperCase() + '_AGE']

    // options.expiresIn || 
    console.log('options', options)
    return new Promise((resolve, reject) => {
        const secret = process.env['JWT_' + options.type.toUpperCase() + '_TOKEN_SECRET']
        if (!secret) resolve(null);
        delete options.type
        jwt.sign(
            data,
            secret.trim(),
            options,
            (err, token) => {
                if (err) {
                    console.log('err:', err.message)
                    resolve(null)
                }
                resolve(token)
            })
    })
}

exports.verifyToken = async (token, type) => {
    return new Promise((resolve, reject) => {
        const secret = process.env['JWT_' + type.toUpperCase() + '_TOKEN_SECRET'];
        if (!secret) resolve({ isValid: false, result: "secret type doesn't exist" })
        jwt.verify(token, secret, (err, data) => {
            if (err) resolve({ isValid: false, result: err.message, code: err.code })
            resolve({ isValid: true, result: data })
        })
    })
}
