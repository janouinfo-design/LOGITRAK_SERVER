const router = require('express').Router();
const authController = require('../controllers/auth.controller')

router.post('/login', authController.login)
router.all('/logout', authController.logout)
router.all('/refresh', authController.handleRefreshToken)
router.all('/verifyUser', authController.verifyUser)
router.all('/checkUserToken', authController.checkToken)

module.exports = router