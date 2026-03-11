const router = require('express').Router()
const communicationController = require('../controllers/communication.controller')


/**
 * @swagger
 * definitions:
 *   communicationList:
 *     type: string
 *     example: {"srcId": 0, "srcObject": ""}
 */

/**
 * @swagger
 * /communication/mainlist:
 *   get:
 *     summary: Get all communications
 *     description: Get a list of communications
 *     parameters:
 *       - in: query
 *         name: data
 *         description: communicationList data
 *         schema:
 *           $ref: '#/definitions/communicationList'
 *     responses:
 *       200:
 *         description: List of Communication retrieved successfully
 */

router.all('/mainList', communicationController.mainList)

