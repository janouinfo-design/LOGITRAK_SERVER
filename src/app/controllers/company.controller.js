const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const fileLib = require('../../libs/files.lib')
const { saveFileFunc } = require('../controllers/file.controller')
const loggermodule = require("#modules/loggermodule.js")
exports.list = async (req , res)=>{
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

    let response  = await ssm.execProc("company_list",params);
    loggermodule.info('End displaying list')
    res.status(200).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}

exports.get = async (req, res) =>{
  
try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;


    let params = [{ 
        name:"id",
        type: TYPES.Int,
        value: data.id
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
      },]

    let response  = await ssm.execProc("company_get", params);
    loggermodule.info('End displaying list')
    res.status(200).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}

exports.save = async (req, res) =>{
try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;
    
    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: 1
        },
        {
            name:"label",
            type: TYPES.NVarChar,
            value: data.label
        },
        {
            name:"code",
            type: TYPES.NVarChar,
            value: data.code
        },
       
        {
            name:"currencyId",
            type: TYPES.Int,
            value: data.currencyId
        },
        {
            name:"gpsConfig",
            type: TYPES.NVarChar,
            value: data.gpsConfig
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
       /* {
            name:"logo",
            type: TYPES.NVarChar,
            value: path
        },
        {
            name:"timezoneId",
            type: TYPES.Int,
            value: data.timezone
        },
        {
            name:"startHour",
            type: TYPES.Time,
            value:  null
        },
        {
            name:"endHour",
            type: TYPES.Time,
            value: null
        }, */
    ]

    let response  = await ssm.execProc("company_save" , params );

    let fileRes = await saveFileFunc({
        file: data.logo , 
        id:11,
        path: "company/1",
        src: "company",
        srcID: 1,
        desc: "logo"
    }, req)
    console.log('fileRes:', fileRes)
    loggermodule.info('End displaying list')
    res.status(201).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}

exports.save2 = async (req, res) =>{

try {

    let data = req.body.data || req.body;

    
    console.log('query:', req.query.data)
    data = JSON.parse(req.query.data)
    console.log('dataa00000:', data)
   
    
    //res.status(200).json('000000')
   // return
   // console.log('data:', data)
    let path = '';

    if(data.logo != '' && data.logo?.indexOf('base64') != -1){
        path = await fileLib.saveBase64({data: data.logo , path: "company"});
        path = req.protocol+'://'+req.hostname+':4600/docs/'+path
    }

    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: 0
        },
        {
            name:"label",
            type: TYPES.NVarChar,
            value: data.label
        },
        {
            name:"code",
            type: TYPES.NVarChar,
            value: data.code
        },
        {
            name:"logo",
            type: TYPES.NVarChar,
            value: path
        },
        {
            name:"currencyId",
            type: TYPES.Int,
            value: data.currencyId
        },
        {
            name:"timezoneId",
            type: TYPES.Int,
            value: data.timezone
        },
        {
            name:"startHour",
            type: TYPES.Time,
            value:  null
        },
        {
            name:"endHour",
            type: TYPES.Time,
            value: null
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

    let response  = await ssm.execProc("company_save" , params , "I");
    loggermodule.info('End displaying list')
    res.status(200).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}


exports.saveSetup = async (req,res) =>{
try {
    let data = req.body
    console.log("body", data)
    let response = await ssm.execProc('companySaveSetup',data)
    loggermodule.info('End displaying list')
    res.status(response.status).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}