const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const fileLib = require('../../libs/files.lib')
const loggermodule = require("#modules/loggermodule.js")


exports.print = async (req , res)=>{
    try {
        let data = req.body.data || req.body;
                    
        let params = [
            { 
                name:"orderID",
                type: TYPES.Int,
                value: data.orderID || 0},
                { 
                    name:"type",
                    type: TYPES.NVarChar,
                    value: data.type || ""},
                    {
                        name: "point_attachement",
                        type: TYPES.Int,
                        value: req?.userInfos?.attachement || 0,
                      },
                      {
                        name: "user",
                        type: TYPES.Int,
                        value: req?.userInfos?.userID || 0,
                      },
        ]
    
        let response  = await ssm.execProc("Order_print", params) ;
        loggermodule.info('End order print action')
        res.status(response.status).json(response)
    }catch(e){
        loggermodule.error(`Error order print action :`+ e.message)
        res.status(500).json({ success:false, res : e.message });
      }
    }