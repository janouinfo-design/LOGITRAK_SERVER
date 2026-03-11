const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")

/*
provider/list
provider/save
*/

exports.list = async (req, res)=>{
    try {
  
      let data = req.body.data || req.body;
      
      let params = [
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
  
    let response = await ssm.execProc('provider_list',params)
    loggermodule.info('End provider list')
    res.status(response.status).json(response)
  }catch(e){
  loggermodule.error(`Error provider list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
  }
  }


  
exports.save = async (req, res)=>{
    try {
  
      let data = req.body.data || req.body;
      
      let params = [
        {
          name: "id",
          type: TYPES.Int,
          value: data.id || 0,
        },
        {
            name: "name",
            type: TYPES.NVarChar,
            value: data.name || "",
          },
          {
            name: "label",
            type: TYPES.NVarChar,
            value: data.label || "",
          },
          {
            name: "active",
            type: TYPES.Int,
            value: data.active || 0,
          },
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
  
    let response = await ssm.execProc('provider_save',params)
    loggermodule.info('End provider save action')
    res.status(response.status).json(response)
  }catch(e){
  loggermodule.error(`Error provider save action :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
  }
  }