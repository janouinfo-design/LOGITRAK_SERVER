const router=require('express').Router()
const langController = require('../controllers/lang.controller')

router.all('/get', langController.get)
router.all('/list', langController.list)
router.all('/save', langController.save)

module.exports = router