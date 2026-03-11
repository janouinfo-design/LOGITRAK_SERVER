const router = require('express').Router()
const matrixController = require('../controllers/matrix.controller')
/**
 * @swagger
 * definitions:
 *   matrix:
 *     type: string
 *     example: {"id": ""}
 *   matrixGet:
 *     type: string
 *     example: {"code": "M1"}
 *   matrixSave:
 *     type: string
 *     example: {"id": 0, "code": "M13", "desc": "Matrice M1", "xp": "VolumePrestation", "xu": "kg", "yp": "VolumePrestation", "yu": "m3"}
 */

/**
 * @swagger
 * /matrix/list:
 *   get:
 *     tags:
 *       - matrix
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/matrix'
 *     description: list des matrix
 *     responses:
 *      - 200:
 *         description: list recupéré
 */


// router.all('/list', matrixController.list)

/**
   * @swagger
    * /matrix/get:
    *  get:
    *     tags: 
    *      - matrix
    *     description: recuperer une matrice  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/matrixGet'
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all('/get', matrixController.get)


/**
   * @swagger
    * /matrix/save:
    *  post:
    *     tags: 
    *      - matrix
    *     description: add matrice  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/matrixSave' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/

// router.post('/save', matrixController.save) 


/**
   * @swagger
    * /matrix/remove:
    *  get:
    *     tags: 
    *      - matrix
    *     description: supprimer un dépot  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/matrixGet'
    *     responses:
    *      200:
    *        description: depot supprimé
*/

router.all('/remove', matrixController.remove)

module.exports = router