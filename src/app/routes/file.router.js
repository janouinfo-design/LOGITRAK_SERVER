const router = require('express').Router()
const fileController = require('../controllers/file.controller')

router.post('/save', fileController.save)


module.exports = router