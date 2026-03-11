const _ = require('lodash');
const moment = require('moment');  
const TTModule = require('@omniyat/tomtommodule')
const loggermodule = require("#modules/loggermodule.js");

const { calculateDuration, calculateDurationForArrayItems } = require("#utils/util.js");
const { getHistoriesFromFlespi } = require("./flespi.service");
const { response } = require('express');

function filterHistories(list) {
    return list.filter(item => {
      if (item.enginState === 'reception' && item.LocationID === 0) return false;
      if (item.enginState === 'exit' && item.LocationID !== 0) return false;
      return true; 
    });
  }
function setEnterExitValues(list){
    list.forEach(item => {
         if (item.LocationID != 0 && !item.isFackLocation) {
            item.enginState ='reception'
            item.enginStateName='entrée'
         }else{
            item.enginState ='exits'
            item.enginStateName='sortie'
         };
        return true; 
    });
}
function groupePositionHistories(list) {
    let finalResult = [];
    try {

        
        setEnterExitValues(list)
        let filteredList = filterHistories(list);

        let geofenceAndAddressList = process.geofenceAndAddressList;

        //console.log('geofence and address list : ', geofenceAndAddressList)
        

        let currentIndex = 0
        let currentLat = null
        let currentLng = null
        let currentLocation = null
        
        filteredList.forEach((o, idx) => {
        /*if (
            (o.lat != currentLat || o.lng != currentLng) &&
            (o.LocationID == 0 || (o.LocationID != 0 && o.LocationID !== currentLocation)  )
        ) */
        if (
            (o.LocationID == 0 || (o.LocationID != 0 && o.LocationID !== currentLocation)  )
        ) 
        
        {
            currentIndex++
            o.locIndex = currentIndex
            currentLat = o.lat
            currentLng = o.lng
            currentLocation = o.LocationID
        } else {
            o.locIndex = currentIndex
        }
        })

        let oldData= _.cloneDeep(filteredList);
        let group = _.uniqBy(filteredList, 'locIndex')

        group.forEach( o => {
            let oList = oldData.filter( t => t.locIndex == o.locIndex);
            const hasReception = oList.some(t => t.enginState === 'reception');

            if (hasReception) {
                o.endDate = oList[0].dateFormated; 
                o.startDate = oList[oList.length - 1].dateFormated; 
                o.duration = calculateDuration(o.startDate, o.endDate)
            }
        })

        group = group.map(o => {
            return {
                geofenceID: o.LocationID,
                iconReact: o.enginState== 'reception' ? 'faDownToBracket' : 'faUpFromBracket',
                iconName: o.enginState== 'reception' ? 'fa-solid fa-down-to-bracket' : 'fa-solid fa-up-from-bracket',
                Color:'#fffff',
                bgColor : o.enginState== 'reception' ? '#29bf12' : '#D64B70',
                satlat : o.lat,
                satlng : o.lng,
                enginAddress : geofenceAndAddressList.find(item => item.geofenceID == o.LocationID)?.enginAddress,
                srcId: o.enginId,
                worksiteLabel : o.locationName,
                etatengin: o.enginStateName,
                etatenginname : o.enginState,
                PeriodStart: moment(o.startDate || o.dateFormated).format("DD-MM-YYYY HH:mm"),  
                PeriodEnd: moment(o.endDate || o.dateFormated).format("DD-MM-YYYY HH:mm"),
                PeriodStartIso: o.startDate || o.dateFormated,  
                PeriodEndIso: o.endDate || o.dateFormated,
                timestamp: o.timestamp,
                DurationFormatted: o.duration

            };
        })

        //console.log('filtered List : ',_(filteredList));

        const exitEntries = _(filteredList)
                                    .filter(item => item.enginState === 'exit')
                                    .groupBy('lng') 
                                    .map(items => {  
                                        const sortedItems = _.sortBy(items, 'dateFormated');
                                        const firstItem = _.first(sortedItems);
                                        const lastItem = _.last(sortedItems);
                                        return {
                                            //...lastItem, 
                                            geofenceID: lastItem.LocationID,
                                            iconReact:'faUpFromBracket',
                                            iconName:'fa-solid fa-up-from-bracket',
                                            Color:'#fffff',
                                            bgColor : '#D64B70',
                                            satlat : lastItem.lat,
                                            satlng : lastItem.lng,
                                            //enginAddress : lastItem.address,
                                            enginAddress : geofenceAndAddressList.find(item => item.geofenceID == lastItem.LocationID)?.enginAddress,
                                            srcId: lastItem.enginId,
                                            etatengin: lastItem.enginStateName,
                                            etatenginname : lastItem.enginState,
                                            PeriodStart: moment(firstItem.dateFormated).format("DD-MM-YYYY HH:mm"), 
                                            PeriodEnd: moment(lastItem.dateFormated).format("DD-MM-YYYY HH:mm"),
                                            timestamp: lastItem.timestamp,
                                            DurationFormatted: calculateDuration(firstItem.dateFormated, lastItem.dateFormated)
                                        };
                                    }).value();  


        const receptionEntries = _(filteredList)
                                    .filter(item => item.enginState === 'reception')
                                    .groupBy('locIndex') 
                                    .map(items => {  
                                        const sortedItems = _.sortBy(items, 'dateFormated');
                                        const firstItem = _.first(sortedItems);
                                        const lastItem = _.last(sortedItems);
                                        return {
                                            //...lastItem, 
                                            geofenceID: lastItem.LocationID,
                                            
                                            iconReact:'faDownToBracket',
                                            iconName:'fa-solid fa-down-to-bracket',
                                            Color:'#fffff',
                                            bgColor : '#29bf12',
                                            satlat : lastItem.lat,
                                            satlng : lastItem.lng,
                                            //enginAddress : lastItem.address,
                                            enginAddress : geofenceAndAddressList.find(item => item.geofenceID == lastItem.LocationID)?.enginAddress,
                                            srcId: lastItem.enginId,
                                            worksiteLabel : lastItem.locationName,
                                            etatengin: lastItem.enginStateName,
                                            etatenginname : lastItem.enginState,
                                            PeriodStart: moment(firstItem.dateFormated).format("DD-MM-YYYY HH:mm"),  
                                            PeriodEnd: moment(lastItem.dateFormated).format("DD-MM-YYYY HH:mm"),
                                            timestamp: lastItem.timestamp,
                                            DurationFormatted: calculateDuration(firstItem.dateFormated, lastItem.dateFormated)

                                        };
                                    }).value(); 
        finalResult = [...exitEntries, ...receptionEntries]

        // console.log('periodestart type : ',new Date(finalResult[0]?.PeriodStart));

        //console.log('final result : ', _.orderBy(finalResult  , ['timestamp'], ['desc']));

        let sortedData = _.orderBy(finalResult, [item => new Date(moment(item?.PeriodStart, "DD-MM-YYYY HH:mm").toISOString())], ['desc']);

        return group
        //return _.orderBy(finalResult  , ['PeriodStart'], ['desc']);
    } catch (e) {
        console.log('groupePositionHistories Error:', e.message)
        return finalResult
    }
}

