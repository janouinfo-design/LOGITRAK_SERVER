const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")
exports.get = async (req, res)=> {
  let response = {} 
  try {
      response = await ssm.execProc('WEB_GET_MENUS')
         
      res.status(response.status).json(response)
   }catch(e){
      response.response = e.message
    }
    finally {
      //console.log('respose:', response)
      if(response.success)
        loggermodule.info('End menu get')
      else loggermodule.error(`Error menu get :`+response.response)
      return response
    }
   }