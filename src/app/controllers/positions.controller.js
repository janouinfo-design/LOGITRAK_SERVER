const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")
let { onResult, onException } = require("#utils/error.utl.js");



exports.getHistorique = async (req, res)=> {
    try {

      let data = req.body.data || req.body;

      let userId = req.body.userInfos.userID;
      let attachement = req.body.userInfos.attachement;

      let params = [
        {
            name:"srcId",
            type: TYPES.Int,
            value: data.srcId
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

      let response = await ssm.execProc('Positions_getHistorique',params)
    
      onResult(res, response)
    }catch(e){
      loggermodule.error(`Error enventory list :`+ e.message)
      res.status(500).json({ success:false, res : e.message });
  }

}


 

 