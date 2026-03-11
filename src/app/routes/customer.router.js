const router = require('express').Router()
const customerController = require('../controllers/customer.controller')
/**
 * @swagger
 * definitions:
 *   Customer:
 *     type: object
 *     example: {"id": 0, "name": "John doe" , "label":"John doe"}
 *   CustomerGet:
 *     type: string
 *     example: {"id": 1}
 */

/**
 * @swagger
 * /customer/list:
 *   get:
 *     tags:
 *       - clients
 *     description: list des clients
 *     responses:
 *      - 200:
 *         description: list recupéré
 */


router.all('/list', customerController.list)

/**
   * @swagger
    * /customer/get:
    *  get:
    *     tags: 
    *      - clients
    *     description: recuperer un client  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/CustomerGet'
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all('/get', customerController.get)


/**
   * @swagger
    * /customer/save:
    *  post:
    *     tags: 
    *      - clients
    *     description: ajouter/modifier un client  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/Customer' 
    *     responses:
    *      200:
    *        description: client crée avec succès
*/

router.all('/save', customerController.save)

/**
   * @swagger
    * /customer/remove:
    *  get:
    *     tags: 
    *      - clients
    *     description: supprimer un dépot  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/CustomerGet'
    *     responses:
    *      200:
    *        description: depot supprimé
*/

router.all('/remove', customerController.remove)

module.exports = router