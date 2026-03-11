const ssm = require("../../apis/sql-server-request");
const { TYPES } = require("tedious");
const loggermodule = require("#modules/loggermodule.js")
/** test */

exports.list = async (req, res)=> {
try {
  let data = req.body.data || req.body;

  let userId = req.body.userInfos.userID;
  let attachement = req.body.userInfos.attachement;

   let params = [
    {
        name:"IDCustomer",
        type: TYPES.Int,
        value: data.IDCustomer || 0
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
  
   let response = await ssm.execProc('deposit_list', params)
   loggermodule.info('End displaying list')
   res.status(response.status).json(response)
    
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}

exports.get = async (req, res)=> {
try {
   let data = req.body.data || req.body
   let userId = req.body.userInfos.userID;
   let attachement = req.body.userInfos.attachement;


   console.log('body:', req.body)
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
   console.log('params:', params)

   let response = await ssm.execProc('deposit_get', params)
   loggermodule.info('End displaying list')
   res.status(200).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
 
}

exports.save = async (req, res)=>{
    try{
        let data = req.body.data  || req.body;

        let userId = req.body.userInfos.userID;
        let attachement = req.body.userInfos.attachement;


       if(data.id === undefined || data.name == undefined) {
            res.status(404).json({error: "name can't be null !!!"})
            return
        }

        let params = [
            {
                name : "id",
                type: TYPES.Int,
                value: data.id || 0
            },
            {
                name : "name",
                type: TYPES.NVarChar,
                value: data.name || ""
            },
            {
              name : "label",
              type: TYPES.NVarChar,
              value: data.label || ""
            },
            {
              name : "customerID",
              type: TYPES.Int,
              value: data.customerID || 0
            },
            {
                name : "active",
                type: TYPES.Int,
                value: data.active || 0
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

        let response = await ssm.execProc('deposit_save',params)
        loggermodule.info('End displaying list')
        res.status(response.status).json(response)
    }catch(e){
      loggermodule.error(`Error displaying list :`+ e.message)
      res.status(500).json({ success:false, res : e.message });
    }
}

exports.remove = async (req, res)=> {
    try{
        let data = req.body.data || req.body ; 
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
 
    let response = await ssm.execProc('deposit_remove', params)
    loggermodule.info('End displaying list')      
    res.status(200).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
  
}

exports.activate = async (req, res)=> {
try {

    let data = req.body.data || req.body ; 
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
 
    let response = await ssm.execProc('deposit_activate', params)
    loggermodule.info('End displaying list')    
    res.status(200).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}