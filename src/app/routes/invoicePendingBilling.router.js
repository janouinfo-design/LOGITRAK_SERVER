const router = require('express').Router()
const invoicePendingBilling = require('../controllers/invoicePendingBilling.controller')
/**
 * @swagger
 * definitions:
 *   invoicePendingBilling:
 *     type: string
 *     example: {"id": ""}
 */

/**
 * @swagger
 * /invoicePendingBilling/list:
 *   get:
 *     tags:
 *       - invoicePendingBilling
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/invoicePendingBilling'
 *     description: list des invoicePendingBilling
 *     responses:
 *      - 200:
 *         description: list recupéré
 */

module.exports = router