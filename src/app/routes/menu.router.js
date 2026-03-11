const router = require('express').Router()
const menuController = require('../controllers/menu.controller')
 
/**
 * @swagger
 * definitions:
 *   Deposit:
 *     type: object
 *     example: {"id": 0, "name": "depot test" , active: 1}
 *   WorksiteList:
 *     type: string
 *     example: {"IDCustomer": 0}
 */
/**
* @swagger
* /worksite/list:
*  get:
*     tags: 
*      - WorksiteList
*     description: recuperer   WorksiteList  
*     parameters:
*       - in: query
*         name: data
*         description: data
*         schema:
*            $ref: '#/definitions/WorksiteList'
*     responses:
*     - 200:
*        description: depot recupéré
*/
router.all('/get', menuController.list)
 

module.exports = router