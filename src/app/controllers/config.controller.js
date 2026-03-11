const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
 
const loggermodule = require("#modules/loggermodule.js")



exports.get = async (req , res)=>{
    try {
    
    let data = req.body.data || req.body;
    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;


    let params = [
        {
            name: "configName",
            type: TYPES.NVarChar,
            value: data.configName || "",
          },
        {
            name: "point_attachement",
            type: TYPES.Int,
            value: attachement,
          },
          {
            name: "user",
            type: TYPES.Int,
            value: userId,
          },
    ]

    let response  = await ssm.execProc("Config_Get",params);
    loggermodule.info('End Getting Config')
    res.status(200).json(response)
}catch(e){
  loggermodule.error(`Error Getting Config :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}


