const router = require('express').Router()
const catalogController = require('../controllers/catalog.controller')

router.all('/list', catalogController.list)
router.all('/get', catalogController.get)
router.all('/save', catalogController.save)
router.all('/remove', catalogController.remove)

module.exports = router