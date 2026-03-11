const userController = require('../controllers/user.controller')
const router = require('express').Router()

router.all('/login', userController.login)

module.exports = router