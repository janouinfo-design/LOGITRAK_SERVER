const ssm = require("../../apis/sql-server-request");
const { TYPES } = require("tedious");
const loggermodule = require("#modules/loggermodule.js");
const _ = require("lodash");
const { getHistoriesFromFlespi } = require("../../services/flespi.Service");
const { onException, onResult } = require("#utils/error.utl.js");
const { getFilesnameFromDirectory } = require("#utils/file.utl.js");

const path = require("path");
const { env } = require("../../configs");

exports.save = async (req, res) => {
  try{
    let data = req.body;

    let params = [
      {
        name: "info",
        type: TYPES.NVarChar,
        value: data.info || "",
      },
    ];

  let response = await ssm.execProc("LOGS_SAVE", params);

  loggermodule.info('End saving logs')
  res.status(response.status).json(response);

}catch(e){
  loggermodule.error(`Error saving logs :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
};

exports.list = async (req, res) => {
  try {
    let data = req.body;
    let filters = req.body.data
    if(!_.isPlainObject(filters)) filters = {}
    loggermodule.info("Start logs list");

    
    let _params = [
      {
        name: "maxSecond",
        type: TYPES.Int,
        value: data.maxSecond || 0,
      },
      {
        name: "begDate",
        type: TYPES.NVarChar,
        value: data.begDate|| "",
      },
      {
        name: "endDate",
        type: TYPES.NVarChar,
        value: data.endDate || "",
      },
      {
        name: "userFilter",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.userFilter || []),
      }
    ];

    console.log('filters:', filters)
    // build flespi params
    let params = {
      from: filters.begDate|| "",
      to: filters.endDate || "",
      userID: (filters.userFilter || []).map( u =>  u.userId || u),
      reverse: filters.reverse || false,
      limit: filters.limit || "",
      enginId: (filters.enginId || []).map( o =>  o.id || o),
      deviceType: (filters.deviceType || []).map( o =>  o.deviceType || o)
    }

    delete filters.begDate
    delete filters.endDate
    delete filters.userFilter
    delete filters.enginId
    delete filters.deviceType
    delete filters.limit
  
     

    // params = {...filters , ...params}

    // send histories request
    let response = await getHistoriesFromFlespi(params) //await ssm.execProc("beaconLogs_list", params);

    

    loggermodule.info("End logs list");
    res.json(response);
  } catch (e) {
    loggermodule.error(`Error saving logs :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.applogs = async (req, res)=>{
   try{
    let dir = path.join(process.cwd() , 'logs')
    getFilesnameFromDirectory(dir).then(files =>{
        let html = `
          <div  style="display: flex ; flex-direction: column ; gap: 7px; margin: 2rem;">
             ${files.map( file => `<a style="width: fit-content" target='_blank' href="${env.PROXY_APPNAME ? '/'+env.PROXY_APPNAME: ''}/applogs/${file.name}">${file.name}(${file.size} ${file.unit}) #${file.modifiedAt}</a>`).join('')}
          </div>
        `
        res.send(html)
    })
   }catch(e){
    onException(e , res)
   }
}