let ssm = require("../../apis/sql-server-request");
let loggermodule = require("#modules/loggermodule.js");
let _ = require('lodash')
let moment = require('moment')
const { getHistoriesFromFlespi } = require("#modules/flespi/flespi.service.js");
const { TYPES } = require("tedious");
const { default: axios } = require("axios");
const { DASHBOARD_INFOS, ENGIN_DASHBOARD_PROCS } = require("./grafanaData");
let { GRAFANA_BASEURI , GRAFANA_TOKEN} = process.env
async function getEnginsUidAndReference(){
    try{
        let sql = "SELECT uid , reference FROM VW_Engin_List WHERE tagname!= '' and reference != '' and sysActive=1";
        let result = await ssm.execSql(sql);
        if(!Array.isArray(result?.result)) {
          loggermodule.error('Error getting engins references:'+JSON.stringify(result))
          result = []
        }else{
          result = result?.result
        }
        return result
    }catch(e){
      loggermodule.error('Error getEnginsUidAndReference:'+e.message)
      return []
    }
}

async function getEnginsLastSeenFromFlespi(enginIds){
    let response = [];
    let allData = []
    let fetchTo = null
    let notPresent = enginIds
    try{
      if(!enginIds){
        enginIds = await getEnginsUidAndReference();
        if(Array.isArray(enginIds)) enginIds = enginIds.map(({uid})=> +uid)
        else enginIds = []
      }
      enginIds = enginIds.map(o =>+o)
      if(Array.isArray(enginIds)){
        let flepiData = await getHistoriesFromFlespi({
          enginId:enginIds,
          limit: 60000,
          reverse: 1,
          fields: 'enginId,engin,lat,lng,deviceType,deviceId,dateFormated,LocationID,locationName,address,isFakeLocation'
        })
        if(!Array.isArray(response)){  
          loggermodule.error('Error getEnginsLastSeenFromFlespi:'+JSON.stringify(response))
        }else{
          response = flepiData.response;
          allData = [...flepiData.response]
          fetchTo = response[response.length - 1]?.dateFormated
          response = _.uniqBy(response , e => +e.enginId)
          notPresent = getItemsNotInArray(response , enginIds , 'enginId')
          loggermodule.info('NOT PRESENT ENGINS:'+notPresent)
        }
      }
    }catch(e){
      loggermodule.info("Error in getEnginsLastSeenFromFlespi:"+e.message)
    }
  
    return {response , enginIds , fetchTo , allData , notPresent}
}

async function setEnginsLastSeenFromFlespi(lastSeens){
    try{
        if(!lastSeens){
            lastSeens = await getEnginsLastSeenFromFlespi();
            loggermodule.info(`LAST LOCATIONS FLESPI DATA-ask for (${lastSeens.enginIds?.length})-get (${lastSeens.response?.length})} - fetch to ${lastSeens.fetchTo}`)
            loggermodule.info(`LAST LOCATIONS FLESPI DATA:${JSON.stringify(lastSeens.response)}`)
        }

        if(!Array.isArray(lastSeens.response) || lastSeens.response?.length == 0){
            loggermodule.info('NO LAST SEEN FOUND');
            return
        }
 
        let group = _.groupBy( lastSeens.response , o => o.dateFormated+'#'+o.lat+'#'+o.lng);
        let queries = []
        for( let [k,v] of Object.entries(group)){
            let dataObj = v?.[0]
            if(!dataObj) continue
            let ids = v.map(o => o.enginId)
            let sql = `
                    UPDATE Engin 
                    SET lastSeenAt = '${moment(dataObj.dateFormated).format("YYYY-MM-DD HH:mm:ss")}',
                        last_lat=${dataObj?.lat} , last_lng=${dataObj?.lng},
                        lastSeenAddress='${(dataObj?.address || "").toString().replace(/'/g, ".")}'
                    WHERE uid in (${ids.join(",")})
            `
            queries.push(sql)
        }
        if(queries.length > 0){
            queries = queries.join(";")
            loggermodule.info('START ENGIN LAST SEEN UPDATE FROM FLESPI QUERY')
            await ssm.execSql(queries).then(r =>{
                loggermodule.info('END ENGIN LAST SEEN UPDATE FROM FLESPI QUERY')
            })
        }
    }catch(e){
        loggermodule.error('Error setLastEnginsLastSeenFromFlespi:'+e.message)
    }
    return lastSeens
}
function getItemsNotInArray(data , sourceIds , key='id'){
    try{
        let allDataIds = data.map(o => isNaN(o[key]) ? o[key] : +o[key]);
        allDataIds = _.uniq(allDataIds);
        return _.difference(sourceIds , allDataIds);
    }catch(e){
        loggermodule.errr('Error in getItemsNotInArray:'+e.message);
        return []
    }
}

