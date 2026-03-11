const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")

exports.list = async (req, res)=> {
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
   let response = await ssm.execProc('customer_list' , params)
   loggermodule.info('End displaying list')
   res.status(response.status).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}


exports.get = async (req, res)=> {
try {
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
     
        let response = await ssm.execProc('customer_get', params)
     
        loggermodule.info('End displaying list')      
        res.status(200).json(response)
    }catch(e){
      loggermodule.error(`Error displaying list :`+ e.message)
      res.status(500).json({ success:false, res : e.message });
    }
 
}


exports.save = async (req, res)=>{
try {
    let data = req.body.data || req.body ; 
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
            value: data.label
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

    let response = await ssm.execProc('customer_save',params)
    loggermodule.info('End displaying list')   
    res.status(response.status).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}


exports.remove = async (req, res)=> {
try {
    let data = req.body.data || req.body
    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;
 
    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id || 0
        },
        {
          name:"lang",
          type: TYPES.NVarChar,
          value: data.lang || "fr"
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
 
    let response = await ssm.execProc('Customer_remove', params)
    loggermodule.info('End displaying list')   
    res.status(200).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}


exports.removeWithWorksite = async (req, res)=> {
  try {
      let data = req.body.data || req.body
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
   
      let response = await ssm.execProc('Customer_removeWithWorksite', params)
      loggermodule.info('End displaying list')   
      res.status(200).json(response)
  }catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
  }