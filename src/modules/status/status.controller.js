const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js");
const { fetchStatusTransitions } = require('./status.service');
const { onException, onResult } = require('#utils/error.utl.js');

exports.list = async (req, res)=> {
try {
  let data = req.body.data || req.body;

  let userId = req.body.userInfos.userID;
  let attachement = req.body.userInfos.attachement;

  let params = [
            {
                name:"id",
                type: TYPES.Int,
                value: data.id || 0
            },
            {
                name:"src",
                type: TYPES.NVarChar,
                value: data.src || "tag"
            },
            {
                name:"user",
                type: TYPES.Int,
                value: userId 
            },
            {
                name:"point_attachement",
                type: TYPES.Int,
                value: attachement
            }

   ]
  
   let response = await ssm.execProc('trcStatus_List', params)
  
   res.status(response.status).json(response)
    }catch (e) {
      loggermodule.error(`Error displaying list :` + e.message);
      res.status(500).json({ success: false, res: e.message });
    }
   
}

exports.get = async (req, res)=> {
try {
  let data = req.body.data || req.body;

  let userId = req.body.userInfos.userID;
  let attachement = req.body.userInfos.attachement;

   let params = [
       {
           name:"id",
           type: TYPES.Int,
           value: data.id || 0
       },
       {
        name:"user",
        type: TYPES.Int,
        value: userId 
    },
    {
        name:"point_attachement",
        type: TYPES.Int,
        value: attachement
    }
      
   ]

   let response = await ssm.execProc('status_get', params)
         
   res.status(200).json(response)
}catch (e) {
  loggermodule.error(`Error displaying list :` + e.message);
  res.status(500).json({ success: false, res: e.message });
}
}

exports.save = async (req, res)=>{
try {

  let data = req.body.data || req.body;

  let userId = req.body.userInfos.userID;
  let attachement = req.body.userInfos.attachement;


    console.log('boddy:', data)
    if(data.id === undefined || data.name == undefined) {
       res.status(401).json({error: "name can't be null !!!"})
       return
    }

    let params = [
        {
            name : "id",
            type: TYPES.Int,
            value: data.id 
        },
        {
            name : "name",
            type: TYPES.NVarChar,
            value: data.name 
        },
        {
            name : "label",
            type: TYPES.NVarChar,
            value: data.label || ""
        },
        {
            name : "typeId",
            type: TYPES.Int,
            value: data.typeId || 0
        },
        {
            name : "iconId",
            type: TYPES.Int,
            value: data.iconId || 0
        },
        {
            name : "icon",
            type: TYPES.NVarChar,
            value: data.icon || 'fas fa-border-none'
        },
        {
            name : "color",
            type: TYPES.NVarChar,
            value: data.color || '#fff'
        },
        {
            name : "backgroundColor",
            type: TYPES.NVarChar,
            value: data.backgroundColor || '#000',
        },
        {
            name : "active",
            type: TYPES.Int,
            value: data.active || 1
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
        {
            name : "BGID",
            type: TYPES.Int,
            value: data.bgid || 0
        },
     
    ]

    let response = await ssm.execProc('trcStatus_save',params)
   
    res.status(response.status).json(response)
}catch (e) {
  loggermodule.error(`Error displaying list :` + e.message);
  res.status(500).json({ success: false, res: e.message });
}
}

exports.remove = async (req, res)=> {
try {
  let data = req.body.data || req.body;

  let userId = req.body.userInfos.userID;
  let attachement = req.body.userInfos.attachement;
 
    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id || 0
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
 
    let response = await ssm.execProc('status_remove', params)
          
    res.status(200).json(response)
}catch (e) {
  loggermodule.error(`Error displaying list :` + e.message);
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
            name:"id",
            type: TYPES.Int,
            value: data.id
        },
        {
            name:"active",
            type: TYPES.Int,
            value: data.active 
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
 
    let response = await ssm.execProc('status_activate', params)
          
    res.status(200).json(response)
}catch (e) {
  loggermodule.error(`Error displaying list :` + e.message);
  res.status(500).json({ success: false, res: e.message });
}
}


exports.transitions = async (req, res)=> {
    try {
        let response = await fetchStatusTransitions(req)
        onResult(res , response)
    }catch (e) {
        loggermodule.error(`Error displaying list :` + e.message);
        onException(e , res)
    }
}