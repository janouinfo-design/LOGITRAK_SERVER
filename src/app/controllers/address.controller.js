const ssm = require("../../apis/sql-server-request");
const { TYPES } = require("tedious");
const iomodule = require("#modules/iomodule.js");
const loggermodule = require("#modules/loggermodule.js");



exports.list = async (req, res)=> {
try {
   let data = req.body

   let params = [
        {
            name:"src",
            type: TYPES.NVarChar,
            value: data.src
        },
        {
            name:"srcID",
            type: TYPES.Int,
            value: data.srcID
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

   
   let response = await ssm.execProc('address_list', params)

   console.log('response',response);

   loggermodule.info('End displaying list')
   res.status(response.status).json(response)
}
catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
}

exports.get = async (req, res)=> {
    response = {}
    let response = {} 
try {
   let data = req.body

   let params = [
       {
           name:"id",
           type: TYPES.Int,
           value: data.id || 0
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

   response = await ssm.execProc('address_get', params)
         
   res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End address get')
    else loggermodule.error(`Error  address get :`+response.response)
    return response
  }
 
}

exports.get_default = async (req, res)=> {
    let response = {} 
try {
    let data = req.body
 
    let params = [
        {
            name:"src",
            type: TYPES.NVarChar,
            value: data.src
        },
        {
            name:"srcID",
            type: TYPES.Int,
            value: data.srcID
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
 
    response = await ssm.execProc('address_getDefault', params)
          
    res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End address getDefault')
    else loggermodule.error(`Error  address getDefault :`+response.response)
    return response
  }
}


exports.save = async (req, res)=>{
    let response = {}
    try {

    let data = req.body.data;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;


    if(data.id === undefined || data.name == undefined) {
       res.status(401).json({error: "name can't be null !!!"})
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
            name : "contact",
            type: TYPES.NVarChar,
            value: data.contact || ""
        },
        {
            name : "floor",
            type: TYPES.NVarChar,
            value: data.floor || ""
        },
        {
            name : "addressNumber",
            type: TYPES.NVarChar,
            value: data.addressNumber || ""
        },
        {
            name : "sublocality",
            type: TYPES.NVarChar,
            value: data.sublocality || ""
        },
        {
            name : "address",
            type: TYPES.NVarChar,
            value: data.address || ""
        },
        {
            name : "zipcode",
            type: TYPES.NVarChar,
            value: data.zipcode || ""
        },
        {
            name : "town",
            type: TYPES.NVarChar,
            value: data.town || ""
        },
        {
            name : "city",
            type: TYPES.NVarChar,
            value: data.city || ""
        },
        {
            name : "country",
            type: TYPES.NVarChar,
            value: data.country || ""
        },
        {
            name : "cellphone",
            type: TYPES.NVarChar,
            value: data.cellphone || ""
        },
        {
            name : "phone",
            type: TYPES.NVarChar,
            value: data.phone || ""
        },
        {
            name : "email",
            type: TYPES.NVarChar,
            value: data.email || ""
        },
        {
            name : "fax",
            type: TYPES.NVarChar,
            value: data.fax || ""
        },
        {
            name : "lat",
            type: TYPES.NVarChar,
            value: data.lat || ""
        },
        {
            name : "lng",
            type: TYPES.NVarChar,
            value: data.lng || ""
        },
        {
            name : "instruction",
            type: TYPES.NVarChar,
            value: data.instruction || ""
        },
        {
            name : "isDefault",
            type: TYPES.Int,
            value: data.isDefault || 0
        },
        {
            name : "src",
            type: TYPES.NVarChar,
            value: data.src || ""
        },
        {
            name : "srcID",
            type: TYPES.Int,
            value: data.srcID || 0
        },
        {
            name: "point_attachement",
            type: TYPES.Int,
            value: attachement || 1,
          },
          {
            name: "user",
            type: TYPES.Int,
            value: userId || 1,
          },
    ]

    response = await ssm.execProc('address_save',params)
   
    res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End address save')
    else loggermodule.error(`Error  address save :`+response.response)
    return response
  }
    
}

exports.remove = async (req, res)=> {
    let response = {} 
try {

    let data = req.body
 
    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id || 0
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
 
    response = await ssm.execProc('address_remove', params)
          
    res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End address remove')
    else loggermodule.error(`Error  address remove :`+response.response)
    return response
  }
    
}



exports.save_default = async (req, res)=> {
    let response = {} 
try {
 
    let data = req.body
 
    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id
        },
        {
            name:"src",
            type: TYPES.NVarChar,
            value: data.src
        },
        {
            name:"srcID",
            type: TYPES.Int,
            value: data.srcID
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
 
    response = await ssm.execProc('address_saveDefault', params)
          
    res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End address saveDefault')
    else loggermodule.error(`Error  address saveDefault :`+response.response)
    return response
  }
    
}
