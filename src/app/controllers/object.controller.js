const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")

exports.count = async (req, res)=> {
  try {

    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

   let params = [
    {
        name:"srcObject",
        type: TYPES.NVarChar,
        value: data.srcObject
    }, 
    {
        name:"srcStatut",
        type: TYPES.NVarChar,
        value: data.srcStatut
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
//let response = await ssm.execProc('customer_get', {date: '12333'})
   let response = await ssm.execProc('getCount',params)

   response.result.forEach(inv => {
     if(typeof inv.jsonResult == "string") {
        inv.jsonResult = JSON.parse(inv.jsonResult);
     }
   }); 

  res.status(200).json(response)
}catch (e) {
  loggermodule.error(`Error saving device ` + e.message);
  res.status(500).json({ success: false, res: e.message });
}
}



exports.noActiveList = async (req, res)=> {
  try {

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

   let params = [
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

    let response = await ssm.execProc('object_NonActiveList',params)

 
    loggermodule.info("End displaying NonActiveList");
    res.status(response.status).json(response);
}catch (e) {
  loggermodule.error(`Error saving device ` + e.message);
  res.status(500).json({ success: false, res: e.message });
}


}



exports.activate = async (req, res)=> {
  try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

   let params = [
    {
      name: "srcId",
      type: TYPES.Int,
      value: data.srcId,
    },
    {
      name: "srcObject",
      type: TYPES.NVarChar,
      value: data.srcObject,
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

    let response = await ssm.execProc('object_Activate',params)

 
    loggermodule.info("End Activating");
    res.status(response.status).json(response);
}catch (e) {
  loggermodule.error(`Error Activating` + e.message);
  res.status(500).json({ success: false, res: e.message });
}
}


exports.delete = async (req, res)=> {
  try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

   let params = [
    {
      name: "srcId",
      type: TYPES.Int,
      value: data.srcId,
    },
    {
      name: "srcObject",
      type: TYPES.NVarChar,
      value: data.srcObject,
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

    let response = await ssm.execProc('object_Delete',params)

 
    loggermodule.info("End Activating");
    res.status(response.status).json(response);
}catch (e) {
  loggermodule.error(`Error Activating` + e.message);
  res.status(500).json({ success: false, res: e.message });
}
}

 



