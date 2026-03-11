const router = require('express').Router()
const validatorController = require('../controllers/validator.controller')
 
/**
 * @swagger
 * definitions:
 *   Deposit:
 *     type: validator
 *     example: {"id": 0, "name": "depot test" , active: 1}
 *   validatorList:
 *     type: string
 *     example: {"name": ""}
 */
/**
* @swagger
* /validator/list:
*  get:
*     tags: 
*      - validator
*     description: recuperer un validator  
*     parameters:
*       - in: query
*         name: data
*         description: data
*         schema:
*            $ref: '#/definitions/validatorList'
*     responses:
*     - 200:
*        description: depot recupéré
*/
router.all('/list', validatorController.list)
 

module.exports = router