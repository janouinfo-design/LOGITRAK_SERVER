const router = require('express').Router()
const statusController = require('../controllers/status.controller')


/**
 * @swagger
 * definitions:
 *   Status:
 *     type: object
 *     example: {"id": 0, "name": "status test" , "active": 1 , "typeId": 0 , "iconId":0 , "icon":"fas fa-border-none" , "color":"#fff", "backgroundColor":'#000' ,"point_attachement": 0 , "user": 0 ,"BGID": 0 }
 *   StatusGet:
 *     type: string
 *     example: {"id": 0,"src":'tag'}
 */

/**
   * @swagger
    * /status/list:
    *  get:
    *     tags: 
    *      - status
    *     description: recuperer un status  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/StatusGet'
    *     responses:
    *     - 200:
    *        description: depot recupéré
*/


router.all('/list', statusController.list)

/**
   * @swagger
    * /status/get:
    *  get:
    *     tags: 
    *      - status
    *     description: recuperer un status  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/StatusGet'
    *     responses:
    *     - 200:
    *        description: depot recupéré
*/

router.all('/get', statusController.get)

  /**
   * @swagger
    * /status/save:
    *  post:
    *     tags: 
    *      - status
    *     description: ajouter/modifier un depot  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/Status' 
    *     responses:
    *      200:
    *        description: adresse crée avec succès
*/

router.all('/save', statusController.save)

/**
   * @swagger
    * /status/remove:
    *  get:
    *     tags: 
    *      - status
    *     description: supprimer un status  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/StatusGet'
    *     responses:
    *      200:
    *        description: depot supprimé
*/

router.all('/remove', statusController.remove)

/**
    * @swagger
    * /status/activate:
    *  post:
    *     tags: 
    *      - status
    *     description: activer/desactiver un status  
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

router.all('/activate', statusController.activate)

module.exports = router