const router = require('express').Router()
const depositController = require('../controllers/deposit.controller')

/**
 * @swagger
 * definitions:
 *   Deposit:
 *     type: object
 *     example: {"id": 0, "name": "depot test" , active: 1}
 *   DepositGet:
 *     type: string
 *     example: {"id": 1}
 */

/**
 * @swagger
 * /deposit/list:
 *   get:
 *     tags:
 *       - depots
 *     description: list des depots
 *     responses:
 *      - 200:
 *         description: list recupéré
 */


router.all('/list', depositController.list)

/**
   * @swagger
    * /deposit/get:
    *  get:
    *     tags: 
    *      - depots
    *     description: recuperer un dépot  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/DepositGet'
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all('/get', depositController.get)

  /**
   * @swagger
    * /deposit/save:
    *  post:
    *     tags: 
    *      - depots
    *     description: ajouter/modifier un depot  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/Deposit' 
    *     responses:
    *      200:
    *        description: adresse crée avec succès
*/

router.all('/save', depositController.save)

/**
   * @swagger
    * /deposit/remove:
    *  get:
    *     tags: 
    *      - depots
    *     description: supprimer un dépot  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/DepositGet'
    *     responses:
    *      200:
    *        description: depot supprimé
*/

router.all('/remove', depositController.remove)

/**
    * @swagger
    * /deposit/activate:
    *  post:
    *     tags: 
    *      - depots
    *     description: activer/desactiver un dépot  
    *     requestBody:
    *       description: body
    *       content: 
    *        application/json:
    *         schema:
    *            type: object
    *            example: {id: 1 , active: 1}
    *     responses:
    *      200:
    *        description: success
*/

router.all('/activate', depositController.activate)

module.exports = router