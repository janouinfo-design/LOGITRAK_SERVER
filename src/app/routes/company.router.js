const router = require('express').Router()
const companyController = require('../controllers/company.controller')



router.all('/list', companyController.list)
router.all('/get', companyController.get)

router.all('/save', companyController.save)
module.exports = router