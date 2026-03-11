const router = require('express').Router()
const invoiceController = require('../controllers/invoice.controller')
/**
 * @swagger
 * definitions:
 *   invoice:
 *     type: string
 *     example: {"custumerid": 0}
 *   invoiceGet:
 *     type: string
 *     example: {"id": 1}
 *   invoiceSave:
 *     type: string
 *     example: {"id": 0, "info":'{"reference":"","description":"","clientID":0,"creaDate":"","OrderDate":""}'}
 */

/**
 * @swagger
 * /invoice/list:
 *   get:
 *     tags:
 *       - invoice
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/invoice'
 *     description: list des invoice
 *     responses:
 *      - 200:
 *         description: list recupéré
 */


router.all('/list', invoiceController.list)

/**
   * @swagger
    * /invoice/get:
    *  get:
    *     tags: 
    *      - invoice
    *     description: recuperer un client  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/invoiceGet'
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all('/get', invoiceController.get)


/**
 * @swagger
 * /invoice/save:
 *   get:
 *     tags:
 *       - invoice
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/invoiceSave'
 *     description: save des invoice
 *     responses:
 *      - 200:
 *         description: save recupéré
 */

router.all('/save', invoiceController.save)

/**
   * @swagger
    * /invoice/remove:
    *  get:
    *     tags: 
    *      - invoice
    *     description: supprimer un dépot  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/invoiceGet'
    *     responses:
    *      200:
    *        description: depot supprimé
*/

router.all('/remove', invoiceController.remove)

module.exports = router