async function getPotentialDeliveredHistory(data){
    let { startDate , endDate} = data || {};
    if(!startDate) startDate = moment().subtract(1, 'months').format('YYYY-MM-DD');
    if(!endDate) endDate = moment().format('YYYY-MM-DD');

    console.log('startDate : ', startDate);
    console.log('endDate : ', endDate);
    let params = [
        {
            name: "startDate",
            type: TYPES.NVarChar,
            value: startDate,
        },
        {
            name: "endDate",
            type: TYPES.NVarChar,
            value: endDate,
        }
    ];
    return await ssm.execProc('engin_historyPotDelivered' , params);
}

async function fetchGrafanaDashboards(){
  try{
    loggermodule.info('START fetchGrafanaDashboards:'+moment().format('HH:mm:ss'))
    let dashboard_data = DASHBOARD_INFOS;
    // let dash = await getGrafanaDashboardData(dashboard_data[0].query);
    let response = await Promise.all(dashboard_data.map(async (o) => {
      try{
        let dash = await getGrafanaDashboardData(o.query);
        if(dash?.results){
          let frame = dash.results.A.frames[0];
          let labelIndex = frame.schema.fields.findIndex(o => o.name == 'label');
          let values = frame.data.values;

          let labels = labelIndex != -1 ? values[labelIndex]: values[0];
          let ivals = values[values.length - 1];

          let dt = ivals.map( (o , idx) => ({label: labels[idx] , val: o}))
                        //.filter(t => t.val >= 0)
          labels = dt.map(o => o.label);
          ivals = dt.map(o => o.val);
          dash = {
            labels: labels,
            values: ivals
          }
          return {title: o.title , ...dash};
        }
        return {title: o.title , dash};
      }catch(e){
        loggermodule.error('ERROR fetchGrafanaDashboards:'+e.stack)
        return {title: o.title , error: e.message};
      }
    }))
    loggermodule.info('END fetchGrafanaDashboards:'+ moment().format('HH:mm:ss'))
    return {success: true , response}
  }catch(e){
    loggermodule.error('ERROR fetchGrafanaDashboards:'+e.stack)
    return {success: false , response: e.message}
  }

}

async function fetchEnginDashboardFromProcs(data){
  try{
    loggermodule.info('START fetchEnginDashboardFromProcs:'+moment().format('HH:mm:ss'))
    let procs = ENGIN_DASHBOARD_PROCS;
    let response = await Promise.all(procs.map(async (o) => {
      try{
        let params = [
          {
              name: "startDate",
              type: TYPES.NVarChar,
              value: data.startDate || moment().startOf('month').format('YYYY-MM-DD'),
          },
          {
            name: "endDate",
            type: TYPES.NVarChar,
            value: data.endDate || moment().endOf('month').format('YYYY-MM-DD'),
          },
          {
            name: "enginModel",
            type: TYPES.NVarChar,
            value: data.enginModel || '',
          }
        ]
        let dash = await getOneEnginDashFromProc(o.proc , params);
        if(Array.isArray(dash?.response)){
          dash = {
            labels: dash?.response.map(o => o.label),
            values: dash?.response.map(o => o.value)
          }
          return {code: o?.code , title:o.label , label: o?.title, ...dash}; // {title: o.label , ...dash};
        }
        return {title: o.label , dash};
      }catch(e){
        loggermodule.error('ERROR fetchEnginDashboardFromProcs:'+e.stack)
        return {title: o.title , error: e.message};
      }
    }))
    loggermodule.info('END fetchEnginDashboardFromProcs:'+ moment().format('HH:mm:ss'))
    return {success: true , response}
  }catch(e){
    loggermodule.error('ERROR fetchEnginDashboardFromProcs:'+e.stack)
    return {success: false , response: e.message}
  }
}

async function getOneEnginDashFromProc(procName, params){
  try{
    let response = await ssm.execProc(procName , params);
    return {success: response.success , response: response.result || []};
  }catch(e){
    loggermodule.error('ERROR getOneEnginDashFromProc:'+e.stack)
    return {success: false , response: e.message}
  }
}

async function getGrafanaDashboardData(query){
    let response = await axios({
      url: GRAFANA_BASEURI+'ds/query',
      data: query,
      method: 'post',
      headers: {
        'Authorization': 'Bearer '+GRAFANA_TOKEN
      }
    })

    return response?.data
}

async function fetchEnginCountByLocation(data){
    let params = [
          {
              name: "srcLocation",
              type: TYPES.NVarChar,
              value: data.srcLocation || "",
          },
          {
            name: "date",
            type: TYPES.NVarChar,
            value: data.date || null,
          },
          {
            name: "LastSeenFrom",
            type: TYPES.NVarChar,
            value: data.LastSeenFrom || "",
          },
    ]

    let response = await ssm.execProc('engin_getCountByLocation' , params)
    return { success: true , response: response?.result}
}
module.exports = {
    getEnginsUidAndReference,
    getEnginsLastSeenFromFlespi,
    setEnginsLastSeenFromFlespi,
    getPotentialDeliveredHistory,
    fetchGrafanaDashboards,
    fetchEnginDashboardFromProcs,
    fetchEnginCountByLocation
}
