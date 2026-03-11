const router = require('express').Router()
const tagController = require('../controllers/tag.controller')

/**
 * @swagger
 * definitions:
 *   tagsByStatut:
 *     type: string
 *     example: {"src": ""}
 *   tagsList:
 *     type: string
 *     example: {"IDCustomer": 0 }
 *   tagsGet:
 *     type: string
 *     example: {"id": 4}
 *   tagsRemove:
 *     type: string
 *     example: {"id": 4}
 *   tagsSave:
 *     type: string
 *     example: {"id": 0,"code":"T2","log":"T2L","adresse":"AD","IDCustomer":0,"active":1}
 *   tagsDashboard:
 *     type: string
 *     example: {}
 *   tagsMobDashboard:
 *     type: string
 *     example: {"LocationObject": "","LocationID":""}
 *   tagsGetHistorique:
 *     type: string
 *     example: {"id": 0}
 *   tagsActivate:
 *     type: string
 *     example: {"id": 0,"active" : 0}
 *   tagsRemoveByCustomer:
 *     type: string
 *     example: {"idCustomer": 0,"idTag" : 0}
 *   tagsGetByCustomer:
 *     type: string
 *     example: {"idCustomer": 0}
 *   tagsCountTagged:
 *     type: string
 *     example: {"srcType" : "tagged"}
 *   tagsSaveBattery:
 *     type: string
 *     example: {"id" : 0, "batterylevel" : 0}
 */
/**
   * @swagger
    * /tag/list:
    *  get:
    *     tags: 
    *      - tags1
    *     description: Get all tags  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/tagsList'
    *     responses:
    *      200:
    *        description: Get all tags  
*/
router.all('/list', tagController.list)
/**
   * @swagger
    * /tag/get:
    *  get:
    *     tags: 
    *      - tags1
    *     description: Get tag  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/tagsGet'
    *     responses:
    *      200:
    *        description: Get tag 
*/
router.all('/get', tagController.get) 
/**
   * @swagger
    * /tag/save:
    *  post:
    *     tags: 
    *      - tags1
    *     description: add tag  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsSave' 
    *     responses:
    *      200:
    *        description: add tag  
*/
router.post('/save', tagController.save) 

/**
   * @swagger
    * /tag/remove:
    *  post:
    *     tags: 
    *      - tags1
    *     description: remove tag  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsRemove'
    *     responses:
    *      200:
    *        description: remove tag  
*/
router.all('/remove', tagController.remove)



/**
   * @swagger
    * /tag/dashboarddetail:
    *  post:
    *     tags: 
    *      - tags1
    *     description: web dashboard detail
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsDashboardDetail'
    *     responses:
    *      200:
    *        description: web dashboard detail
*/
router.all('/dashboarddetail', tagController.dashboarddetail)


/**
   * @swagger
    * /tag/dashboard:
    *  post:
    *     tags: 
    *      - tags1
    *     description: web dashboard
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsDashboard'
    *     responses:
    *      200:
    *        description: web dashboard
*/
router.all('/dashboard', tagController.dashboard)



/**
   * @swagger
    * /tag/mobdashboard:
    *  post:
    *     tags: 
    *      - tags1
    *     description: mobile dashboard
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsMobDashboard'
    *     responses:
    *      200:
    *        description: mobile dashboard
*/
router.all('/mobdashboard', tagController.mobdashboard)

 
/**
* @swagger
* /tag/bystatut:
*  get:
*     tags: 
*      - tags1
*     description: recuperer un statut  
*     parameters:
*       - in: query
*         name: data
*         description: data
*         schema:
*            $ref: '#/definitions/tagsByStatut'
*     responses:
*     - 200:
*        description: depot recupéré
*/
router.all('/bystatut', tagController.bystatut)

/**
   * @swagger
    * /tag/gethistorique:
    *  post:
    *     tags: 
    *      - tags1
    *     description: get tag historique
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsGetHistorique'
    *     responses:
    *      200:
    *        description: get tag historique
*/
router.all('/gethistorique', tagController.gethistorique)


/**
   * @swagger
    * /tag/activate:
    *  post:
    *     tags: 
    *      - tags1
    *     description: activate tag  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsActivate'
    *     responses:
    *      200:
    *        description: activate tag  
*/
router.all('/activate', tagController.activate)


/**
   * @swagger
    * /tag/removebyCustomer:
    *  post:
    *     tags: 
    *      - tags1
    *     description: remove tag by customer
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsRemoveByCustomer'
    *     responses:
    *      200:
    *        description: remove tag by customer
*/
router.all('/removebyCustomer', tagController.removebyCustomer)



/**
   * @swagger
    * /tag/getbyCustomer:
    *  post:
    *     tags: 
    *      - tags1
    *     description: get tag by customer
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsGetByCustomer'
    *     responses:
    *      200:
    *        description: get tag by customer
*/
router.all('/getbyCustomer', tagController.getbyCustomer)


/**
   * @swagger
    * /tag/countTag:
    *  get:
    *     tags: 
    *      - tags1
    *     description: get count tagged/untagged
    *     requestBody:
    *     - in : query
    *       name : data
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsCountTagged'
    *     responses:
    *      200:
    *        description: count tagged
*/
router.all('/countTag', tagController.countTag)


/**
   * @swagger
    * /tag/saveBattery:
    *  post:
    *     tags: 
    *      - tags1
    *     description: tag save battery
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/tagsSaveBattery' 
    *     responses:
    *      200:
    *        description: tag save battery
*/
router.post('/saveBattery', tagController.saveBattery) 


module.exports = router