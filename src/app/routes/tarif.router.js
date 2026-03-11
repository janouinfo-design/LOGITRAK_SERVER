const router = require('express').Router()
const tarifController = require('../controllers/tarif.controller')
/**
 * @swagger
 * definitions:
 *   tarif:
 *     type: string
 *     example: {"id": ""}
 *   tarifGet:
 *     type: string
 *     example: {"code": "T1"}
 *   tarifSave:
 *     type: string
 *     example: {"id": 2, "code": "T1", "desc": "Tarif T1", "prestation": "Livraison", "etat": "active", "id_tarif_filter_selection": 2, "valeur_filter_selection": "v1","formule_condition": "f1","formule_calcule":"fc1"}
 */

/**
 * @swagger
 * /tarif/list:
 *   get:
 *     tags:
 *       - tarif
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/tarif'
 *     description: list des tarif
 *     responses:
 *      - 200:
 *         description: list recupéré
 */


router.all('/list', tarifController.list)

/**
   * @swagger
    * /tarif/get:
    *  get:
    *     tags: 
    *      - tarif
    *     description: recuperer une tarif  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/tarifGet'
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all('/get', tarifController.get)


/**
   * @swagger
    * /tarif/save:
    *  post:
    *     tags: 
    *      - tarif
    *     description: add tarif  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tarifSave' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.post('/save', tarifController.save) 


/**
   * @swagger
    * /tarif/remove:
    *  get:
    *     tags: 
    *      - tarif
    *     description: supprimer un dépot  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/tarifGet'
    *     responses:
    *      200:
    *        description: depot supprimé
*/

router.all('/remove', tarifController.remove)

module.exports = router