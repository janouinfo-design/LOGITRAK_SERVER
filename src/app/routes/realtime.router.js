const router = require('express').Router()
const realtimeController = require('../controllers/realtime.controller')

router.all('/on', realtimeController.onEvent)
//router.all('/fire', realtimeController.get)

module.exports = router