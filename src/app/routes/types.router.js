const router = require('express').Router()
const typesController = require('../controllers/types.controller')

/*
/**
 * @swagger
 * definitions:
 *   typesList:
 *     type: string
 *     example: {"src": ""}
 *   typesGet:
 *     type: string
 *     example: {"id": 4}
 *   typesSave:
 *     type: string
 *     example: {"id" : 5, "typeID" : 7, "label" : "new type", "name" : "newType", "icon" : "fa fa-test", "color" : "#FFFFFF", "backgroundColor" : "#FFFFFF"}
 */

/*
 * @swagger
 * /types/list:
 *   get:
 *     summary: Get all Types
 *     description: Get a list of types
 *     parameters:
 *       - in: query
 *         name: data
 *         description: typesList data
 *         schema:
 *           $ref: '#/definitions/communicationList'
 *     responses:
 *       200:
 *         description: List of Types retrieved successfully
 */

router.all('/list', typesController.list)

/*
 * @swagger
 * /types/get:
 *   get:
 *     summary: Get all Types
 *     description: Get a list of Types
 *     parameters:
 *       - in: query
 *         name: data
 *         description: typesList data
 *         schema:
 *           $ref: '#/definitions/typesList'
 *     responses:
 *       200:
 *         description: List of Types retrieved successfully
 */

router.all('/get', typesController.get)

/*
 * @swagger
 * /types/saveItems:
 *   get:
 *     summary: Save TypeItems
 *     description: save TypeItems
 *     parameters:
 *       - in: query
 *         name: data
 *         description: typesList data
 *         schema:
 *           $ref: '#/definitions/typesSave'
 *     responses:
 *       200:
 *         description: Saved successfully
 */

//router.all('/saveItems', typesController.saveItems)

module.exports = router