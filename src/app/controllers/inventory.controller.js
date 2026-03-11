const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const loggermodule = require("#modules/loggermodule.js")
exports.list = async (req, res)=> {
    try {

      let data = req.body.data || req.body;

      let userId = req.body.userInfos.userID;
      let attachement = req.body.userInfos.attachement;

      let params = [
        {
            name:"dateFrom",
            type: TYPES.Date,
            value: data.dateFrom
        }, 
        {
            name:"dateTo",
            type: TYPES.Date,
            value: data.dateTo
        },
        {
          name:"worksiteId",
          type: TYPES.NVarChar,
          value: data.worksiteId || ""
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

      let response = await ssm.execProc('Inventory_List',params)

      console.log('response result',response)

      if (Array.isArray(response.result)) {
      response.result.forEach(inv => {
        if(typeof inv.jsonResult == "string") {
            inv.jsonResult = JSON.parse(inv.jsonResult);
        }
      }); 
       } else {
        console.error('response.result is not defined or not an array');
      }

      console.log('inventory list well displayed')

      res.status(response.status).json(response)

    }catch(e){
      loggermodule.error(`Error enventory list :`+ e.message)
      res.status(500).json({ success:false, res : e.message });
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

   response = await ssm.execProc('Inventory_Get', params)

   response.result.forEach(inv => {
    if(typeof inv.jsonResult == "string") {
       inv.jsonResult = JSON.parse(inv.jsonResult);
    }
   }); 
         
   res.status(response.status).json(response)
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End inventory get')
    else loggermodule.error(`Error inventory get :`+response.response)
    return response
  }
}
 

exports.save = async (req, res)=>{
try {

    console.log("start saving ok?");

    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    console.log('boddy:', data)

    if(data.id === undefined) {
       res.status(401).json({error: "name can't be null !!!"})
       return
    }


    console.log('info 1 : ',data.info)

    console.log('info 2 : ',JSON.stringify(data.info))

    let params = [
        {
            name : "id",
            type: TYPES.Int,
            value: data.id || 0
        },
        {
            name : "typeId",
            type: TYPES.Int,
            value: data.typeId || 0
        },
        {
          name : "locationObject",
          type: TYPES.NVarChar,
          value: data.locationObject || ""
        },
        {
          name : "scanAuth",
          type: TYPES.NVarChar,
          value: JSON.stringify(data.scanAuth || []) || ""
        },
        {
        name : "depositId",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.depositId || []) || ""
        },
        {
        name : "worksiteId",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.worksiteId || []) || ""
        },
        {
            name : "info",
            type: TYPES.NVarChar,
            value: JSON.stringify(data.info || []) || ""
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

    console.log('id :',data.id)
    console.log('worksiteId : ',data.worksiteId)
    console.log('depositId : ',data.depositId)
    console.log('info : ',data.info)
    console.log('scan Auth : ',data.scanAuth)

    let response = await ssm.execProc('inventory_save',params)
   
    loggermodule.info('End saving inventory')
    res.status(response.status).json(response)  
}catch(e){
  loggermodule.error(`Error saving inventory :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
  }
 
}

exports.details = async(req,res) => {
    let response = {} 
try {
    let data = req.body;

    console.log('boddy : ',data);

    if(data.id === undefined) {
        res.status(401).json({error:"id can't be null"});
        return;
    }

    let params = [
        {
            name : "id",
            type: TYPES.Int,
            value: data.id
        },
        {
            name : "type",
            type: TYPES.NVarChar,
            value: data.type
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

    response = await ssm.execProc('inventory_details',params);
    res.status(response.status).json(response);
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End inventory details')
    else loggermodule.error(`Error inventory details :`+response.response)
    return response
  }
}

exports.close = async(req,res) => {
    let response = {} 
try {
    let data = req.body;
    console.log('body : ',data);

    if(data.id === undefined) {
        res.status(401).json({error:"id can't be null"});
        return;
    }

    let params = [
        {
            name : "id",
            type: TYPES.BigInt,
            value:data.id
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

    response = await ssm.execProc('inventory_close',params);
    res.status(response.status).json(response);
}catch(e){
    response.response = e.message
  }
  finally {
    if(response.success)
      loggermodule.info('End inventory close')
    else loggermodule.error(`Error inventory close :`+response.response)
    return response
  }

}


exports.remove = async (req, res)=>{
  try {

    let data = req.body.data || req.body;
    
    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
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

  let response = await ssm.execProc('inventory_remove',params)
  loggermodule.info('End inventory remove action')
  res.status(response.status).json(response)
}catch(e){
loggermodule.error(`Error inventory remove action :`+ e.message)
res.status(500).json({ success:false, res : e.message });
}
}


exports.byStatus = async(req,res) => {
    let response = {} 
try {
    let data = req.body;
    console.log('body : ', data);

    if(data.status === undefined) {
        res.status(401).json({error:"status can't be null"});
        return;
    }

    let params = [
        {
            name:"status",
            type: TYPES.NVarChar,
            value: data.status
        },
        {
          name:"worksiteId",
          type: TYPES.NVarChar,
          value: data.worksiteId || ""
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

    response = await ssm.execProc('Inventory_byStatus',params);


    console.log('response : ',response);
    
    if (Array.isArray(response.result)) {
      response.result.forEach(inv => {
        if(typeof inv.worksite == "string" && typeof inv.deposit == "string" && typeof inv.authScan == "string") {
            inv.worksite = JSON.parse(inv.worksite);
            inv.deposit = JSON.parse(inv.deposit);
            inv.authScan = JSON.parse(inv.authScan);
        }
      }); 
       } else {
        console.error('response.result is not defined or not an array');
      }

      console.log('inventory by status well displayed')


    res.status(response.status).json(response);
}catch(e){
  loggermodule.error(`Error enventory by status :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
  }
 

}

exports.scan = async(req,res) => {
    let response = {} 
try {
    let data = req.body
    console.log('body : ',data);

    if(data.orderId === undefined || data.scan == undefined) {
        res.status(401).json({error: "informations can't be null"})
        return
     }

     let params = [
        {
            name: "orderId",
            type: TYPES.BigInt,
            value: data.orderId
        },
        {
            name: "scan",
            type: TYPES.NVarChar,
            value: data.scan
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

     response = await ssm.execProc('Inventory_Scan',params);
     res.status(response.status).json(response);
    }catch(e){
        response.response = e.message
      }
      finally {
        //console.log('respose:', response)
        if(response.success)
          loggermodule.info('End inventory scan')
        else loggermodule.error(`Error inventory scan :`+response.response)
        return response
      }
}


exports.multiscan = async(req,res) => {
try {
    console.log('test');
    let data = req.body

    console.log('dataaaa : ',data.scan)
    loggermodule.info('multiscan tags : ' + JSON.stringify(data.scan));

    let stringData = '[{"macAddrr":"BC57290288E7","idInvo": 30324},{"macAddrr":"BC57290314C5","idInvo": 30324}]';

    let parsedData = data.scan

    //parsedData = JSON.parse(parsedData);
    
    console.log('parsed data : ',parsedData)

    const scanMAC = parsedData.map(item => item.macAddr).join(';');

    console.log('MAC data : ',scanMAC)

    if(data.orderId === undefined || data.scan == undefined) {
        res.status(401).json({error: "informations can't be null"})
        return
     }

     let params = [
        {
            name: "orderId",
            type: TYPES.BigInt,
            value: data.orderId
        },
        {
            name: "scan",
            type: TYPES.NVarChar,
            value: scanMAC
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

     let response = await ssm.execProc('inventory_multiScan',params);

     loggermodule.info('End inventory multiscan')

     res.status(response.status).json(response);
 
}
 
    catch(e){
      loggermodule.error(`Error inventory multiscan :`+ e.message)
      res.status(500).json({ success:false, res : e.message });
    }
}  
