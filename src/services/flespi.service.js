const loggermodule = require("#modules/loggermodule.js");
const _ = require('lodash')
const moment = require('moment');
const { xFlespi, xNavixy } = require("../configs");
const { default: axios } = require("axios");

exports.getHistoriesFromFlespi = async (params)=>{
    try{
      if(!_.isPlainObject(params)) params = {}
      loggermodule.info('Start getHistoriesFromFlespi for params:'+JSON.stringify(params))
  
      let reqParams = {
        data: {}
      }
      let filter = [];
      
      if(params.from){
        if(moment(params?.from).isValid())
          reqParams.data["from"] = moment(params.from).unix()
        else
          throw new Error('The parameter from is invalid. Need format YYYY-MM-DD HH:mm')
      } 
        
      if(params.to){
        if(moment(params?.to).isValid())
          reqParams.data["to"] = moment(params.to).unix()
        else
          throw new Error('The parameter to is invalid. Need format YYYY-MM-DD HH:mm')
      } 

      if(params.reverse == 1){
        reqParams.data["reverse"] = true
        delete params.reverse
      }

      if(params.limit && !isNaN(params.limit) && +params.limit >= 0){
        reqParams.data["count"] = params.limit
        delete params.limit
      }

      if(params.fields){
        reqParams.data["fields"] = params.fields
        delete params.fields
      }
      
      for(let [key , val] of Object.entries(params)){
        if(['from', 'to'].includes(key)) continue
        if(Array.isArray(val)){
            let dt = val.map( v =>`${key}==`+(typeof v == 'string' ? `'${v}'`: v)).join('||')
            filter.push(dt)
        }else{
            let dt = `${key}==`+(typeof val == 'string' ? `'${val}'`: val)
            filter.push(dt)
        }
      }
  
      if(filter.length > 0) reqParams.data.filter=filter.filter(o => o).join(',')

      console.log('filter : ',filter);
  
      let uri = xFlespi.endPoints.tags_histories+`?data=${JSON.stringify(reqParams.data)}`
      console.log('reqP:', reqParams)
      console.log('uri:', uri)
      loggermodule.info('uri:'+uri)
      let response = await axios(uri , {
        headers: {
          Authorization: "FlespiToken "+xFlespi.token
        }
      })
  
      if(!Array.isArray(response?.data?.result)) throw new Error(response?.data)
      loggermodule.info('End getHistoriesFromFlespi')
      return { success: true , response: response.data.result }
    }catch(e){
      loggermodule.info('Error getHistoriesFromFlespi:'+e.message)
      return { success: false , response: e.message }  
    }
}


exports.sendTagsToFlespi = async (data)=>{
  try{
      loggermodule.info('[FLESPI]: Start sending data to flespi')
      let response = await axios.post(xFlespi.uri , data);
      loggermodule.info('[FLESPI]: End sending data to flespi:'+(typeof response.data == 'string' ? response.data : JSON.stringify(response.data)))
      return {success: true , response: response.data , status: response.status}
  }catch(e){
      loggermodule.info('[FLESPI]: Error sending data to flespi - '+e.message)
      return {success: false , response: e.message}
  }
}

async function sendRequestToFlespi(options){
  try{
      loggermodule.info('[FLESPI]: Start sending request to flespi')
      options = {
        ...options,
        headers: {
          ...(options?.headers || {}),
          Authorization: "FlespiToken "+xFlespi.token
        }
      }

      console.log('options:', options)
      let response = await axios(options);
      loggermodule.info('[FLESPI]: End sending request to flespi')
      return {success: true , response: response.data , status: response.status}
  }catch(e){
      console.log('errrrr:', JSON.stringify(e?.response?.data?.errors))
      loggermodule.info('[FLESPI]: Error sending request to flespi - '+e.message)
      return {success: false , response: e.message}
  }
}

exports.saveGeofenceToFlespi = async  (geometries, options)=>{
  return await sendRequestToFlespi({
    method:'post',
    url:xFlespi.endPoints.geofences,
    data:[
      {
          "enabled": true,
          "geometry": {
              "path": geometries.map( ([lon,lat]) => ({lat,lon}))  ,
              "type": (options.type || 'polygon').toLowerCase()
          },
          ...options,
          "priority": 100
      }
  ]})
}

exports.sendRequestToFlespi = sendRequestToFlespi

