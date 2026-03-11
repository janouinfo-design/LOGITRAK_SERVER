const loggermodule = require("#modules/loggermodule.js");
const { onResult, onException } = require("#utils/error.utl.js");
const { calculateDuration, calculateDurationForArrayItems } = require("#utils/util.js");
const { getHistoriesFromFlespi } = require("./flespi.service");
const _ = require('lodash');
const { groupePositionHistories, getStreamDataType, parseStreamData, calculateHistoryRoute } = require("./flespi.util");
const { processSavePosition } = require("#modules/tag/tag.util.js");

const excludeParams = ['grouBy' , 'data' , 'auth_key','userInfos','app']
const excludedTrakers = []
exports.list = async (req , res)=> {
     try{
        loggermodule.info(`[FLESPI]: Start flespi list`)
        let params = req.query;
        let groupBy = params.groupBy;
        if(typeof groupBy != 'string') groupBy = ''
        params.limit=3000;
        delete params.groupBy;

        for(let key in params) {
         if(excludeParams.includes(key)) delete params[key]
        }

        console.log('params:', params)
        loggermodule.info(`[FLESPI]: End flespi list`)
        let list = await getHistoriesFromFlespi(params)


        let groupedList = groupePositionHistories(list.response)

        //console.log('grouped : ',groupedList);

       /**  if(Array.isArray(groupedList) && groupBy.split(',').length > 0){
            groupBy = groupBy.split(',')

            //console.log('group By : ',groupBy);

            if(groupBy.includes('lat') && groupBy.includes('lng') && groupBy.length == 2){
               let currentIndex = 0
               let currentLat = null
               let currentLng = null
               groupedList.forEach( (o,idx) => {
                     if(o.lat != currentLat && o.lng != currentLng){
                        currentIndex++
                        o.locIndex = currentIndex
                        currentLat = o.lat
                        currentLng = o.lng
                     }else{
                        o.locIndex = currentIndex
                     }
               })
               groupBy.push('locIndex')
            }


            console.log('list flespi 1 : ',groupedList);
            
            groupedList= _.uniqBy( groupedList , (o)=> groupBy.map( t => o[t]).join('-'));

            console.log('list flespi 2 : ',groupedList);
        }*/
        
        let resultList = groupedList.filter(item => item.DurationFormatted !== '0');
        if(resultList.length > 150) resultList = resultList.slice(0,150)
        let routeResponse = await calculateHistoryRoute(resultList)
        res.json({list: resultList , route: routeResponse})
     }catch(e){
        loggermodule.error(`[FLESPI]: Error fetching data from flespi: ${e.message}`)
        onException(e , res)
     }
}

exports.listHistory = async (req,res) => {

   let data =  [
    {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 22:51:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 3825468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 21:18:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "exits",
        "enginStateName": "Sortie",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 2825468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 20:00:00",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "exits",
        "enginStateName": "Sortie",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 1825468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 19:25:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 9725468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 19:18:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 8725468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 19:15:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 7725468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 19:05:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 6725468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 18:31:50",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "exits",
        "enginStateName": "Sortie",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 5725468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 18:30:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "exits",
        "enginStateName": "Sortie",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 4725468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 18:21:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "exits",
        "enginStateName": "Sortie",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 3725468678.366154,
        "user": "admin admin",
        "userID": 2111
    }, {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 18:19:20",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 2725468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 17:57:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 1725468678.366156,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 17:53:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 1725468678.366155,
        "user": "admin admin",
        "userID": 2111
    },
 {
        "address": "G5FC+5FW, Tamaris, Morocco",
        "dateFormated": "2024-09-04 17:51:18",
        "engin": "Pc te",
        "enginId": "40234",
        "enginState": "reception",
        "enginStateName": "Entrée",
        "gateway": "",
        "lat": 33.521649,
        "lng": -7.82922,
        "locationName": "DEPOT OMNIYAT",
        "macAddr": "BC572902A1A9",
        "nearestLocationName": "",
        "timestamp": 1725468678.366154,
        "user": "admin admin",
        "userID": 2111
    },
   ]


    let result = [];
    let currentGroup = [];

 
    data.forEach((item) => {
      if (item.enginState === 'reception') {
        
        currentGroup.push(item);


      } else if (item.enginState === 'exits') {
        
        if (currentGroup.length > 0) {
          result.push(currentGroup);
          currentGroup = [];  
        }
        
        result.push(item);
      }
    });

 
    if (currentGroup.length > 0) {
      result.push(currentGroup);
    }
    let newRes = calculateDurationForArrayItems(result);
    res.json(result);
}

exports.streamdata = async(req , res)=>{
   try{
       let data = req.body?.[0]

       let trakers = process.tracker_idents
       if(!Array.isArray(trakers)) trakers = []

       if(!trakers.includes(data['ident'])){
         if(!excludedTrakers.includes(data['ident'])){
            excludedTrakers.push(data['ident'])
            loggermodule.info(`[FLESPI STREAM]: traker ${data['ident']} is not cutomer traker - trakers:`+trakers)
         }
         onResult(res, {success: true})
         return
       }
       loggermodule.info('[FLESPI STREAM]: New stream received:'+JSON.stringify(data))
       loggermodule.info('[FLESPI STREAM]: Start processing data')
       let type = getStreamDataType(data)
       
       if(type == 'gps'){
          let tagsInfo = parseStreamData(data , type);
          if(!Array.isArray(tagsInfo)) tagsInfo = []
          loggermodule.info('[STREAM TAGS]:'+JSON.stringify(tagsInfo))

          let lat = isNaN(data['position.latitude']) ? 0 : +data['position.latitude']
          let lng = isNaN(data['position.longitude']) ? 0 : +data['position.longitude']
          
          if(tagsInfo.length == 0 && lat != 0 && lng != 0) tagsInfo = [{
            macAddr: null , 
            lat, 
            lng,
            deviceType: 'gps',
            deviceId: data['ident'],
            isFake: true,
            gpsData: {...data}
         }]

         loggermodule.info('[STREAM TAGS]:'+JSON.stringify(tagsInfo))

          processSavePosition(tagsInfo , req)
       }
       loggermodule.info('[FLESPI STREAM]: End processing data')
       onResult(res, {success: true})
   }catch(e){
       loggermodule.error('[FLESPI STREAM]: Error in streamdata:'+e.message)
       onException(e , res)
   }
}