function getStreamDataType(data){
    let type = null
    if(data['ble.beacons'] || data['position.latitude']) type = 'gps'
    return type
}

function extractTagsInfoFromGpsData(data){
   let result = []
   try{
    let lat = isNaN(data['position.latitude']) ? 0 : +data['position.latitude']
    let lng = isNaN(data['position.longitude']) ? 0 : +data['position.longitude']
    if(Array.isArray(data['ble.beacons']) && lat != 0 && lng != 0){
        let gpsData = { ...data }
        delete gpsData['ble.beacons'];
        result = data['ble.beacons'].map( o => {
           let t =  { ...o , gpsData}
           t.macAddr = t.macAddr || t.id;
           t.lat = lat
           t.lng = lng
           t.deviceType = 'gps'
           t.deviceId = data['ident']
           delete t.id
           return t
        })
    }
   }catch(e){
    loggermodule.error('[FLESPI DATA PROCESSING]: Error in extractTagsInfoFromGpsData:'+e.message)
   }finally{
    return result
   }
}

const dataParser = {
    gps: extractTagsInfoFromGpsData
}

function parseStreamData(data , type){
  try{
    let parsedData = null
    if(!type === undefined) type = getStreamDataType(data)
 
    let parser = dataParser[type];
 
    if(typeof parser == 'function') parsedData = parser(data)
 
     return parsedData
  }catch(e){
    loggermodule.error('[FLESPI DATA PROCESSING]: Error in parseStreamData:'+e.message)
    return null
  }
}


async function getActiveGatewaysFromFlespi(gateways , extraParams){
    let response = {};
    try{
      let params = {
          deviceType:'gateway',
          from: moment().subtract(1 , 'days').format(),
          to:  moment().add(1, 'hours').format(),
          reverse: 1,
          fields: 'enginId,engin,lat,lng,deviceType,deviceId,dateFormated,LocationID,locationName,address',
          ...(extraParams || {})
      }
      if(gateways){
        params.deviceId=gateways;
      }
      let flepiData = await getHistoriesFromFlespi(params)

        if(!Array.isArray(flepiData.response)){  
            loggermodule.error('Error getEnginsLastSeenFromFlespi:'+JSON.stringify(response))
        }else{
            response.gateways = _.uniqBy(flepiData.response , 'deviceId')
                                .map( o => ({deviceId:o.deviceId , last_seen: o?.dateFormated}));

            response.engins = flepiData.response.reduce( (c , v)=>{
                if(!c[v.enginId]) c[v.enginId] = []
                if(!c[v.enginId].includes(v.deviceId))
                    c[v.enginId].push(v.deviceId);

                return c
            }, {})
            response.last_seen_at = flepiData.response[0]?.dateFormated
        }
    }catch(e){
      loggermodule.info("Error in getEnginsLastSeenFromFlespi:"+e.message)
      response.error = "Error in getEnginsLastSeenFromFlespi:"+e.message
    }
    return response
}


async function calculateHistoryRoute(history){
    let response = null
    try{
        let waypoints = history.map(o =>({lat: o.satlat , lng: o.satlng}))
        
        let routeResponse = await TTModule.calculateRoute(waypoints);
        let routes = routeResponse?.response?.routes
        if(Array.isArray(routes) && routes?.length > 0){
            routeResponse = routes[0].legs.reduce((c , v)=>{
                c = [...c , ...v.points.map(o =>({lat: o.latitude , lng: o.longitude}))]
                return c
            },[])

            response = {
                summary: routes[0]?.summary,
                route: routeResponse,
                detail: routes[0]
            }
        }else{
            response = routeResponse
        }
    }catch(e){
        response = {success: false , response: e.message}
    }

    return response
    
}


module.exports = {
    groupePositionHistories,
    parseStreamData,
    getStreamDataType,
    getActiveGatewaysFromFlespi,
    calculateHistoryRoute
}