const router = require('express').Router()
const addressController = require('../controllers/address.controller')

/**
 * @swagger
 * /address/list:
 *   get:
 *     tags:
 *       - adresses
 *     description: list des address
 *     responses:
 *      - 200:
 *         description: list recupéré
 *   post:
 *     tags: 
 *      - adresses
 *     description: ajoute une adresse
 *     response:
 *      -200:
 *        description: adresse crée avec succès
 *   
 */




router.get('/list', addressController.list)
router.all('/get', addressController.get)
router.all('/get_default', addressController.get_default)
router.all('/save', addressController.save)
router.all('/save_default', addressController.save_default)
router.all('/remove', addressController.remove)

module.exports = router


