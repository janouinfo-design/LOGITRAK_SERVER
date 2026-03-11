const router = require('express').Router()
const objectController = require('../controllers/object.controller')
 
/**
 * @swagger
 * definitions:
 *   Deposit:
 *     type: object
 *     example: {"id": 0, "name": "depot test" , active: 1}
 *   objectCount:
 *     type: string
 *     example: {"srcObject": "","srcStatut":""}
 */
/**
* @swagger
* /object/count:
*  get:
*     tags: 
*      - object
*     description: recuperer un object  
*     parameters:
*       - in: query
*         name: data
*         description: data
*         schema:
*            $ref: '#/definitions/objectCount'
*     responses:
*     - 200:
*        description: depot recupéré
*/
router.all('/count', objectController.count)
 

module.exports = router