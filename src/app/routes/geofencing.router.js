const router = require('express').Router()
const geofencingController = require('../controllers/geofencing.controller')

/**
 * @swagger
 * definitions:
 *   Geofencing:
 *     type: object
 *     example: {"id": 0, "name": "depot test" , active: 1}
 *   GeofencingGet:
 *     type: string
 *     example: {"id": 1}
 */

/**
 * @swaggerrr
 * /geofencing/list:
 *   get:
 *     tags:
 *       - depots
 *     description: list des depots
 *     responses:
 *      - 200:
 *         description: list recupéré
 */


router.all('/list', geofencingController.list)

/**
   * @swaggerrr
    * /geofencing/get:
    *  get:
    *     tags: 
    *      - depots
    *     description: recuperer un dépot  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/GeofencingGet'
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all('/get', geofencingController.get)

  /**
   * @swaggerrr
    * /geofencing/save:
    *  post:
    *     tags: 
    *      - depots
    *     description: ajouter/modifier un depot  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/Geofencing' 
    *     responses:
    *      200:
    *        description: adresse crée avec succès
*/

router.post('/save', geofencingController.save)

/**
   * @swaggerrr
    * /geofencing/remove:
    *  get:
    *     tags: 
    *      - depots
    *     description: supprimer un dépot  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/GeofencingGet'
    *     responses:
    *      200:
    *        description: depot supprimé
*/

router.all('/remove', geofencingController.remove)

/**
    * @swaggerrr
    * /geofencing/activate:
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

router.all('/activate', geofencingController.activate)

module.exports = router