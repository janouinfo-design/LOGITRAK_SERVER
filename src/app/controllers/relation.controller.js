const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")


exports.remove = async (req, res)=>{
    try {
  
      let data = req.body.data || req.body;
      
      let params = [
        {
          name: "objId",
          type: TYPES.NVarChar,
          value: data.objId || "",
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
  
    let response = await ssm.execProc('relation_remove',params)
    loggermodule.info('End relation remove action')
    res.status(response.status).json(response)
  }catch(e){
  loggermodule.error(`Error relation remove action :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
  }
  }



  exports.add = async (req, res)=>{
    try {
  
      let data = req.body.data || req.body;
      
      let params = [
        {
          name: "srcId",
          type: TYPES.Int,
          value: data.srcId || 0,
        },
        {
            name: "src",
            type: TYPES.NVarChar,
            value: data.src || "",
          },
          {
            name: "objId",
            type: TYPES.NVarChar,
            value: data.objId || "",
          },
          {
            name: "obj",
            type: TYPES.NVarChar,
            value: data.obj || "",
          },
          {
            name: "LocationObject",
            type: TYPES.NVarChar,
            value: data.LocationObject || "",
          },
          {
            name: "LocationID",
            type: TYPES.Int,
            value: data.LocationID || 0,
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
  
    let response = await ssm.execProc('relation_add',params)
    loggermodule.info('End relation add action')
    res.status(response.status).json(response)
  }catch(e){
  loggermodule.error(`Error relation add action :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
  }
  }


  exports.save = async (req, res)=>{
    try {
  
      let data = req.body.data || req.body;

      console.log('userinfo : ',req?.userInfos?.userID);
      console.log('userinfo : ',req?.userInfos?.attachement);
      
      let params = [
        {
          name: "childObject",
          type: TYPES.NVarChar,
          value: data.childObject || "",
        },
        {
            name: "childID",
            type: TYPES.BigInt,
            value: data.childID || 0,
          },
          {
            name: "parent",
            type: TYPES.NVarChar,
            value: data.parent || "",
          },
          {
            name: "parentID",
            type: TYPES.BigInt,
            value: data.parentID || 0,
          },
          {
            name: "lat",
            type: TYPES.NVarChar,
            value: data.lat || "",
          },
          {
            name: "lng",
            type: TYPES.NVarChar,
            value: data.lng || "",
          },

          {
            name: "LocationObject",
            type: TYPES.NVarChar,
            value: data.LocationObject || "",
          },
          {
            name: "LocationID",
            type: TYPES.Int,
            value: data.LocationID || 0,
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
  
    let response = await ssm.execProc('TableRelation_save',params)
    loggermodule.info('End save relation action')
    res.status(response.status).json(response)
  }catch(e){
  loggermodule.error(`Error saving relation action :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
  }
  }