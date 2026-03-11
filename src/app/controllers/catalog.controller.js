const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")

exports.list = async (req, res)=> {
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
   ]
  
   response = await ssm.execProc('cdu_list', params)
  
   res.status(response.status).json(response)
           
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End catalog list')
    else loggermodule.error(`Error catalog list :`+response.response)
    return response
  }
}

exports.get = async (req, res)=> {
    let response = {} 
try {
   let data = req.body
   let configs = req?.configs || {}

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

   response = await ssm.execProc('Cdu_get', params)
         
   res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End catalog get')
    else loggermodule.error(`Error catalog get :`+response.response)
    return response
  }
}


exports.save = async (req, res)=>{
    let response = {} 
try {
    let data = req.body ; 
    data.image = data.image || ''
    if(data.id === undefined || data.name == undefined) {
       res.status(401).json({error: "name can't be null !!!"})
       return
    }
    
    res.status(200).json(data)
    return
    let params = [
        {
            name : "id",
            type: TYPES.Int,
            value: data.id || 0
        },
        {
            name : "reference",
            type: TYPES.NVarChar,
            value: data.reference
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
            name : "codebarre",
            type: TYPES.NVarChar,
            value: data.codebarre
        },
        {
            name : "typeid",
            type: TYPES.Int,
            value: data.typeid
        },
        {
            name : "family",
            type: TYPES.Int,
            value: data.family
        },
        {
            name : "typemode",
            type: TYPES.Int,
            value: data.typemode
        },
        {
            name : "src",
            type: TYPES.NVarChar,
            value: data.src || 'company'
        },
        {
            name : "srcID",
            type: TYPES.Int,
            value: data.srcID || 1
        },
        {
            name : "user",
            type: TYPES.Int,
            value: data.user  || 1
        },
        {
            name : "point_attachement",
            type: TYPES.Int,
            value: data.ratachement || 1
        },
        {
            name : "BGID",
            type: TYPES.Int,
            value: data.bgid || 0
        }
     
    ]

    response = await ssm.execProc('Cdu_save',params)
    let resp = response.result
    if(resp != undefined && resp?.length > 0) {
        if(data.image.indexOf('base64') != -1) {
            let fileRes = await saveFileFunc({
                file: data.image , 
                id: data.imageid || 0,
                path: "catalog/"+resp[0].id,
                src: "catalog",
                srcID: resp[0].id,
                desc: "profile"
            }, req)

        }
    }
  
    res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End catalog save')
    else loggermodule.error(`Error catalog save :`+response.response)
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
 
    response = await ssm.execProc('Cdu_remove', params)
          
    res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End catalog save')
    else loggermodule.error(`Error catalog save :`+response.response)
    return response
  }
}
