const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")
exports.list = async (req, res)=> {
  let response = {} 
  try {

   let data =req.body

   let params = [
    {
        name:"name",
        type: TYPES.NVarChar,
        value: data.name
    }, 
     
    ]
  //let response = await ssm.execProc('customer_get', {date: '12333'})
   response = await ssm.execProc('Validator_load',params)
   response.result.forEach(inv => {
     if(typeof inv.jsonResult == "string") {
        inv.jsonResult = JSON.parse(inv.jsonResult);
     }
   }); 

res.status(200).json(response)
}catch(e){
   response.response = e.message
 }
 finally {
   //console.log('respose:', response)
   if(response.success)
     loggermodule.info('End validator list')
   else loggermodule.error(`Error  validator list :`+response.response)
   return response
 }
}