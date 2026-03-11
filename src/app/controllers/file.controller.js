const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const fileLib = require('../../libs/files.lib')
const loggermodule = require("#modules/loggermodule.js")

const { base64Uploder } = require('../../utils/file.utl')

exports.save = async (req, res)=>{
try {
    console.log('file save');
    let data = req.body.data || req.body;
    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    /*let userId = req.body.userInfos.userID;
    //let attachement = req.body.userInfos.attachement;
    
        let path = '';
        response = {success: false}
  
        if(data.file != '' && data.file.indexOf('base64') != -1)
       // {
        path = await fileLib.saveBase64({data: data.file , path: data.path});
        path = "https"+'://'+req.headers.host+'/docs/'+path*/
        
        let params = [
            {
                name:"id",
                type: TYPES.Int,
                value: data.id || 0
            },
            {
                name:"path",
                type: TYPES.NVarChar,
                value: data.path || ""
            },
            {
                name:"src",
                type: TYPES.NVarChar,
                value: data.src || ""
            },
            {
                name:"srcID",
                type: TYPES.Int,
                value: data.srcID || 0
            },
            {
                name:"desc",
                type: TYPES.NVarChar,
                value: data.desc || ""
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


        let response =  await ssm.execProc("file_save" , params );
    //}
    
    res.status(201).json(response)
    /*if(data.logo != '' && data.logo.indexOf('base64') != -1){
        path = await fileLib.saveBase64({data: data.logo , path: "company"});
        path = req.protocol+'://'+req.hostname+':4600/docs/'+path
    }*/
}catch(e){
    loggermodule.error(`Error saving file :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
  };

exports.saveFileFunc = async (data, req)=>{
    let response = {} 
try {
    let path = '';
    response = {success: false}
  
    if(data.file != '' && data.file.indexOf('base64') != -1){
        path = await fileLib.saveBase64({data: data.file , path: data.path});
        path = "https"+'://'+req.headers.host+'/docs/'+path
        let params = [
            {
                name:"id",
                type: TYPES.Int,
                value: data.id
            },
            {
                name:"path",
                type: TYPES.NVarChar,
                value: path
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
                name:"desc",
                type: TYPES.NVarChar,
                value: data.desc
            },
        ]
        response =  await ssm.execProc("file_save" , params );
    }
    console.log('dataaaa:', data.path)
    
    return response

}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End file saveFileFunc')
    else loggermodule.error(`Error file saveFileFunc :`+response.response)
    return response
  }
}


exports.upload = async (req , res)=> {
    try{
        let finalePath = null
        console.log('body upload:', req.body)
        if(req.body.base64){
             let image = await base64Uploder(req.body.base64 , {
                fpath: req.query.path,
                filename: req.query.name
             })
             console.log('image:', image)
             if(image.success){
                finalePath = image.filename
             }
        }else if(req.file){
            finalePath = req.file.filename
        }
        res.json({success: true , result: finalePath})
    }catch(e){
        res.json({success: false , result: e.message})
    } 
}