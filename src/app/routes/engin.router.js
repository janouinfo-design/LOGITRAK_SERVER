const router = require("express").Router();
const enginController = require("../controllers/engin.controller");


/**
 * @swagger
 * definitions:
 *   enginsList:
 *     type: string
 *     properties:
 *       LocationObject:
 *         type: string
 *       LocationID:
 *         type: integer
 *       statutEngin:
 *         type: string
 *       user:
 *         type: integer
 *     example:
 *       LocationObject: ""
 *       LocationID: 0
 *       statutEngin: ""
 *       user: 1
 *   typelist:
 *     type: string
 *     properties:
 *       LocationObject:
 *         type: string
 *       LocationID:
 *         type: integer
 *       typeEngin:
 *         type: string
 *     example:
 *       LocationObject: "worksite"
 *       LocationID: 3
 *       typeEngin: "small"
 *   tagsByStatut:
 *     type: object
 *     properties:
 *       src:
 *         type: string
 *     example:
 *       src: ""
 *   enginsStatut:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       statutEngin:
 *         type: string
 *     example:
 *       id: 0
 *       statutEngin: ""
 *   saveTypes:
 *     type: string
 *     properties:
 *       enginID:
 *         type: integer
 *       types:
 *         type: string
 *     example:
 *       enginID: 0
 *       types: "[{'type':'t1'}]"
 */

/**
 * @swagger
 * /engin/list:
 *   get:
 *     summary: Get all engins
 *     description: Get a list of engins based on provided data
 *     parameters:
 *       - in: query
 *         name: data
 *         description: enginsList data
 *         schema:
 *           $ref: '#/definitions/enginsList'
 *     responses:
 *       200:
 *         description: List of engins retrieved successfully
 */
router.get("/list", enginController.list);


/**
    * @swagger
    * /engin/typelist:
    *  get:
    *     engins: 
    *      - engins1
    *     description: Get all engins  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/typelist'
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/typelist", enginController.typelist);
/**
    * @swagger
    * /engin/saveTypes:
    *  get:
    *     engins: 
    *      - engins1
    *     description: Get all engins  
    *     parameters:
    *       - in: query
    *         name: data
    *         description: data
    *         schema:
    *            $ref: '#/definitions/saveTypes'
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/saveTypes", enginController.saveTypes);
/**
   * @swagger
    * /engin/save:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsSave' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all("/save", enginController.save);



/**
   * @swagger
    * /engin/remove:
    *  post:
    *     engins: 
    *      - engins1
    *     description: remove engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsRemove'
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all("/remove", enginController.remove);



/**
   * @swagger
    * /engin/listhistory:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsListHistory' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all("/listhistory", enginController.listhistory);



/**
   * @swagger
    * /engin/troubleshoot:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsTroubleshoot' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all("/troubleshoot", enginController.troubleshoot);





/**
   * @swagger
    * /engin/timelinelist:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsTIMELINELIST' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/

router.all("/timelinelist", enginController.timelinelist);




/**
   * @swagger
    * /engin/event:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsEvent' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/event", enginController.event);



/**
   * @swagger
    * /engin/statut:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsStatut' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/statut", enginController.statut);





/**
   * @swagger
    * /engin/reception:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsReception' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/reception", enginController.reception);


/**
   * @swagger
    * /engin/exit:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsExit' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/exit", enginController.exit);



/**
   * @swagger
    * /engin/tags:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsTags' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/tags", enginController.tags);



/**
   * @swagger
    * /engin/saveaddinfo:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsSaveAddInfo' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/saveaddinfo", enginController.saveaddinfo);





/**
   * @swagger
    * /engin/CountTagged:
    *  post:
    *     engins: 
    *      - engins1
    *     description: add engin  
    *     requestBody:
    *       description: data
    *       content:
    *        application/json:
    *          schema:
    *            $ref: '#/definitions/enginsCountTagged' 
    *     responses:
    *      200:
    *        description: depot recupéré
*/
router.all("/CountTagged", enginController.CountTagged);
 
/**
* @swagger
* /engin/bystatut:
*  get:
*     engins: 
*      - engins1
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


module.exports = router;
