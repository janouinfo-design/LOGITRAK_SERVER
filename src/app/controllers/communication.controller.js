const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")
const firebasemodule = require('@omniyat/firebasemodule')

exports.mainList = async (req, res)=>{
    try {
      let data = req.body.data || req.body;

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
    let response = await ssm.execProc('COM_getMainList',params)
    loggermodule.info('End displaying list')
    res.status(response.status).json(response)
}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}


exports.list = async (req, res)=>{
  try {

  let data = req.body.data || req.body;
  let userId = req.body.userInfos.userID;
  let attachement = req.body.userInfos.attachement;

  let params = [
    {
      name: "srcId",
      type: TYPES.Int,
      value: data.srcId || 0,
    },
    {
      name: "srcObject",
      type: TYPES.NVarChar,
      value: data.srcObject || "",
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
  ];

  let response = await ssm.execProc('COM_getChat',params)
  loggermodule.info('End displaying list')
  res.status(response.status).json(response)
}catch(e){
loggermodule.error(`Error displaying list :`+ e.message)
res.status(500).json({ success:false, res : e.message });
}
}


exports.save = async (req, res)=>{
  try {
    let data = req.body.data || req.body;
    let userId = req.body.userInfos?.userID || 0;
    let attachement = req.body.userInfos?.attachement || 0;
    
    console.log('saving chat')
    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
      },
      {
        name: "subject",
        type: TYPES.NVarChar,
        value: data.subject || "",
      },
      {
        name: "message",
        type: TYPES.NVarChar,
        value: data.message || "",
      },
      {
        name: "to",
        type: TYPES.NVarChar,
        value: data.to || "",
      },
      {
        name: "from",
        type: TYPES.NVarChar,
        value: data.from || "",
      },
      {
        name: "type",
        type: TYPES.NVarChar,
        value: data.type || "",
      },
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
        name: "point_attachement",
        type: TYPES.Int,
        value: attachement,
      },
      {
        name: "user",
        type: TYPES.Int,
        value: userId,
      }
    ];

    let response = await ssm.execProc('com_SaveChat',params)
    if(response){
      for(let key in data){
        data[key] = data[key].toString();
      }
      firebasemodule.sendMessage({
        data: { message: data?.message , detail: JSON.stringify(data)},
        notification : {
          title: `Nouveau message - ${data.src} [${data?.Object || data.srcId}]`,
          body: data.message,
        },
        topic:"chat-notification-topic",
        // tokens: ["cZazLwJ_QdSbxiiHui0lZY:APA91bGB-q9DWZ4h1B4qFME4p9KzUqXUs3CFzCNOVAzQDoTwaqLlB1KD9xq0i7d4uPJIAPZkohR64m1PAcbgQfbiohJ-ARYr6wp5Em-BLjv40USPXOIR4zc"]
      }).then(res => {
        console.log('notification sent res:', res)
      }).catch(err => {
        console.log('notification sent err:', err)
      })
    }
    loggermodule.info('End saving Chat')
    res.status(response.status).json(response)
  }catch(e){
      loggermodule.error(`Error saving Chat :`+ e.message)
      res.status(500).json({ success:false, res : e.message });
  }
}


exports.isRead = async (req, res)=>{
  try {

    let data = req.body.data || req.body;
    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;


    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
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

  let response = await ssm.execProc('com_isRead',params)
  loggermodule.info('End isRead action')
  res.status(response.status).json(response)
}catch(e){
loggermodule.error(`Error isRead action :`+ e.message)
res.status(500).json({ success:false, res : e.message });
}
}




exports.isReadAll = async (req, res)=>{
  try {

    let data = req.body.data || req.body;
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

  let response = await ssm.execProc('com_isReadAll',params)
  loggermodule.info('End isReadAll action')
  res.status(response.status).json(response)
}catch(e){
loggermodule.error(`Error isReadAll action :`+ e.message)
res.status(500).json({ success:false, res : e.message });
}
}