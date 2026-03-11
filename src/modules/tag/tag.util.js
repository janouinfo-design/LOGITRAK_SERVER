let ssm = require("../../apis/sql-server-request");
let { TYPES } = require("tedious");
let iomodule = require("#modules/iomodule.js");
let loggermodule = require("#modules/loggermodule.js");
let _ = require("lodash");

let moment = require("moment");
const { findAddress, calculateDistance } = require("../../services/location.service");
const { sendTagsToFlespi, getHistoriesFromFlespi } = require("#modules/flespi/flespi.service.js");
const { findGeofenceOfPoints, distanceToGeofenceByID } = require("#utils/geometry.utl.js");
const { saveJsonToFile, readJsonFile } = require("#utils/file.utl.js");
const { setEnginsLastSeenFromFlespi, getEnginsLastSeenFromFlespi } = require("#modules/engin/engin.service.js");

const { executeNavixy} = require("#modules/navixy/navixy.service.js");
const { getActiveGatewaysFromFlespi } = require("#modules/flespi/flespi.util.js");
const { response } = require("express");

let {
  TIME_BEFORE_PICKUP, 
  TIME_BEFORE_PICKUPRETUREN, 
  DISTANCE_BEFORE_PICKUPRETUREN , 
  DISTANCE_BEFORE_DELIVERY , 
  TIME_BEFORE_DELIVERY , 
  TIME_BEFORE_POTENTIAL_DELIVERY , 
  GPS_STATIONARY_RADIUS , 
  GPS_STATIONARY_DELAY , 
  TIME_BEFORE_DELIVERED_IF_LOCATION0 , 
  PROCESS_DELIVERY_IF_NOT_SEEN_FOR_WHILE , 
  DISABLE_STATUS_CHANGE , 
  EXIT_DISTANCE_AFTER_DELIVERY, 
  PROCESS_IN_DEPOSIT_WHEN_ENTER,
  TIME_BEFORE_ENTER_EXIT,
  TIME_BEFORE_EXIT_BY_GATEWAY,
  TIME_BEFORE_CHANGE_STATUS_FROM_GATEWAY
} = process.env

let timeToWait = 6
function saveTagsHistory(data, excludeMacs , extra) {
    if (!Array.isArray(data)) return;
    if (!Array.isArray(excludeMacs)) excludeMacs = [];
    let oldData = _.cloneDeep(process.scannedTags);
    if (!Array.isArray(oldData)) oldData = [];
    let newTags = [];
    let tagsBatteryUpdated = extra?.tagsBatteryUpdated
    if(!Array.isArray(tagsBatteryUpdated)) tagsBatteryUpdated = []
    data.filter(o => !o.isFake).forEach((o) => {
      let old = oldData.find((old) => old.macAddr == o.macAddr);
      let dateMoment = moment().format("YYYY-MM-DDTHH:mm:ss");
      if (old) {
        for (key in o) old[key] = o[key];
        old.lastSeen = dateMoment
        if (excludeMacs.includes(old.macAddr))
          old.lastUpdateSeen = dateMoment
        if (tagsBatteryUpdated.includes(old.macAddr))
          old.lastUpdateBattery = dateMoment
      } else if(extra?.addIfNotExist !== false) {
        o.lastSeen = dateMoment
        if (excludeMacs.includes(o.macAddr))
          o.lastUpdateSeen = dateMoment
        if (tagsBatteryUpdated.includes(o.macAddr))
          o.lastUpdateBattery = dateMoment
  
        loggermodule.info(`EXTRA DATA: ${o.macAddr} : ${JSON.stringify(tagsBatteryUpdated)} : ${tagsBatteryUpdated.includes(o.macAddr)} : ${o?.tagsBatteryUpdated}`)
        newTags.push(_.cloneDeep(o));
      }
    });
    process.scannedTags = [...oldData, ...newTags];
    saveScannedTagsToFile(process.scannedTags)
}

function removeTagsFromHistory(macs){
  try{
    loggermodule.info(`[REMOVE TAGS]: Start removing tags  from history`)
    loggermodule.info(`[REMOVE TAGS]: Tags to remove - ${JSON.stringify(macs)}`)

    if (!Array.isArray(macs)) return;
    let oldData = _.cloneDeep(process.scannedTags);
    if (!Array.isArray(oldData)) return;
    process.scannedTags = oldData.filter( o => !macs.includes(o.macAddr))
    saveScannedTagsToFile()
    loggermodule.info(`[REMOVE TAGS]: End removing tags  from history`)
  }catch(e){
    loggermodule.error('[REMOVE TAGS]: Erreur removing tags:'+e?.message+'-'+e?.stack)
  }
  
}

function saveGpsHistories(info){
  if(!info) return
  let oldHistories = process.gps_histories;
  if(!Array.isArray(oldHistories)) oldHistories = []

  let oldGps = oldHistories.find(o => o.ident == info.ident) || {};
  process.gps_histories = [...oldHistories.filter(o => o.ident != info.ident) , {...oldGps , ...info}]

  let obj = {
    date: moment().format(),
    data: process.gps_histories
  }
  saveJsonToFile(obj , {
    directorie: 'logs',
    filename: 'gps-histories',
    format: 'json'
  })
}

function updateTagsInHistory(values , updateEngin){
  loggermodule.info('UPDATING HISTORIES FOR:'+JSON.stringify(values))
  if(!Array.isArray(process.scannedTags)) return 
  let tagmacs = values.map(o => o.macAddr)

  loggermodule.info('SCANNED TAGS LIST :'+JSON.stringify(process.scannedTags))
  let tags = process.scannedTags.filter(o => tagmacs.includes(o.macAddr))
  if(tags.length > 0){
    tags = tags.map( t => {
      let infos = values.find( o => o.macAddr == t.macAddr) || {}
      return {
        ...t,
        ...infos
      }
    })

    process.scannedTags = [
      ...process.scannedTags.filter(o => !tagmacs.includes(o.macAddr)),
      ...tags
    ]
    saveScannedTagsToFile(process.scannedTags)
    if(updateEngin && Array.isArray(process.enginList)){
      let engins = process.enginList.filter(o => tagmacs.includes(o.tagname))
      engins = engins.map( t => {
        let infos = values.find( o => o.macAddr == t.tagname) || {}
        return {
          ...t,
          ...infos
        }
      })
      process.enginList = [
        ...process.enginList.filter(o => !tagmacs.includes(o.tagname)),
        ...engins
      ]
    }

  }
}
  
function emitUpdateEngins(data) {
    if (!Array.isArray(data)) return;
    let parseData = (item) => ({
        ...item,
        id: item.activeID,
        statusID: item.activeStatus,
        LocationID: item.activeGeofenceID,
        worksite: item.activeLocationID,
    });

    loggermodule.info(
        "emitUpdateEngins DATA : " + JSON.stringify(data.map(parseData))
    );

    iomodule.emit("new_updated_engins", {
        engins: data.map(parseData),
    });
}

async function emitUpdateWorksiteStats() {
  try{
      let response = await ssm.execProc("worksite_statistiques");
      console.log("response res : ", response);
      if(!response.success) loggermodule.error('Error emitUpdateWorksiteStats:'+JSON.stringify(response))
      if (Array.isArray(response?.result) && response?.result?.length > 0) {
      iomodule.emit("worksite_statistiques", {
          worksiteStats: response.result
      });
      }
  }catch(e){

  }
}

async function emitUpdateStaffStats(params,srcId) {
  try{
      let response = await ssm.execProc("getLastTimeStaff",params);
      console.log("response res : ", response);
      if(!response.success) loggermodule.error('Error emitUpdateStaffStats:'+JSON.stringify(response))
      if (Array.isArray(response?.result) && response?.result?.length > 0) {

        response.result = response?.result.map(item => ({
          ...item,
          staffId:   srcId
        }));

         console.log('resonse resulllt emmit : ',response?.result);

      iomodule.emit("emitUpdateStaffStats", 
      {
          staffTimeWorking: response?.result
      });

      /*iomodule.emit("new_updated_engins", {
        engins: response?.result
        });*/


      }
  }catch(e){

  }
}




function gatewayResultData(data, gate) {
    let resultListGateway = process.engins_state_by_gateway;
    if (!Array.isArray(resultListGateway)) resultListGateway = [];
    if (!Array.isArray(data?.obj)) data.obj = [];
    // loggermodule.info('GATEWAY STATE DATA:'+JSON.stringify(resultListGateway))
    data.obj.forEach((item) => {
        let index = resultListGateway.findIndex(
        (r) => r.macAddr === item.dmac && r.gmac
        );
        if (index !== -1) {
        resultListGateway[index] = {
            ...resultListGateway[index],
            rssi:item.rssi,
            macAddr: item.dmac,
            lng: gate.lng || data.loc.longitude,
            lat: gate.lat || data.loc.latitude,
            time: item.time,
            isExit: 0,
            exitCount: 0,
            gmac: data.gmac,
            locationID : gate?.locationId,
            locationObject : gate?.locationObject
        };
        } else {
        resultListGateway.push({
            ...item,
            gmac: data.gmac,
            time: item.time,
            macAddr: item.dmac,
            lng: gate.lng || data.loc.longitude,
            lat: gate.lat || data.loc.latitude,
            isExit: 0,
            exitCount: 0,
            locationID : gate?.locationId,
            locationObject : gate?.locationObject
        });
        }
    });

    resultListGateway.forEach((item) => {
        let existsInNewData = data.obj.some(
        (newItem) => newItem.dmac === item.macAddr
        );
        if (!existsInNewData) {
        item.isExit = -1;
        if (!item.exitCount) item.exitCount = 0;
        item.exitCount += 1;
        }
    });
    process.engins_state_by_gateway = resultListGateway;
    return _.cloneDeep(resultListGateway.filter((o) => o.gmac == data.gmac));
}

function removeTagsAfterExitByGateway(processedData) {
    try {
        loggermodule.info("[REMOVE]:Start removing tags after exit by gateway");
        let processed = _.cloneDeep(processedData);
        let local_db_tags = process.engins_state_by_gateway;
        if (!Array.isArray(processed)) processed = [];
        if (!Array.isArray(local_db_tags)) local_db_tags = [];
        let macsExitByGateway = processed
        .filter((o) => o.status == "exits" && o.mode == "gateway")
        .map((o) => o.tagname);
        let macsToRemove = [];
        if (macsExitByGateway.length > 0) {
            macsToRemove = local_db_tags
                .filter((o) => macsExitByGateway.includes(o.macAddr) && o.isExit == -1)
                .map((o) => o.macAddr);
            process.engins_state_by_gateway = local_db_tags.filter(
                (o) => !macsToRemove.includes(o.macAddr)
            );
        }
        loggermodule.info(
        `[REMOVE]: Tags to remove ${JSON.stringify(macsToRemove)}`
        );
        loggermodule.info(
        `[REMOVE]: New tags list after remove ${JSON.stringify(
            process.engins_state_by_gateway
        )}`
        );
        loggermodule.info("[REMOVE]:End removing tags after exit by gateway");
    } catch (e) {
        loggermodule.error(
        "[REMOVE]:Error removeTagsAfterExitByGateway:" + e.message
        );
    }
}

async function processSavePosition(parsedData, req) {
    try {
      loggermodule.info("Start processSavePosition:"+parsedData?.length);

      loggermodule.info("processSavePosition list:"+JSON.stringify(parsedData));
      
      let data = req.body;

      let userID = data?.userInfos?.userID || 0;
      let date = moment(data?.date || moment()).format();
      let dateObject = moment(data?.date || moment());

      // skip old data
      if(moment().diff(date, "minutes",true) > 5){
        loggermodule.info("End processSavePosition: Data too old - data:"+date);
        return { success: true, response: "Data too old - date"+date };
      }
      let gpsData = null

      if(parsedData?.[0]?.deviceType == 'gps'){
        gpsData = parsedData[0].gpsData
      }

      parsedData.forEach( t =>{
        if(t.deviceType && t.deviceId) return
        if (t.gmac) {
          t.deviceType = "gateway";
          t.deviceId = t.gmac
        }
        else if (userID && !isNaN(userID) && +userID > 0) {
          t.deviceType = "mobile";
          t.deviceId = userID
        }else{
          t.deviceType = "unknown";
          t.deviceId = "unknown"
        }
      })

      let {deviceType , deviceId} = parsedData[0] || {};

      let deviceName = await getDeviceName(deviceType, deviceId)



      
  
      if (!Array.isArray(parsedData)) parsedData = [];
      if (parsedData.length == 0) {
        loggermodule.info("End processSavePosition");
        return { success: true, response: "Not tags" };
      }
      let latlngs = parsedData.map((t) => ({ lat: t.lat, lng: t.lng }));
      latlngs = _.uniqBy(latlngs, (t) => t.lat + "-" + t.lng);
  
      let addressInfos = await findAddressForTags(latlngs);
  
      parsedData = parsedData.map((t) => ({
        ...t,
        ...addressInfos.find((o) => o.lat == t.lat && o.lng == t.lng),
        deviceType,
        deviceId,
        deviceName
      }));
      parsedData = await findGeofenceOfPoints(_.cloneDeep(parsedData));
      
      console.log('parsedData:', JSON.stringify(parsedData));
      // return {}
      dataToSendToIo = _.cloneDeep(parsedData);
      let worksites = parsedData
        .filter((o) => o?.worksite?.id || o?.nearest?.id)
        .map((o) => ({
          id: o?.worksite?.id,
          nearestID: o?.nearest?.id,
          geometry:
            o?.worksite?.geometry?.geometry || o?.nearest?.geometry?.geometry,
          label: o?.worksite?.label || o?.worksite?.name || "",
          nearestLabel: o?.nearest?.label || o?.nearest?.name || "",
          nearestDistance: o?.nearest?.nearestDistance,
        }));
  
      parsedData.forEach((o) => {
        o.LocationID = o.isExit == 1 ? 0 : o?.worksite?.id || 0;
        o.NearestID = o.isExit == 1 ? 0 : o?.nearest?.id || 0;
        o.isFakeLocation = ''
        if(o.LocationID != 0) {
          o.LastLocationID = o.LocationID
          o.LastLocationLat = o.lat
          o.LastLocationLng = o.lng
          o.WorksiteId = o?.worksite?.worksite?.id || 0
          o.WorksiteObject = o?.worksite?.worksite?.type || ''
        }
        delete o.worksite;
        delete o.nearest;
      });

      parsedData = setLocationIDWhenGpsIsStationary(parsedData);
      
      let dataBeforeRemovingNullMacs =  parsedData;
      parsedData = await updateEnginStatusByGpsOrMobile(parsedData);
      loggermodule.info('PARSED DATA:'+JSON.stringify(parsedData))
      parsedData = parsedData.filter( o => o.macAddr && !o.isFake)
      let procData = [];
      let processData = process.enginList;
      let users = process.users;
      let scannedTags = process.scannedTags;

      if (!Array.isArray(processData)) processData = [];
      if (!Array.isArray(users)) users = [];
      if (!Array.isArray(scannedTags)) scannedTags = [];
      let mergedData = parsedData
        .map((item) => {
          let match = processData.find((entry) => entry.tagname === item.macAddr);
  
          if (match) {
            return { ...item, ...match };
          }
  
          return null;
        })
        .filter((item) => item !== null);
  
      let alreadyUpdated = [];

      let statusObj = {
        'enter': 'reception',
        'exits': 'exit'
      }

      mergedData.forEach((item) => {
        
        let status = "";
        let itemLastScan = _.cloneDeep(scannedTags.find((o) => o.macAddr == item.tagname)) ;
        if(itemLastScan && itemLastScan?.isFakeLocation) itemLastScan.LocationID = 0

        let LocationID = (item.LocationID == 0 || item.isFakeLocation) ? 0 : item.LocationID


        if (
          (LocationID == 0 && item.etatenginname != "sortie") ||
          item.isExit == 1 
        ) {
          status = "exits";
        } else if ((!isNaN(LocationID) && LocationID != 0 /*&& LocationID != item.activeGeofenceID && item.etatenginname != 'reception'*/) || (item.immediate && ['depositDelivered','delivered'].includes(item.statusTo))) {
          status = "enter";
        }

        let distance = null
        if(status == 'exits' && ['depositDelivered','delivered'].includes(item.statusname)){
          loggermodule.info('id geofence work dep ' + item.activeLocationID)

            distance = distanceToGeofenceByID(item.activeLocationID , {lat: item.lat , lng: item.lng});
            if(!distance.distance || +distance?.distance < EXIT_DISTANCE_AFTER_DELIVERY){
              if(!distance.distance)
                loggermodule.error(`[EXIT AFTER DELIVERY]: ${item.macAddr} - Error calculating distance from geofence:${JSON.stringify(distance)}`)
              else{
                loggermodule.info(`[EXIT AFTER DELIVERY]: ${item.macAddr} - Can't process exit. Distance less than ${EXIT_DISTANCE_AFTER_DELIVERY} - ${JSON.stringify(distance)}`)
              }
            }
            distance = distance.distance
        }

        let isDistanceCheckOK = distance == null || distance >= EXIT_DISTANCE_AFTER_DELIVERY

        
        let actualStatus = status;

        let diff = 0;
        if(itemLastScan?.lastDetection){
          diff = moment().diff(
            moment(itemLastScan.lastDetection, "YYYY-MM-DDTHH:mm:ss"),
            "minutes",
            true
          )
        }

        let needsReset = (status && statusObj[status] != item.etatenginname && itemLastScan?.alreadyUpdated && diff > 25 && !item.immediate)
        
        if (itemLastScan?.LocationID != LocationID ||  
            (itemLastScan && itemLastScan?.activeID != item?.activeID) || needsReset) {
          item.lastDetection = moment().format("YYYY-MM-DDTHH:mm:ss");
          item.alreadyUpdated = false;
          status = null;
        } else {
          if (itemLastScan?.lastDetection) {
            let timeForEvent = item.isExit == 1 ? TIME_BEFORE_EXIT_BY_GATEWAY : TIME_BEFORE_ENTER_EXIT;
            loggermodule.info("TIME TO WAIT:" + timeForEvent);
            if (diff >= timeForEvent && !itemLastScan.alreadyUpdated && isDistanceCheckOK) {
              item.alreadyUpdated = true;
              alreadyUpdated.push({ mac: item.macAddr, engin: item.activeID });
            } else {
              status = null;
            }
          }
        }
        if(item.immediate && actualStatus){
          status = actualStatus
          item.alreadyUpdated = true
        }
  
        loggermodule.info(
          `DATA DIFFF INFO:${item.tagname},enginID:${item.activeID},timeDiff:${diff},alreadyUpdated:${itemLastScan?.alreadyUpdated},statusTo:${status},realStatusTo:${actualStatus},locationID:${LocationID},distance: ${distance}`
        );
        if (status /*&& !item.isFakeLocation*/) {
          let dataToAdd = {
            idEngin: item.activeID,
            tagname: item.tagname,
            LocationID,
            lat: item.lat,
            lng: item.lng,
            address: (item.address || "").toString().replace(/'/g, "."),
            city: item.city,
            country: item.country,
            postal_code: item.postal_code,
            status: status,
            mode: item.deviceType,
            src : 'engin',
            rssi: item.rssi
          };
  
          if (
            status == "enter" &&
            item.etatenginname == "reception" &&
            item.LocationID != item.activeGeofenceID &&
            item.activeGeofenceID != 0 &&
            !item.alreadyExit
          ) {
            let dataToAdd2 = _.cloneDeep(dataToAdd);
            dataToAdd2.LocationID = item.activeGeofenceID;
            dataToAdd2.status = "exits";
            loggermodule.info(
              `[Exit]: Exiting ${dataToAdd2.tagname} before enter`
            );
            procData.push(dataToAdd2);
            item.alreadyUpdated = false;
            item.alreadyExit = true;
            alreadyUpdated = alreadyUpdated.filter((o) => o.mac != item.tagname);
          } else {
            procData.push(dataToAdd);
          }
        }
      });
  
  
      loggermodule.info("AlreadyUpdated:" + JSON.stringify(alreadyUpdated));
      loggermodule.info("DATA passed to proc : " + JSON.stringify(procData));
  
      // create data to send to flespi
      let flespiData = dataBeforeRemovingNullMacs
        .map((t) => {
          if(t.macAddr == null) t.macAddr = '00'
          let engin = processData.find((o) => o.tagname === t.macAddr);
          let user = users.find((o) => o.userID == data?.userInfos?.userID);
          let worksite = worksites.find(
            (o) => o.id == t.LocationID || o.nearestID == t.NearestID
          );

          return {
            ...t,
            date: moment(data.date).unix(),
            dateFormated: moment(data.date).format(),
            userID: data?.userInfos?.userID || 0,
            gateway: t?.gmac || "",
            engin: engin?.activeReference || "",
            enginId: engin?.activeID || 0,
            enginState: engin?.etatenginname || "",
            enginStateName: engin?.etatengin || "",
            user: ((user?.firstname || "") + " " + (user?.lastname || "")).trim(),
            userRole: user?.famille || "",
            userImage: user?.image,
            userMail: user?.addrMail,
            locationGeometry: worksite?.geometry || null,
            locationName: worksite?.label,
            nearestLocationName: worksite?.nearestLabel,
            nearestDistance: worksite?.nearestDistance,
            inGeofence: t.LocationID == 0 ? 'no' : 'yes',
            stationaryLat: t?.stationaryLat,
            stationaryLng: t?.stationaryLng
          };
        })
        .filter((o) => o.isExit != 1 && !( ['depositDelivered','delivered'].includes(o.statusTo) && o.immediate == 1));
  
      // send data to flespi
      sendTagsToFlespi(flespiData);


      console.log('date with time zone : ',date);

      procData = procData.map((o) => ({
        ...o,
        mode: deviceType,
        deviceName
      }));
      let params = [
        {
          name: "data",
          type: TYPES.NVarChar,
          value: JSON.stringify(procData),
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
      ];
  
      // if (data?.date) {
        
      // }

      params.push({
        name: "date",
        type: TYPES.NVarChar,
        value: date,
      });
  
      let responseStatus = { success: true, response: "No update needed" };
      loggermodule.info("START enterExit process");

      
      if (procData.length > 0) {
        loggermodule.info(
          "Start tag_updatedSavePosition:" + JSON.stringify(procData)
        );
        responseStatus = await ssm.execProc("tag_updatedSavePosition", params); 
        loggermodule.info("End tag_updatedSavePosition");
      } else {
        loggermodule.info(
          "End tag_updatedSavePosition:" + JSON.stringify(responseStatus)
        );
      }
      try {
  
        let activeRes = responseStatus?.result?.[0]?.activeResult || "";
  
        if (responseStatus?.success && activeRes && activeRes.includes("{")) {
          
  
          //process.enginList = JSON.parse(activeRes);
          console.log('engin list inside ',);
          activeRes = JSON.parse(activeRes); 
          loggermodule.info('Engin data after tag_updatedSavePosition:'+JSON.stringify(activeRes));
          activeRes.forEach( o => {
            let old = procData.find( t => t.tagname == activeRes.tagname);
            if(old) o.status = old.status
          })

          mergedData = mergedData.map( o => {
              let enginO = activeRes.find( t => t.tagname == o.tagname);
              if(enginO){
                return {...o, ...enginO}
              }
              return { ... o}
          })
  
          process.enginList = activeRes
          // emitUpdateEngins(process.enginList);
  
          setTimeout(()=>fetchEnginAndEmitUpdate(procData.map(o=>o.idEngin)) , 10000)
          emitUpdateWorksiteStats();
        }
      } catch (e) {
        loggermodule.error("Error parsing activeResult:" + e.message);
      }
  
      let excludeMacs = [];
      let tagsBatteryUpdated = []
      if (!data.date && mergedData.length > 0) {
        updateLastSeen(mergedData)
        tagsBatteryUpdated = await updateBatteryLevelAfterScan(mergedData);
      }
      // emit event for new flespi datas
      iomodule.emit("new_tags_logs", {
        data: flespiData.map( o => ({
          ...o,
          'server.timestamp': moment().subtract(moment().parseZone().utcOffset(), 'minutes').unix()
        })),
        userInfo: {
          socket: process.socket_id,
          ...(data.userInfos || {}),
        },
      });
      if (
        responseStatus?.success ||
        responseStatus?.response == "No update needed"
      ) {
        saveTagsHistory(
          mergedData.map((o) => ({ ...o, macAddr: o.macAddr })),
          excludeMacs, {tagsBatteryUpdated}
        );
        if (responseStatus?.response !== "No update needed") {
          removeTagsAfterExitByGateway(procData);
        }
      }

      if(gpsData){
        gpsData.lastLat = gpsData['position.latitude']
        gpsData.lastLng = gpsData['position.longitude']
        gpsData.lastSpeed = gpsData['position.speed']
        saveGpsHistories(gpsData);
      }
      // updateEnginStatusByGpsOrMobile()

      loggermodule.info("End processSavePosition");
      return responseStatus.response || responseStatus?.result;
    } catch (e) {
      loggermodule.error("Error processSavePosition:" + e.message);
      console.log(e)
      return { success: false, response: e.message };
    }
}

async function updateLastSeen(mergedData){
  console.log('mergedData:', mergedData)
    let scannedTags = process.scannedTags;
    let excludeMacs = [];
    let dataToSetLastSeen = mergedData
          .filter(o => !o.immediate || (o.immediate && !['depositDelivered','delivered'].includes(o.statusTo)))
          // .map((o) => ({
          //   mac: o.macAddr,
          //   engin: o.activeID,
          //   isExit: o.isExit,
          //   lat: o.lat,
          //   lng: o.lng,
          // }))
          .filter((o) => {
            let scannedTag = scannedTags.find((s) => s.macAddr == o.macAddr);
            if (!scannedTag?.lastUpdateSeen) return true;
            return (
              moment().diff(moment(scannedTag.lastUpdateSeen), "minutes") > 2
            );
          });
        
    console.log('dataToSetLastSeen:', dataToSetLastSeen)
    if (dataToSetLastSeen.length > 0) {
      excludeMacs = dataToSetLastSeen
        .filter((t) => t.engin)
        .map((t) => t.macAddr);

      let updateData = dataToSetLastSeen.map(o =>({
        uid: o.activeID,
        last_lat:o.lat,
        last_lng: o.lng,
        lastSeenAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        lastSeenAtTimeZone: moment().format(),
        lastSeenLocationId:o?.WorksiteId || 0,
        lastSeenLocationObject: o?.WorksiteObject || '',
        lastSeenRssi: o.rssi,
        lastSeenDevice: o.deviceType+":"+o.deviceName
      }))

      ssm.bulkUpdate(updateData, 'UpdateEnginFromJson').then(o =>{
        console.log('update response:', o)
      });
      console.log('updateData for last seen : ',updateData);
    }
    return excludeMacs;
}
async function updateLastSeenV0(mergedData){
  
  for (let [, entries] of Object.entries(new_data)) {
    let isExit = entries.find((o) => o.isExit == 1);
    let ids = entries.filter((t) => t.engin).map((t) => t.engin);
    let dataObj = mergedData[0];

    loggermodule.info("Object last seen for address: " + JSON.stringify(dataObj));

    let latlngSet = "", addrSet = "";

    if (dataObj?.lat && dataObj?.lng) {
      latlngSet = `last_lat=${dataObj?.lat} , last_lng=${dataObj?.lng}`;
    }

    if(dataObj?.address) {
      addrSet = `,lastSeenAddress='${dataObj?.address}'`; // Wrap address in single quotes
    }

    let sql = `update Engin set lastSeenAt = '${dateObject.format('YYYY-MM-DD HH:mm:ss')}' ,
                lastSeenAtTimeZone = '${dateObject.format()}',
                lastSeenLocationId = ${dataObj?.WorksiteId || 0},
                lastSeenLocationObject = '${dataObj?.WorksiteObject || ''}',
                ${latlngSet} ${addrSet}
                where uid in (${ids.join(",")})`;
    try {
      loggermodule.info("[Last Seen]:Start updating last seen");

      // bulk update engins
      let res = await ssm.bulkUpdate([
        {
          uid: 40250,
          lastSeenRssi: -100,
          lastSeenDevice: "gateway:FA45778699",
        }
      ], 'UpdateEnginFromJson');
      ssm.execSql(sql).then((response) => {
        if (response.success) {
          loggermodule.info(
            "[Last Seen]:End updating last seen:" + response.success
          );
          if (!isExit) {
            iomodule.emit("engin_last_seen_at", {
              engins: entries
                .filter((o) => o.isExit != 1)
                .map((o) => ({
                  ...o,
                  lastSeen: dateObject.format(),
                })),
            });
          }
        } else
          loggermodule.error(
            "[Last Seen]:Error updating last seen:" +
              JSON.stringify(response)
          );
      });
    } catch (e) {
      loggermodule.error(
        "[Last Seen]:Error updating last seen:" + e.message
      );
    }
  }
}

async function getDeviceName(mode , deviceId){
    let deviceName = '';

    switch(mode){
      case 'gateway':
        deviceName = deviceId
        break;
      case 'mobile':
        let user = (process?.users || []).find( o => o.userID == deviceId);
        if(user){
          deviceName = `${user.firstname} ${user.lastname}`
        }
        break;
      case 'gps':
        deviceName = await getOneVehicule(deviceId)
        break
      default:
        break;
    }

    return deviceName

}

async function processSaveStaffPosition(parsedData, req) {
  try {
    loggermodule.info("Start processSaveStaffPosition:"+parsedData?.length);
    
    let data = req.body;

    let userID = data?.userInfos?.userID || 0;
    let date = moment(data?.date || moment()).format();
    let dateObject = moment(data?.date || moment());


    let gpsData = null

    if(parsedData?.[0]?.deviceType == 'gps'){
      gpsData = parsedData[0].gpsData
    }

    parsedData.forEach( t =>{
      if(t.deviceType && t.deviceId) return
      if (t.gmac) {
        t.deviceType = "gateway";
        t.deviceId = t.gmac
      }
      else if (userID && !isNaN(userID) && +userID > 0) {
        t.deviceType = "mobile";
        t.deviceId = userID
      }
    })

    

    if (!Array.isArray(parsedData)) parsedData = [];
    if (parsedData.length == 0) {
      loggermodule.info("End processSaveStaffPosition");
      return { success: true, response: "Not tags" };
    }


    let latlngs = parsedData.map((t) => ({ lat: t.lat, lng: t.lng }));
    latlngs = _.uniqBy(latlngs, (t) => t.lat + "-" + t.lng);

    let addressInfos = await findAddressForTags(latlngs);

    console.log('addressInfo : ',addressInfos);

    parsedData = parsedData.map((t) => ({
      ...t,
      ...addressInfos.find((o) => o.lat == t.lat && o.lng == t.lng),
    }));
    parsedData = await findGeofenceOfPoints(_.cloneDeep(parsedData));
    
    dataToSendToIo = _.cloneDeep(parsedData);
    let worksites = parsedData
      .filter((o) => o?.worksite?.id || o?.nearest?.id)
      .map((o) => ({
        id: o?.worksite?.id,
        nearestID: o?.nearest?.id,
        geometry:
          o?.worksite?.geometry?.geometry || o?.nearest?.geometry?.geometry,
        label: o?.worksite?.label || o?.worksite?.name || "",
        nearestLabel: o?.nearest?.label || o?.nearest?.name || "",
        nearestDistance: o?.nearest?.nearestDistance,
      }));

    parsedData.forEach((o) => {
      o.LocationID = o.isExit == 1 ? 0 : o?.worksite?.id || 0;
      o.NearestID = o.isExit == 1 ? 0 : o?.nearest?.id || 0;
      o.isFakeLocation = ''
      if(o.LocationID != 0) {
        o.LastLocationID = o.LocationID
        o.LastLocationLat = o.lat
        o.LastLocationLng = o.lng
      }
      delete o.worksite;
      delete o.nearest;
    });

    //parsedData = setLocationIDWhenGpsIsStationary(parsedData);
    
    let dataBeforeRemovingNullMacs =  parsedData;

    //logic to be adapted into staff 
    //parsedData = await updateEnginStatusByGpsOrMobile(parsedData);


    loggermodule.info('PARSED DATA:'+JSON.stringify(parsedData))
    parsedData = parsedData.filter( o => o.macAddr && !o.isFake)
    let procData = [];
    let processData = process.enginList;
    let users = process.users;
    let scannedTags = process.scannedTags;

    if (!Array.isArray(processData)) processData = [];
    if (!Array.isArray(users)) users = [];
    if (!Array.isArray(scannedTags)) scannedTags = [];
    let mergedData = parsedData
      .map((item) => {
        let match = processData.find((entry) => entry.tagname === item.macAddr);

        if (match) {
          return { ...item, ...match };
        }

        return null;
      })
      .filter((item) => item !== null);

    let alreadyUpdated = [];

    let statusObj = {
      'enter': 'reception',
      'exits': 'exit'
    }

    mergedData.forEach((item) => {
      
      let status = "";
      let itemLastScan = _.cloneDeep(scannedTags.find((o) => o.macAddr == item.tagname)) ;
      if(itemLastScan && itemLastScan?.isFakeLocation) itemLastScan.LocationID = 0

      let LocationID = (item.LocationID == 0 || item.isFakeLocation) ? 0 : item.LocationID


      if (
        (LocationID == 0 && item.etatenginname != "sortie") ||
        item.isExit == 1 
      ) {
        status = "exits";
      } else if ((!isNaN(LocationID) && LocationID != 0 /*&& LocationID != item.activeGeofenceID && item.etatenginname != 'reception'*/) || (item.immediate && ['depositDelivered','delivered'].includes(item.statusTo))) {
        status = "enter";
      }

      let distance = null


 

      let isDistanceCheckOK = distance == null || distance >= EXIT_DISTANCE_AFTER_DELIVERY

      
      let actualStatus = status;

      let diff = 0;
      if(itemLastScan?.lastDetection){
        diff = moment().diff(
          moment(itemLastScan.lastDetection, "YYYY-MM-DDTHH:mm:ss"),
          "minutes",
          true
        )
      }

      let needsReset = (status && statusObj[status] != item.etatenginname && itemLastScan?.alreadyUpdated && diff > 25 && !item.immediate)
      
      if (itemLastScan?.LocationID != LocationID ||  
          (itemLastScan && itemLastScan?.activeID != item?.activeID) || needsReset) {
        item.lastDetection = moment().format("YYYY-MM-DDTHH:mm:ss");
        item.alreadyUpdated = false;
        status = null;
      } else {
        if (itemLastScan?.lastDetection) {
          let timeForEvent = item.isExit == 1 ? 10 : 5;
          loggermodule.info("TIME TO WAIT:" + timeForEvent);
          if (diff >= timeForEvent && !itemLastScan.alreadyUpdated) {
            item.alreadyUpdated = true;
            alreadyUpdated.push({ mac: item.macAddr, engin: item.activeID });
          } else {
            status = null;
          }
        }
      }
      if(item.immediate && actualStatus){
        status = actualStatus
        item.alreadyUpdated = true
      }

      loggermodule.info(
        `DATA DIFFF INFO:${item.tagname},enginID:${item.activeID},timeDiff:${diff},alreadyUpdated:${itemLastScan?.alreadyUpdated},statusTo:${status},realStatusTo:${actualStatus},locationID:${LocationID},distance: ${distance}`
      );
      if (status /*&& !item.isFakeLocation*/) {
        let dataToAdd = {
          idEngin: item.activeID,
          tagname: item.tagname,
          LocationID,
          lat: item.lat,
          lng: item.lng,
          address: (item.address || "").toString().replace(/'/g, "."),
          city: item.city,
          country: item.country,
          postal_code: item.postal_code,
          status: status,
          mode: item.deviceType,
          src : 'staff'
        };

        if (
          status == "enter" &&
          item.etatenginname == "reception" &&
          item.LocationID != item.activeGeofenceID &&
          item.activeGeofenceID != 0 &&
          !item.alreadyExit
        ) {
          let dataToAdd2 = _.cloneDeep(dataToAdd);
          dataToAdd2.LocationID = item.activeGeofenceID;
          dataToAdd2.status = "exits";
          loggermodule.info(
            `[Exit]: Exiting ${dataToAdd2.tagname} before enter`
          );
          procData.push(dataToAdd2);
          item.alreadyUpdated = false;
          item.alreadyExit = true;
          alreadyUpdated = alreadyUpdated.filter((o) => o.mac != item.tagname);
        } else {
          procData.push(dataToAdd);
        }
      }
    });


    loggermodule.info("AlreadyUpdated:" + JSON.stringify(alreadyUpdated));
    loggermodule.info("DATA passed to proc : " + JSON.stringify(procData));

    // create data to send to flespi
    let flespiData = dataBeforeRemovingNullMacs
      .map((t) => {
        if(t.macAddr == null) t.macAddr = '00'
        let engin = processData.find((o) => o.tagname === t.macAddr);
        let user = users.find((o) => o.userID == data?.userInfos?.userID);
        let worksite = worksites.find(
          (o) => o.id == t.LocationID || o.nearestID == t.NearestID
        );

        return {
          ...t,
          date: moment(data.date).unix(),
          dateFormated: moment(data.date).format(),
          userID: data?.userInfos?.userID || 0,
          gateway: t?.gmac || "",
          engin: engin?.activeReference || "",
          enginId: engin?.activeID || 0,
          enginState: engin?.etatenginname || "",
          enginStateName: engin?.etatengin || "",
          user: ((user?.firstname || "") + " " + (user?.lastname || "")).trim(),
          userRole: user?.famille || "",
          userImage: user?.image,
          userMail: user?.addrMail,
          locationGeometry: worksite?.geometry || null,
          locationName: worksite?.label,
          nearestLocationName: worksite?.nearestLabel,
          nearestDistance: worksite?.nearestDistance,
          inGeofence: t.LocationID == 0 ? 'no' : 'yes',
          stationaryLat: t?.stationaryLat,
          stationaryLng: t?.stationaryLng
        };
      })
      .filter((o) => o.isExit != 1 && !(o.statusTo == 'delivered' && o.immediate == 1));

    // send data to flespi
    sendTagsToFlespi(flespiData);


    //console.log('date with time zone : ',date);

    loggermodule.info('date with timezone : '+ date);


    let params = [
      {
        name: "data",
        type: TYPES.NVarChar,
        value: JSON.stringify(procData),
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
    ];

    // if (data?.date) {
      
    // }

    params.push({
      name: "date",
      type: TYPES.NVarChar,
      value: date,
    });

    let responseStatus = { success: true, response: "No update needed" };
    loggermodule.info("START enterExit process");

    
    if (procData.length > 0) {
      loggermodule.info(
        "Start tag_updatedSavePosition:" + JSON.stringify(procData)
      );
      responseStatus = await ssm.execProc("tag_updatedSavePosition", params); 
      loggermodule.info("End tag_updatedSavePosition");
    } else {
      loggermodule.info(
        "End tag_updatedSavePosition:" + JSON.stringify(responseStatus)
      );
    }
    try {

      let activeRes = responseStatus?.result?.[0]?.activeResult || "";

      if (responseStatus?.success && activeRes && activeRes.includes("{")) {
        

        //process.enginList = JSON.parse(activeRes);
        console.log('engin list inside ',);
        activeRes = JSON.parse(activeRes); 
        loggermodule.info('Engin data after tag_updatedSavePosition:'+JSON.stringify(activeRes));
        activeRes.forEach( o => {
          let old = procData.find( t => t.tagname == activeRes.tagname);
          if(old) o.status = old.status
        })

        mergedData = mergedData.map( o => {
            let enginO = activeRes.find( t => t.tagname == o.tagname);
            if(enginO){
              return {...o, ...enginO}
            }
            return { ... o}
        })

        process.enginList = activeRes
        // emitUpdateEngins(process.enginList);

        setTimeout(()=>fetchEnginAndEmitUpdate(procData.map(o=>o.idEngin)) , 10000)


        emitUpdateWorksiteStats();
      }
    } catch (e) {
      loggermodule.error("Error parsing activeResult:" + e.message);
    }

    let excludeMacs = [];
    let tagsBatteryUpdated = []
    if (!data.date && mergedData.length > 0) {
      let dataToSetLastSeen = mergedData
        .filter(o => !o.immediate || (o.immediate && o.statusTo != 'delivered'))
        .map((o) => ({
          mac: o.macAddr,
          engin: o.activeID,
          isExit: o.isExit,
          lat: o.lat,
          lng: o.lng,
        }))
        .filter((o) => {
          let scannedTag = scannedTags.find((s) => s.macAddr == o.mac);
          if (!scannedTag?.lastUpdateSeen) return true;
          return (
            moment().diff(moment(scannedTag.lastUpdateSeen), "minutes") > 2
          );
        });
      
      console.log('dataToSetLastSeen:', dataToSetLastSeen)
      if (dataToSetLastSeen.length > 0) {
        excludeMacs = dataToSetLastSeen
          .filter((t) => t.engin)
          .map((t) => t.mac);
        let new_data = _.groupBy(
          dataToSetLastSeen,
          (dt) => `${dt.lat}-${dt.lng}`
        );
        loggermodule.info("GROUPS:" + JSON.stringify(new_data));
        for (let [, entries] of Object.entries(new_data)) {
          let isExit = entries.find((o) => o.isExit == 1);
          let ids = entries.filter((t) => t.engin).map((t) => t.engin);
          let dataObj = mergedData[0];

          loggermodule.info("Object last seen for address: " + JSON.stringify(dataObj));

          let latlngSet = "", addrSet = "";

          if (dataObj?.lat && dataObj?.lng) {
            latlngSet = `last_lat=${dataObj?.lat} , last_lng=${dataObj?.lng}`;
          }

          if(dataObj?.address) {
            addrSet = `,lastSeenAddress='${dataObj?.address}'`; // Wrap address in single quotes
          }

          let sql = `update staff set lastSeenAt = '${dateObject.format('YYYY-MM-DD HH:mm:ss')}' ,
                      lastSeenAtTimeZone = '${dateObject.format()}',
                     ${latlngSet} ${addrSet}
                     where uid in (${ids.join(",")})`;
          try {
            loggermodule.info("[Last Seen]:Start updating last seen");
            ssm.execSql(sql).then((response) => {
              if (response.success) {
                loggermodule.info(
                  "[Last Seen]:End updating last seen:" + response.success
                );
                if (!isExit) {
                  iomodule.emit("engin_last_seen_at", {
                    engins: entries
                      .filter((o) => o.isExit != 1)
                      .map((o) => ({
                        ...o,
                        lastSeen: dateObject.format(),
                      })),
                  });
                }
              } else
                loggermodule.error(
                  "[Last Seen]:Error updating last seen:" +
                    JSON.stringify(response)
                );
            });
          } catch (e) {
            loggermodule.error(
              "[Last Seen]:Error updating last seen:" + e.message
            );
          }
        }
      }
      tagsBatteryUpdated = await updateBatteryLevelAfterScan(mergedData);
    }
    // emit event for new flespi datas
    iomodule.emit("new_tags_logs", {
      data: flespiData.map( o => ({
        ...o,
        'server.timestamp': moment().subtract(moment().parseZone().utcOffset(), 'minutes').unix()
      })),
      userInfo: {
        socket: process.socket_id,
        ...(data.userInfos || {}),
      },
    });
    if (
      responseStatus?.success ||
      responseStatus?.response == "No update needed"
    ) {
      saveTagsHistory(
        mergedData.map((o) => ({ ...o, macAddr: o.macAddr })),
        excludeMacs, {tagsBatteryUpdated}
      );
      if (responseStatus?.response !== "No update needed") {
        removeTagsAfterExitByGateway(procData);
      }
    }

    if(gpsData){
      gpsData.lastLat = gpsData['position.latitude']
      gpsData.lastLng = gpsData['position.longitude']
      gpsData.lastSpeed = gpsData['position.speed']
      saveGpsHistories(gpsData);
    }
    // updateEnginStatusByGpsOrMobile()

    loggermodule.info("End processSaveStaffPosition");
    return responseStatus.response || responseStatus?.result;
  } catch (e) {
    loggermodule.error("Error processSaveStaffPosition:" + e.message);
    console.log(e)
    return { success: false, response: e.message };
  }
}


async function processChangeStatus(parsedData, req) {
    try {
        
        // START PROCESS CHANGE STATUS 

        loggermodule.info("Start processChangeStatus");
        parsedData = _.uniqBy(parsedData, 'macAddr');

        loggermodule.info('parsed Data : ' + JSON.stringify(parsedData));

        let finalResult =[];
        let data = req.body;

        let response = {success: true , response: 'No update needed'}
        let userID = data?.userInfos?.userID || 0;

        if (!Array.isArray(parsedData)) parsedData = [];
        if (parsedData.length == 0) {
        loggermodule.info("End processChangeStatus");
        return { success: true, response: "Not tags" };
        }

        // GET ALL NECESSARY LISTS FOR THIS PROCESS
        let usersList = process.users;
        let transitionList = process.transitionList;
        let enginsList = process.enginList;
        let authorisationList = process.authorisationTransList;

        if(!Array.isArray(usersList)) usersList=[];
        if(!Array.isArray(transitionList)) transitionList=[];
        if(!Array.isArray(enginsList)) enginsList=[];
        if(!Array.isArray(authorisationList)) authorisationList=[];


        // GET THE PROFILE ID BASED ON USERSLIST FROM DB 
        let userTypeId = usersList.find((user) => user.userID == userID)?.typeId || 0;

        // GET MODE BASED ON EXISTS OF GMAC IN DATA 
        const mode = parsedData.some(item => item.gmac) ? "GATEWAY" : "MOBILE";

        console.log('mode here : ',mode);
        console.log('user id : ',userID);


        // TAKE THE NECESSARY INFORMATIONS FROM THE DATA PASSED BY PARAM AND GET THE STATUS OF GATEWAY FROM GATEWAY LIST
        let updatedParsedData = parsedData.map((dataItem) => {
            let matchingGateway = process.gateway.find(
                (g) => g.label === dataItem.gmac
            );

            if (matchingGateway) {
                return {
                  ...dataItem,
                  gmac: dataItem.gmac,
                  macAddr: dataItem.macAddr,
                  statusGateway: matchingGateway.statusGateway,
                };
            }

            return dataItem;
        });



        loggermodule.info("updatedParsedData : " + JSON.stringify(updatedParsedData));

        console.log("CHECK AUTHORISATION LIST : ", authorisationList);
        console.log("TRANSITION LIST : ", transitionList);

        // FILL ISAUTHORISED ARRAY LIST IF THE CONDITIONS FROM TRANSITION LIST IS TRUE COMPARED TO THE PARAMS RECEIVED
        let isAuthorised = 0;

        updatedParsedData.forEach((data) => {

            let foundAuth = authorisationList.filter((auth) => {
            if( (auth.destStatus == data.statusGateway &&  userID==0 && mode=='GATEWAY' 
                && auth.moyenValue.trim()==mode && auth.moyenType=='Mode') || 
            (auth.destStatus == data.statusGateway && auth.moyenType == "profileId" 
                && auth.moyenValue.trim() ==userTypeId.toString() && mode !== 'GATEWAY')) {
                isAuthorised = 1;
                return true;  
            }         
            return false;
            });
            
            if (foundAuth) return true;
            
            return false;
        
        });

        console.log("is Authrised : ", isAuthorised);

        /* IF isAuthorised variable is set to 1 : START THE PROCESS => GET THE ACTUAL STATUS OF ENGINS PASSED BY PARAM 
        AND FILTER ONLY THE ONES THAT QUALIFIED TO CHANGE STATUS BASED ON GATEWAY STATUS MODE */
        
        if (isAuthorised == 1 || !0 ) {
        if (Array.isArray(updatedParsedData)) {
            let arrGate = [];

            updatedParsedData.forEach((item) => {
              const findEngin = enginsList.find(
                  (eng) => eng.tagname == item.macAddr
              );

              // Get only tags that are linked to engins 
              if(findEngin){
                  let objGateway = {
                  ...item,
                  statusname: findEngin.statusname,
                  lastDetection : findEngin.lastSeenAt,
                  enginId: Number(findEngin.activeID),
                  };
                  arrGate.push(objGateway);
              }
            });

            console.log("array Gateway: ", arrGate);
            // Filter only engins whose status are different from the updated status
            finalResult = arrGate.filter( o => o.statusGateway !== o.statusname)

            console.log("After removing already updated engins:", finalResult);

            // Filtering arrayGateway based on the transitionList
            finalResult = arrGate.filter((gateway) => {
                return transitionList.find((transition) => (
                  gateway.statusname === transition.statusFrom &&
                  gateway.statusGateway === transition.statusTo
                ));
            });

            //Filter items  sup 5min
              let oldEngins = process.tagsScannedForStatus
              if(!Array.isArray(oldEngins)) oldEngins = []
              let dataToProcess = []


              finalResult.forEach(o => {
                let status = o.statusGateway;
                let actualStatus = status
                let old = oldEngins.find( t => t.enginId == o.enginId)
                let diff = 0

                if(old?.statusname != o?.statusGateway){
                    o.beginChangeAt = moment().format("YYYY-MM-DDTHH:mm:ss");
                    o.alreadyUpdated = false;
                    o.statusname = o?.statusGateway
                    status = null
                }else{
                    o.statusname = o?.statusGateway
                    if (old?.beginChangeAt) {
                    diff = moment().diff(
                        moment(old.beginChangeAt, "YYYY-MM-DDTHH:mm:ss"),
                        "minutes",
                        true
                    );
                    let timeForEvent = o.isExit == 1 ? 10 : TIME_BEFORE_CHANGE_STATUS_FROM_GATEWAY;
                    if (diff >= timeForEvent && !old.alreadyUpdated) {
                        o.alreadyUpdated = true;
                    }else{
                        status = null
                    }
                    }
                }

                loggermodule.info(
                    `STATUS CHANGE DIFFF INFO:${o.macAddr},${o.enginId},${diff},${old?.alreadyUpdated},${status},${actualStatus}`
                );

                setStatusScannedTags(finalResult)
                if(!status){
                    let t = {...o}
                    delete t.beginChangeAt
                    delete t.alreadyUpdated
                    dataToProcess.push(t);
                }
            })

            if(dataToProcess.length > 0){
            loggermodule.info("DATA dataToProcess" + JSON.stringify(dataToProcess));
            response = await updateStatus(dataToProcess.map(item => ({...item, mode:mode})) );
            }
            
        }

        console.log('final Result : ',finalResult);


        /* SEND FINALRESULT ( WITH ALL THE QUALIFIED ENGINS THAT THEIR STATUS WILL BE CHANGED BASED ON GATEWAY  ) 
        TO BE EXECUTED IN engin_updateStatus STORED PROCEDURE */

        
        } else{
        loggermodule.info('STATUS CHANGE NOT AUTHORIZED')
        }
        loggermodule.info("End processChangeStatus");
        return response
    } catch (e) {
        loggermodule.error(`Error processChangeStatus :` + e.message);
        return null
    }
}

async function processChangeStaffStatus(parsedData, req) {
  try {
      
      // START PROCESS CHANGE STATUS 

      loggermodule.info("Start processChangeStaffStatus");
      parsedData = _.uniqBy(parsedData, 'macAddr');

      loggermodule.info('parsed Data : ' + JSON.stringify(parsedData));

      let finalResult =[];
      let data = req.body;

      let response = {success: true , response: 'No update needed'}
      let userID = data?.userInfos?.userID || 0;

      if (!Array.isArray(parsedData)) parsedData = [];
      if (parsedData.length == 0) {
      loggermodule.info("End processChangeStaffStatus");
      return { success: true, response: "Not tags" };
      }

      // GET ALL NECESSARY LISTS FOR THIS PROCESS
      let usersList = process.users;
      let transitionList = process.transitionList;
      let enginsList = process.enginList;
      let authorisationList = process.authorisationTransList;

      if(!Array.isArray(usersList)) usersList=[];
      if(!Array.isArray(transitionList)) transitionList=[];
      if(!Array.isArray(enginsList)) enginsList=[];
      if(!Array.isArray(authorisationList)) authorisationList=[];


      // GET THE PROFILE ID BASED ON USERSLIST FROM DB 
      let userTypeId = usersList.find((user) => user.userID == userID)?.typeId || 0;

      // GET MODE BASED ON EXISTS OF GMAC IN DATA 
      const mode = parsedData.some(item => item.gmac) ? "GATEWAY" : "MOBILE";

      console.log('mode here : ',mode);
      console.log('user id : ',userID);


      // TAKE THE NECESSARY INFORMATIONS FROM THE DATA PASSED BY PARAM AND GET THE STATUS OF GATEWAY FROM GATEWAY LIST
      let updatedParsedData = parsedData.map((dataItem) => {
          let matchingGateway = process.gateway.find(
              (g) => g.label === dataItem.gmac
          );

          if (matchingGateway) {
              return {
                ...dataItem,
                gmac: dataItem.gmac,
                macAddr: dataItem.macAddr,
                statusGateway: matchingGateway.statusGateway,
              };
          }

          return dataItem;
      });



      loggermodule.info("updatedParsedData : " + JSON.stringify(updatedParsedData));

      console.log("CHECK AUTHORISATION LIST : ", authorisationList);
      console.log("TRANSITION LIST : ", transitionList);

 
      if (Array.isArray(updatedParsedData)) {
          let arrGate = [];

          updatedParsedData.forEach((item) => {
            const findEngin = enginsList.find(
                (eng) => eng.tagname == item.macAddr
            );

            // Get only tags that are linked to engins 
            if(findEngin){
                let objGateway = {
                ...item,
                statusname: findEngin.statusname,
                lastDetection : findEngin.lastSeenAt,
                enginId: Number(findEngin.activeID),
                };
                arrGate.push(objGateway);
            }
          });

          console.log("array Gateway: ", arrGate);
      
          console.log("After removing already updated engins:", finalResult);


          //Filter items  sup 5min
            let oldEngins = process.tagsScannedForStatus
            if(!Array.isArray(oldEngins)) oldEngins = []
            let dataToProcess = []
            console.log('olddddd:', oldEngins)


          /*  finalResult.forEach(o => {
              let status = o.statusGateway;
              let actualStatus = status
              let old = oldEngins.find( t => t.enginId == o.enginId)
              let diff = 0

              if(old?.statusname != o?.statusGateway){
                  o.beginChangeAt = moment().format("YYYY-MM-DDTHH:mm:ss");
                  o.alreadyUpdated = false;
                  o.statusname = o?.statusGateway
                  status = null
              }else{
                  o.statusname = o?.statusGateway
                  if (old?.beginChangeAt) {
                  diff = moment().diff(
                      moment(old.beginChangeAt, "YYYY-MM-DDTHH:mm:ss"),
                      "minutes",
                      true
                  );
                  let timeForEvent = o.isExit == 1 ? 10 : TIME_BEFORE_CHANGE_STATUS_FROM_GATEWAY;
                  if (diff >= timeForEvent && !old.alreadyUpdated) {
                      o.alreadyUpdated = true;
                  }else{
                      status = null
                  }
                  }
              }

              loggermodule.info(
                  `STATUS CHANGE DIFFF INFO:${o.macAddr},${o.enginId},${diff},${old?.alreadyUpdated},${status},${actualStatus}`
              );

              setStatusScannedTags(finalResult)
              if(!status){
                  let t = {...o}
                  delete t.beginChangeAt
                  delete t.alreadyUpdated
                  dataToProcess.push(t);
              }
          })*/

          dataToProcess.push(finalResult);

          if(dataToProcess.length > 0){
          loggermodule.info("DATA dataToProcess" + JSON.stringify(dataToProcess));
          response = await updateStatus(dataToProcess.map(item => ({...item, mode:mode})) );
          }
          
      }

      console.log('final Result : ',finalResult);


      /* SEND FINALRESULT ( WITH ALL THE QUALIFIED ENGINS THAT THEIR STATUS WILL BE CHANGED BASED ON GATEWAY  ) 
      TO BE EXECUTED IN engin_updateStatus STORED PROCEDURE */

      loggermodule.info("End processChangeStaffStatus");
      return response
  } catch (e) {
      loggermodule.error(`Error processChangeStaffStatus :` + e.message);
      return null
  }
}

async function getOneVehicule(deviceId){
  let listVehicules = await executeNavixy('tracker/list');
  if(!Array.isArray(listVehicules?.list)) listVehicules.list = []
  return listVehicules.list.find(vehicle => vehicle.source.device_id == deviceId)?.label || "";
}

async function updateStatus(data ,req , emit_update) {
    try {
        loggermodule.info('[updateStatus]: Start updateStatus')

        let listVehicules = await executeNavixy('tracker/list');
        if(!Array.isArray(listVehicules?.list)) listVehicules.list = []
        //console.log('listVehicules' , listVehicules);


        let enginId = data.map((item) => ({ enginId: item.enginId , rssi: item.rssi || null}));
        let status = data.length > 0 ? data[0].statusGateway || data[0].statusTo : "";
        let mode = data[0].mode;

        let LocationIDParam = mode == 'gps' ? data[0].LocationID : parseInt(data[0].locationID)
        //let LocationIDParam =  parseInt(data[0].locationID) || data[0].LocationID

        let vehiculeLabel = listVehicules.list.find(vehicle => vehicle.source.device_id == data[0].deviceId)?.label || "";

        let deviceName = ['potential_delivered_job', 'gps'].includes(mode) ? vehiculeLabel : data[0].gmac || ""


        loggermodule.info('data for changing status' + JSON.stringify(data[0]));
        loggermodule.info('LocationIDParam : ' + LocationIDParam.toString());
        loggermodule.info('deviceName : ' + deviceName.toString());

        let params = [
          {
              name: "enginId",
              type: TYPES.NVarChar,
              value: JSON.stringify(enginId),
          },
          {
              name: "status",
              type: TYPES.NVarChar,
              value: status,
          },
          {
              name: "mode",
              type: TYPES.NVarChar,
              value: mode,
          },
          {
            name: "deviceName",
            type: TYPES.NVarChar,
            value: deviceName || "",
          },
          {
            name: "locationID",
            type: TYPES.Int,
            value: LocationIDParam || 0,
          },
          {
            name: "locationObject",
            type: TYPES.NVarChar,
            value: data[0].locationObject || '',
          },
          {
            name: "lat",
            type: TYPES.Float,
            value: data[0].lat || 0,
          },
          {
            name: "lng",
            type: TYPES.Float,
            value: data[0].lng || 0,
          },
          {
              name: "point_attachement",
              type: TYPES.Int,
              value: req?.userInfos?.attachement || 1,
          },
          {
              name: "user",
              type: TYPES.Int,
              value: req?.userInfos?.userID || 0,
          },
        ];

        let params2 = params.map(o => `@${o.name}=${typeof o.value == 'string' ? `'${o.value}'`:o.value}`).join(', ')
        console.log('params2', params2)
        loggermodule.info(`[UPDATE ENGIN]: Engins to update to ${status}: ${JSON.stringify(enginId)} `)
        let response = await ssm.execProc("engin_updateStatus", params);
        loggermodule.info(`[UPDATE ENGIN]: ${JSON.stringify(response)}`)
        loggermodule.info("End updating Engin status");

        if(response?.success && emit_update !== false){
            setTimeout(()=> fetchEnginAndEmitUpdate(data.map((item) =>  item.enginId )) , 6000)
        }
        if(response.success){
          updateTagsInHistory(data.map( t =>({
            macAddr: t.macAddr,
            statusname: status,
            startStatusWatchAt: null,
            startStationaryStatusWatchAt: null
          })), true) 


          if(['delivered' , 'potentialDelivered', 'depositDelivered'].includes(status)){
              removeTagsFromHistory(data.map( t => t.macAddr))
          }


        }

        let detail = response?.result?.[0] || response?.result || response;
        if(typeof detail == 'string'){
          try{
            detail = JSON.parse(detail)
          }catch(e){

          }
        }
        let history = {
          engins: data.map( t => t.activeReference || t.macAddr),
          statusTo: status,
          requestParams: params.map(o =>`@${o.name}=${typeof o.value == 'string' ? `'${o.value}'`:o.value}`).join(','),
          response: {
            success: response?.success,
            detail
          },
          at: moment().format()
        }
        saveStatusHistory(history);
        return response

    } catch (e) {
        loggermodule.error(`Error updating Engin status :` + e.message+'-'+e.stack);
        return { success: false , response: e.message}
    }
}
  
function setStatusScannedTags(engins){
    try{
        let oldEngins = process.tagsScannedForStatus
        if(!Array.isArray(oldEngins)) oldEngins = []

        let ids = oldEngins.map(o => +o.enginId);
        let newData = [...engins.filter(t => !ids.includes(+t.enginId))]
        oldEngins.forEach( o => {
        let newEng = engins.find( t => t.enginId == o.enginId)
        if(newEng) newData.push({...o , ...newEng})
        })
        process.tagsScannedForStatus = newData
    }catch(e){
        loggermodule.error('[setStatusScannedTags] error setStatusScannedTags:'+e.message)
    }
}
  
async function fetchEnginAndEmitUpdate(ids){
    loggermodule.info('EMITING ENGIN UPDATE:'+JSON.stringify(ids))
    let params = [
        {
          name: "page",
          type: TYPES.Int,
          value: 1,
        },
        {
            name: "enginIds",
            type: TYPES.NVarChar,
            value: ids.join(','),
          }
    ]
    let response = await ssm.execProc("ENGIN_LIST",params)
    if(Array.isArray(response?.result)){
        // process.enginList = process.enginList.map( o => {
        //   let t = response.result.find( s => s.uid == o.activeID)
        //   if(t){
        //       o.statusname = t.statusname
        //   }
        //   return o
        // })
        iomodule.emit("new_updated_engins", {
        engins: response?.result
        });

        loggermodule.info('END EMITING ENGIN UPDATE:'+JSON.stringify(response?.result))
    }else{
        loggermodule.info('END EMITING ENGIN UPDATE: No engin fetched')
    }
}

async function findAddressForTags(data) {
    for (let tag of data) {
      tag.address = "";
      tag.city = "";
      tag.country = "";
      tag.postal_code = "";
  
      let addrResponse = await findAddress({ lat: tag.lat, lng: tag.lng });
  
      if (addrResponse.success) {
        let response = addrResponse.response;
        if (response && response.address) {
          tag.address = response.address;
          tag.city = response.city;
          tag.country = response.country;
          tag.postal_code = response.postal_code ?? "";
        }
      }
    }
  
    return data;
}

function isEnginsNeedsChangeStatus(data){
      let response = { response: false , data: [] }
      try{
          if(!Array.isArray(data) || data?.length == 0) return response
          let scannedTags = _.cloneDeep(process.scannedTags);
          let customer_worksites = _.cloneDeep(process.customer_worksites);
          let sub_deposites = _.cloneDeep(process.sub_deposites);
          
          if(!Array.isArray(scannedTags) || scannedTags?.length == 0) scannedTags = []
          if(!Array.isArray(customer_worksites)) customer_worksites = []
          if(!Array.isArray(sub_deposites)) sub_deposites = []
          

          let updateEnginStatusChangeStartWatch = [];

          let current_data_macs = data.map(o => o.macAddr)


          let isFake = data.length == 1 && data[0].isFake

          let customer_worksitesIds = customer_worksites.map( o => +o.geofenceID)
          let sub_depositeIds = sub_deposites.map( o => +o.geofenceID)
          console.log('customer_worksitesIds:%s',customer_worksitesIds)
          console.log('sub_depositeIds:%s',sub_depositeIds)
          console.log('Transitions:%s',JSON.stringify(process.transitionList))
          let oldScannedTags = _.cloneDeep(scannedTags);
          let dataInfos = data[0];
          
          let currentLatLng = {lat: dataInfos?.lat , lng: dataInfos?.lng};

          data.forEach( o => {
            o.inLastScanned = true
          })

          scannedTags = scannedTags.map(t => {
              let newData = data.find( o=> t.macAddr == o.macAddr);
              if(newData){
                return {
                  ...t,
                  ...newData
                }
              }
              return t
          })

          let scannedMacs = scannedTags.map(t => t.macAddr)

          data.forEach( t => {
            if(!scannedMacs.includes(t.macAddr))
              scannedTags.push(t)
          })

          let gpsData = scannedTags.filter( o => o.deviceType == dataInfos?.deviceType && o.deviceId == dataInfos?.deviceId);


          console.log('gpsData 2:',scannedTags)
          
          if(gpsData.length == 0) return response;

          // gpsData = setLocationIDWhenGpsIsStationary(data , gpsData);

          let enginList = process.enginList;
          let locsDist = _.uniqBy(gpsData , o => o.lat+'-'+o.lng)
                          .reduce((c , v)=>{
                              c[v.lat+'-'+v.lng] = calculateDistance({lat: v.lat , lng: v.lng}, currentLatLng);
                              return c
                          }, {});

          if(!Array.isArray(enginList)) enginList = [];

          gpsData = gpsData.map( o =>{
                              let t= {...o}
                              t.distance = locsDist[o.lat+'-'+o.lng]
                              return t
                            })
        
          let lastSeenInGeofence = gpsData
                                      .filter( o => !isNaN(o.LocationID) && o.LocationID != 0)
                                      .map( t => {
                                        if(!t.startStatusWatchAt || current_data_macs.includes(t.macAddr) || t.LocationID == dataInfos?.LocationID) {
                                          let oldScanned =  oldScannedTags.find(o => o.macAddr === t.macAddr)
                                          let tag =  {
                                            macAddr: t.macAddr,
                                            startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                          }
                                          if(oldScanned == undefined){
                                            tag = {
                                              ...t,
                                              macAddr: t.macAddr,
                                              startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                            }
                                          }
                                          updateEnginStatusChangeStartWatch.push(tag)
                                          return null
                                        }else {
                                          let diff = moment().diff(
                                              moment(t.startStatusWatchAt, "YYYY-MM-DDTHH:mm:ss"),
                                              "minutes",
                                              true
                                          )
                                          loggermodule.info(`${t.macAddr} STATUS WATCH DIFF:${diff}`)
                                          return {
                                            ...t,
                                            statusDiff: diff
                                          }
                                        }
                                      }).filter(o => o)

          let seenInDeposit = +PROCESS_IN_DEPOSIT_WHEN_ENTER !== 1 ? [] : lastSeenInGeofence.filter(
            o => (
                  !isFake && 
                  o.statusDiff > 0.5 && 
                  !customer_worksitesIds.includes(+o.LocationID) 
                )
          )

          
          let inLastLocation = _.uniqBy(lastSeenInGeofence , 'macAddr');
          let seenAfterLastLocation = isFake ? [] : gpsData.filter( o => (isNaN(o.LocationID) || o.LocationID == 0));
          seenAfterLastLocation = _.uniqBy (seenAfterLastLocation, 'macAddr')

          let seenAroundStationaryArea = []

          if(PROCESS_DELIVERY_IF_NOT_SEEN_FOR_WHILE == 1){
            seenAroundStationaryArea = gpsData.filter( o => {
              let engin = enginList.find(t => t.tagname == o.macAddr);
              if((isNaN(o.LocationID) || o.LocationID == 0) && 
                        o.stationaryLocationID && 
                        o.stationaryLat && 
                        o.stationaryLng && 
                        !current_data_macs?.includes(o.macAddr) &&
                        engin?.activeID &&
                        !['pickupReturn', 'delivered' , 'potentialDelivered', 'depositDelivered'].includes(o?.statusname)
                ){
                  if(!o.startStationaryStatusWatchAt){
                    loggermodule.info('NO STATIONARY WATCH FORM:'+o.macAddr)
                    updateEnginStatusChangeStartWatch.push({
                      macAddr: o.macAddr,
                      startStationaryStatusWatchAt: moment().format("YYYY-MM-DDTHH:mm:ss")
                    })
                    return false
                  }

                  let diff = moment().diff(
                    moment(o.startStationaryStatusWatchAt, "YYYY-MM-DDTHH:mm:ss"),
                    "minutes",
                    true
                  )

                  loggermodule.info(`LOCATION0 POTENTIALYDELIVERED DIFF FOR [${o.macAddr}]:${diff} - TIME_BEFORE_DELIVERED_IF_LOCATION0:${TIME_BEFORE_DELIVERED_IF_LOCATION0}`)
                  return diff >= TIME_BEFORE_DELIVERED_IF_LOCATION0
              }
              return false
            }).map( o=> ({
              ...o,
              LocationID: o.stationaryLocationID,
              lat: o.stationaryLat,
              lng: o.stationaryLng,
              stationaryLat: o.stationaryLat,
              stationaryLng: o.stationaryLng,
              isFakeLocation: true
            }));
          }
          
          if(seenAroundStationaryArea.length > 0)
            loggermodule.info('SEEN AROUND STATIONARY AREA:'+JSON.stringify(seenAroundStationaryArea))

          // seenAroundStationaryArea = []
          let seenAfterLastLocationIds = seenAfterLastLocation.map( o => o.macAddr);
          console.log('lastSeenInGeofence:', lastSeenInGeofence)
          console.log('inLastLocation:', inLastLocation)
          console.log('seenAfterLastLocation:', DISTANCE_BEFORE_DELIVERY , TIME_BEFORE_DELIVERY)
          let inGeo = o => customer_worksitesIds.includes(+o.LocationID) || o.isFakeLocation || sub_depositeIds.includes(+o.LocationID)
          let isInRealGeo = o => customer_worksitesIds.includes(+o.LocationID) || sub_depositeIds.includes(+o.LocationID)
          let delivered =  inLastLocation.filter( o => !current_data_macs.includes(o.macAddr) && !seenAfterLastLocationIds.includes(o.macAddr) && inGeo(o) && o.distance >  DISTANCE_BEFORE_DELIVERY && o?.statusDiff >= (o.isFakeLocation && !isInRealGeo(o) ? TIME_BEFORE_POTENTIAL_DELIVERY : TIME_BEFORE_DELIVERY ));
          console.log('delivered:', delivered)

          let deliveredMacs = [...delivered , ...seenAroundStationaryArea].map( o => o.macAddr)
          delivered = [/*...delivered ,*/ ...seenAroundStationaryArea].map( o => {
             let eng = enginList.find(t => t.tagname == o.macAddr );
             let t = {
              ...o,
              enginId: eng?.activeID,
              statusname: eng?.statusname,
             }

             let $status = null;

             if(customer_worksitesIds.includes(+o.LocationID)) $status = 'delivered'
             else if(sub_depositeIds.includes(+o.LocationID)) $status = 'depositDelivered'
             else $status = 'potentialDelivered';

             t.statusTo = getEnginStatusTo(t ,  $status )
             return t
          }).filter( o => o.enginId && ['delivered','potentialDelivered','depositDelivered'].includes(o.statusTo) )
          console.log('delivered2:', delivered)
          loggermodule.info('seenAfterLastLocation:'+JSON.stringify(seenAfterLastLocation))

          let pickupReturn = []
          /*seenAfterLastLocation
                                .filter( o =>!deliveredMacs.includes(o.macAddr))
                                .map( o => {
                                    let eng = enginList.find(t => t.tagname == o.macAddr );
                                    let distance = -1
                                    if(eng){
                                      if(o.activeLocationID && customer_worksitesIds.includes(o.activeGeofenceID)){

                                        loggermodule.info('id geofence work dep test ' + o.activeLocationID)

                                        let dist = distanceToGeofenceByID(o.activeLocationID , {lat: +o.lat , lng: +o.lng})
                                        if(dist.distance && !isNaN(dist.distance)){
                                          distance = dist.distance
                                        }else{
                                          loggermodule.error(`[PICKUPRETURN]:DISTANCE TO GEOFENCE ERROR:${JSON.stringify(dist)}`)
                                        }
                                      }else{
                                        loggermodule.error(`[PICKUPRETURN]: NO ACTIVE_LOCATION_ID`)
                                      }
                                      if(distance == -1){
                                        if (!isNaN(o.activeLocationLAT) && 
                                        !isNaN(o.activeLocationLNG)){
                                          distance = calculateDistance(
                                            { lat: +o.activeLocationLAT, lng: +o.activeLocationLNG },
                                            { lat: +o.lat, lng: +o.lng });
                                        }else{
                                          loggermodule.info(`PICKUP RETURN INVALID COORDS FOR [${o.activeReference}] - [${o.macAddr}]: lat : ${o.activeLocationLAT} + lng : ${o.activeLocationLNG}`);
                                        }
                                      }
                                      
                                    }
                                    let t = {
                                      ...o,
                                      enginId: eng?.activeID,
                                      statusname: eng?.statusname,
                                      distance
                                     }
                                     t.statusTo = getEnginStatusTo(t , 'pickupReturn')
                                     return t
                                  })
                                .filter( o => o.enginId && 'pickupReturn' == o.statusTo && (DISTANCE_BEFORE_PICKUPRETUREN == 0 || (o.distance && o.distance > DISTANCE_BEFORE_PICKUPRETUREN)))*/
          
          let pickup = seenAfterLastLocation
                                .filter( o =>!deliveredMacs.includes(o.macAddr))
                                .map( o => {
                                    let eng = enginList.find(t => t.tagname == o.macAddr );
                                    let t = {
                                      ...o,
                                      enginId: eng?.activeID,
                                      statusname: eng?.statusname,
                                     }
                                     t.statusTo = getEnginStatusTo(t , 'pickup')
                                     return t
                                    })
                                .filter( o => o.enginId && 'pickup' == o.statusTo)

         
          
          let outside = [...pickup,...pickupReturn].filter(o => current_data_macs.includes(o.macAddr))
                                                   .map( t => {
                                                      if(!t.startStatusWatchAt) {
                                                        let oldScanned =  oldScannedTags.find(o => o.macAddr === t.macAddr)
                                                        let tag =  {
                                                          macAddr: t.macAddr,
                                                          startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                                        }

                                                        if(oldScanned == undefined){
                                                          tag = {
                                                            ...t,
                                                            macAddr: t.macAddr,
                                                            startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                                          }
                                                        }
                                                        
                                                        updateEnginStatusChangeStartWatch.push(tag)
                                                        return null
                                                      }else {
                                                        let diff = moment().diff(
                                                            moment(t.startStatusWatchAt, "YYYY-MM-DDTHH:mm:ss"),
                                                            "minutes",
                                                            true
                                                        )
                                                        loggermodule.info(`${t.macAddr} GPS WATCH DIFF:${diff}`)
                                                        return {
                                                          ...t,
                                                          statusDiff: diff
                                                        }
                                                      }
                                                   })
                                                   .filter( o => o && o?.statusDiff > (o?.statusTo == 'pickup' ? TIME_BEFORE_PICKUP : TIME_BEFORE_PICKUPRETUREN))

          loggermodule.info('updateEnginStatusChangeStartWatch:'+JSON.stringify(updateEnginStatusChangeStartWatch))
          loggermodule.info('TO pickupReturn:'+JSON.stringify(pickupReturn))
          loggermodule.info('TO pickup:'+JSON.stringify(pickup))
          loggermodule.info('TO delivered:'+JSON.stringify(delivered))
          loggermodule.info('PICKUP + PICKUPRETURN AFTER FILTER:'+JSON.stringify(outside))
          loggermodule.info('PICKUP AFTER FILTER:'+JSON.stringify(outside))
          let dataToProcess = [...delivered , ...outside]
                                .map( o =>({
                                  ...o,
                                  enginId: o.enginId
                                })).filter( o => o.statusTo)
          loggermodule.info('DATA TO PROCESS STATUS BY GPS or MOBILE:'+JSON.stringify(dataToProcess))

          saveTagsHistory(data)

          if(updateEnginStatusChangeStartWatch.length > 0){
            saveTagsHistory(updateEnginStatusChangeStartWatch)
          }

          console.log('data to process:', dataToProcess)
          response = { response: true , data: dataToProcess};
          return response
      }catch(e){
          console.log('e:',e)
          loggermodule.error('[isEnginsNeedsChangeStatus]: Error in isEnginsNeedsChangeStatus:'+e.message)
          return response
      }
}

function isEnginsNeedsChangeStatusV0(data){
      let response = { response: false , data: [] }
      try{
          if(!Array.isArray(data) || data?.length == 0) return response
          let scannedTags = _.cloneDeep(process.scannedTags);
          let customer_worksites = _.cloneDeep(process.customer_worksites);
          let sub_deposites = _.cloneDeep(process.sub_deposites);
          
          if(!Array.isArray(scannedTags) || scannedTags?.length == 0) scannedTags = []
          if(!Array.isArray(customer_worksites)) customer_worksites = []
          if(!Array.isArray(sub_deposites)) sub_deposites = []
          

          let updateEnginStatusChangeStartWatch = [];

          let current_data_macs = data.map(o => o.macAddr)


          let isFake = data.length == 1 && data[0].isFake

          let customer_worksitesIds = customer_worksites.map( o => +o.geofenceID)
          let sub_depositeIds = sub_deposites.map( o => +o.geofenceID)
          console.log('customer_worksitesIds:%s',customer_worksitesIds)
          console.log('sub_depositeIds:%s',sub_depositeIds)
          console.log('Transitions:%s',JSON.stringify(process.transitionList))
          let oldScannedTags = _.cloneDeep(scannedTags);
          let dataInfos = data[0];
          
          let currentLatLng = {lat: dataInfos?.lat , lng: dataInfos?.lng};

          data.forEach( o => {
            o.inLastScanned = true
          })

          scannedTags = scannedTags.map(t => {
              let newData = data.find( o=> t.macAddr == o.macAddr);
              if(newData){
                return {
                  ...t,
                  ...newData
                }
              }
              return t
          })

          let scannedMacs = scannedTags.map(t => t.macAddr)

          data.forEach( t => {
            if(!scannedMacs.includes(t.macAddr))
              scannedTags.push(t)
          })

          let gpsData = scannedTags.filter( o => o.deviceType == dataInfos?.deviceType && o.deviceId == dataInfos?.deviceId);


          console.log('gpsData 2:',scannedTags)
          
          if(gpsData.length == 0) return response;

          // gpsData = setLocationIDWhenGpsIsStationary(data , gpsData);

          let enginList = process.enginList;
          let locsDist = _.uniqBy(gpsData , o => o.lat+'-'+o.lng)
                          .reduce((c , v)=>{
                              c[v.lat+'-'+v.lng] = calculateDistance({lat: v.lat , lng: v.lng}, currentLatLng);
                              return c
                          }, {});

          if(!Array.isArray(enginList)) enginList = [];

          gpsData = gpsData.map( o =>{
                              let t= {...o}
                              t.distance = locsDist[o.lat+'-'+o.lng]
                              return t
                            })
        
          let lastSeenInGeofence = gpsData
                                      .filter( o => !isNaN(o.LocationID) && o.LocationID != 0)
                                      .map( t => {
                                        if(!t.startStatusWatchAt || current_data_macs.includes(t.macAddr) || t.LocationID == dataInfos?.LocationID) {
                                          let oldScanned =  oldScannedTags.find(o => o.macAddr === t.macAddr)
                                          let tag =  {
                                            macAddr: t.macAddr,
                                            startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                          }
                                          if(oldScanned == undefined){
                                            tag = {
                                              ...t,
                                              macAddr: t.macAddr,
                                              startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                            }
                                          }
                                          updateEnginStatusChangeStartWatch.push(tag)
                                          return null
                                        }else {
                                          let diff = moment().diff(
                                              moment(t.startStatusWatchAt, "YYYY-MM-DDTHH:mm:ss"),
                                              "minutes",
                                              true
                                          )
                                          loggermodule.info(`${t.macAddr} STATUS WATCH DIFF:${diff}`)
                                          return {
                                            ...t,
                                            statusDiff: diff
                                          }
                                        }
                                      }).filter(o => o)

          /*let seenInDeposit = +PROCESS_IN_DEPOSIT_WHEN_ENTER !== 1 ? [] : lastSeenInGeofence.forEach(
            o => (
                  !isFake && 
                  o.statusDiff > 0.5 && 
                  !customer_worksitesIds.includes(+o.LocationID) 
                )
          )
          seenInDeposit.forEach(o => {
            o.statusTo = getEnginStatusTo(t , 'atDeposit')
          })

          

          seenInDeposit = seenInDeposit.map( t => {
                                              if(!t.startStatusWatchAt || (t.LocationID != t.LastLocationID)) {
                                                let oldScanned =  oldScannedTags.find(o => o.macAddr === t.macAddr)
                                                let tag =  {
                                                  macAddr: t.macAddr,
                                                  startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                                }

                                                if(oldScanned == undefined){
                                                  tag = {
                                                    ...t,
                                                    macAddr: t.macAddr,
                                                    startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                                  }
                                                }
                                                
                                                updateEnginStatusChangeStartWatch.push(tag)
                                                return null
                                              }else {
                                                let diff = moment().diff(
                                                    moment(t.startStatusWatchAt, "YYYY-MM-DDTHH:mm:ss"),
                                                    "minutes",
                                                    true
                                                )
                                                loggermodule.info(`${t.macAddr} GPS WATCH DIFF:${diff}`)
                                                return {
                                                  ...t,
                                                  statusDiff: diff
                                                }
                                              }
                                            })
                                            .filter( o => o && o?.statusDiff > (o?.statusTo == 'pickup' ? TIME_BEFORE_PICKUP : TIME_BEFORE_PICKUPRETUREN))
          */
          let inLastLocation = _.uniqBy(lastSeenInGeofence , 'macAddr');

          let seenAfterLastLocation = isFake ? [] : gpsData.filter( o => (isNaN(o.LocationID) || o.LocationID == 0));
          seenAfterLastLocation = _.uniqBy (seenAfterLastLocation, 'macAddr')

          let seenAroundStationaryArea = []

          if(PROCESS_DELIVERY_IF_NOT_SEEN_FOR_WHILE == 1){
            seenAroundStationaryArea = gpsData.filter( o => {
              let engin = enginList.find(t => t.tagname == o.macAddr);
              if((isNaN(o.LocationID) || o.LocationID == 0) && 
                        o.stationaryLocationID && 
                        o.stationaryLat && 
                        o.stationaryLng && 
                        !current_data_macs?.includes(o.macAddr) &&
                        engin?.activeID &&
                        !['pickupReturn', 'delivered' , 'potentialDelivered', 'depositDelivered'].includes(o?.statusname)
                ){
                  if(!o.startStationaryStatusWatchAt){
                    loggermodule.info('NO STATIONARY WATCH FORM:'+o.macAddr)
                    updateEnginStatusChangeStartWatch.push({
                      macAddr: o.macAddr,
                      startStationaryStatusWatchAt: moment().format("YYYY-MM-DDTHH:mm:ss")
                    })
                    return false
                  }

                  let diff = moment().diff(
                    moment(o.startStationaryStatusWatchAt, "YYYY-MM-DDTHH:mm:ss"),
                    "minutes",
                    true
                  )

                  loggermodule.info(`LOCATION0 POTENTIALYDELIVERED DIFF FOR [${o.macAddr}]:${diff} - TIME_BEFORE_DELIVERED_IF_LOCATION0:${TIME_BEFORE_DELIVERED_IF_LOCATION0}`)
                  return diff >= TIME_BEFORE_DELIVERED_IF_LOCATION0
              }
              return false
            }).map( o=> ({
              ...o,
              LocationID: o.stationaryLocationID,
              lat: o.stationaryLat,
              lng: o.stationaryLng,
              stationaryLat: o.stationaryLat,
              stationaryLng: o.stationaryLng,
              isFakeLocation: true
            }));
          }
          
          if(seenAroundStationaryArea.length > 0)
            loggermodule.info('SEEN AROUND STATIONARY AREA:'+JSON.stringify(seenAroundStationaryArea))

          // seenAroundStationaryArea = []
          let seenAfterLastLocationIds = seenAfterLastLocation.map( o => o.macAddr);
          console.log('lastSeenInGeofence:', lastSeenInGeofence)
          console.log('inLastLocation:', inLastLocation)
          console.log('seenAfterLastLocation:', DISTANCE_BEFORE_DELIVERY , TIME_BEFORE_DELIVERY)
          let inGeo = o => customer_worksitesIds.includes(+o.LocationID) || o.isFakeLocation || sub_depositeIds.includes(+o.LocationID)
          let isInRealGeo = o => customer_worksitesIds.includes(+o.LocationID) || sub_depositeIds.includes(+o.LocationID)
          let delivered =  inLastLocation.filter( o => !current_data_macs.includes(o.macAddr) && !seenAfterLastLocationIds.includes(o.macAddr) && inGeo(o) && o.distance >  DISTANCE_BEFORE_DELIVERY && o?.statusDiff >= (o.isFakeLocation && !isInRealGeo(o) ? TIME_BEFORE_POTENTIAL_DELIVERY : TIME_BEFORE_DELIVERY ));
          console.log('delivered:', delivered)

          let deliveredMacs = [...delivered , ...seenAroundStationaryArea].map( o => o.macAddr)
          delivered = [...delivered , ...seenAroundStationaryArea].map( o => {
             let eng = enginList.find(t => t.tagname == o.macAddr );
             let t = {
              ...o,
              enginId: eng?.activeID,
              statusname: eng?.statusname,
             }

             let $status = null;

             if(customer_worksitesIds.includes(+o.LocationID)) $status = 'delivered'
             else if(sub_depositeIds.includes(+o.LocationID)) $status = 'depositDelivered'
             else $status = 'potentialDelivered';

             t.statusTo = getEnginStatusTo(t ,  $status )
             return t
          }).filter( o => o.enginId && ['delivered','potentialDelivered','depositDelivered'].includes(o.statusTo) )
          console.log('delivered2:', delivered)
          loggermodule.info('seenAfterLastLocation:'+JSON.stringify(seenAfterLastLocation))

          let pickupReturn = seenAfterLastLocation
                                .filter( o =>!deliveredMacs.includes(o.macAddr))
                                .map( o => {
                                    let eng = enginList.find(t => t.tagname == o.macAddr );
                                    let distance = -1
                                    if(eng){
                                      if(o.activeLocationID && customer_worksitesIds.includes(o.activeGeofenceID)){

                                        loggermodule.info('id geofence work dep test ' + o.activeLocationID)

                                        let dist = distanceToGeofenceByID(o.activeLocationID , {lat: +o.lat , lng: +o.lng})
                                        if(dist.distance && !isNaN(dist.distance)){
                                          distance = dist.distance
                                        }else{
                                          loggermodule.error(`[PICKUPRETURN]:DISTANCE TO GEOFENCE ERROR:${JSON.stringify(dist)}`)
                                        }
                                      }else{
                                        loggermodule.error(`[PICKUPRETURN]: NO ACTIVE_LOCATION_ID`)
                                      }
                                      if(distance == -1){
                                        if (!isNaN(o.activeLocationLAT) && 
                                        !isNaN(o.activeLocationLNG)){
                                          distance = calculateDistance(
                                            { lat: +o.activeLocationLAT, lng: +o.activeLocationLNG },
                                            { lat: +o.lat, lng: +o.lng });
                                        }else{
                                          loggermodule.info(`PICKUP RETURN INVALID COORDS FOR [${o.activeReference}] - [${o.macAddr}]: lat : ${o.activeLocationLAT} + lng : ${o.activeLocationLNG}`);
                                        }
                                      }
                                      
                                    }
                                    let t = {
                                      ...o,
                                      enginId: eng?.activeID,
                                      statusname: eng?.statusname,
                                      distance
                                     }
                                     t.statusTo = getEnginStatusTo(t , 'pickupReturn')
                                     return t
                                  })
                                .filter( o => o.enginId && 'pickupReturn' == o.statusTo && (DISTANCE_BEFORE_PICKUPRETUREN == 0 || (o.distance && o.distance > DISTANCE_BEFORE_PICKUPRETUREN)))
          
          let pickup = seenAfterLastLocation
                                .filter( o =>!deliveredMacs.includes(o.macAddr))
                                .map( o => {
                                    let eng = enginList.find(t => t.tagname == o.macAddr );
                                    let t = {
                                      ...o,
                                      enginId: eng?.activeID,
                                      statusname: eng?.statusname,
                                     }
                                     t.statusTo = getEnginStatusTo(t , 'pickup')
                                     return t
                                    })
                                .filter( o => o.enginId && 'pickup' == o.statusTo)

         
          
          let outside = [...pickup,...pickupReturn].filter(o => current_data_macs.includes(o.macAddr))
                                                   .map( t => {
                                                      if(!t.startStatusWatchAt) {
                                                        let oldScanned =  oldScannedTags.find(o => o.macAddr === t.macAddr)
                                                        let tag =  {
                                                          macAddr: t.macAddr,
                                                          startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                                        }

                                                        if(oldScanned == undefined){
                                                          tag = {
                                                            ...t,
                                                            macAddr: t.macAddr,
                                                            startStatusWatchAt:  moment().format("YYYY-MM-DDTHH:mm:ss")
                                                          }
                                                        }
                                                        
                                                        updateEnginStatusChangeStartWatch.push(tag)
                                                        return null
                                                      }else {
                                                        let diff = moment().diff(
                                                            moment(t.startStatusWatchAt, "YYYY-MM-DDTHH:mm:ss"),
                                                            "minutes",
                                                            true
                                                        )
                                                        loggermodule.info(`${t.macAddr} GPS WATCH DIFF:${diff}`)
                                                        return {
                                                          ...t,
                                                          statusDiff: diff
                                                        }
                                                      }
                                                   })
                                                   .filter( o => o && o?.statusDiff > (o?.statusTo == 'pickup' ? TIME_BEFORE_PICKUP : TIME_BEFORE_PICKUPRETUREN))

          loggermodule.info('updateEnginStatusChangeStartWatch:'+JSON.stringify(updateEnginStatusChangeStartWatch))
          loggermodule.info('TO pickupReturn:'+JSON.stringify(pickupReturn))
          loggermodule.info('TO pickup:'+JSON.stringify(pickup))
          loggermodule.info('TO delivered:'+JSON.stringify(delivered))
          loggermodule.info('PICKUP + PICKUPRETURN AFTER FILTER:'+JSON.stringify(outside))
          loggermodule.info('PICKUP AFTER FILTER:'+JSON.stringify(outside))
          let dataToProcess = [...delivered , ...outside]
                                .map( o =>({
                                  ...o,
                                  enginId: o.enginId
                                })).filter( o => o.statusTo)
          loggermodule.info('DATA TO PROCESS STATUS BY GPS or MOBILE:'+JSON.stringify(dataToProcess))

          saveTagsHistory(data)

          if(updateEnginStatusChangeStartWatch.length > 0){
            saveTagsHistory(updateEnginStatusChangeStartWatch)
          }

          console.log('data to process:', dataToProcess)
          response = { response: true , data: dataToProcess};
          return response
      }catch(e){
          console.log('e:',e)
          loggermodule.error('[isEnginsNeedsChangeStatus]: Error in isEnginsNeedsChangeStatus:'+e.message)
          return response
      }
}

function formatEnvParams(){
  loggermodule.info('FORMATTING CONFIG PARAMS')
  if(isNaN(TIME_BEFORE_PICKUP)) TIME_BEFORE_PICKUP = 5 
  if(isNaN(TIME_BEFORE_PICKUPRETUREN)) TIME_BEFORE_PICKUPRETUREN = 30
  if(isNaN(DISTANCE_BEFORE_PICKUPRETUREN)) DISTANCE_BEFORE_PICKUPRETUREN = 0.5
  if(isNaN(DISTANCE_BEFORE_DELIVERY)) DISTANCE_BEFORE_DELIVERY = 0.5
  
  if(isNaN(TIME_BEFORE_DELIVERY)) TIME_BEFORE_DELIVERY = 60
  if(isNaN(TIME_BEFORE_POTENTIAL_DELIVERY)) TIME_BEFORE_POTENTIAL_DELIVERY = 300
  if(isNaN(GPS_STATIONARY_RADIUS)) GPS_STATIONARY_RADIUS = 0.02
  if(isNaN(GPS_STATIONARY_DELAY)) GPS_STATIONARY_DELAY = 5
  if(isNaN(TIME_BEFORE_DELIVERED_IF_LOCATION0)) TIME_BEFORE_DELIVERED_IF_LOCATION0 = 30
  if(isNaN(EXIT_DISTANCE_AFTER_DELIVERY)) EXIT_DISTANCE_AFTER_DELIVERY = 0.5
  if(isNaN(TIME_BEFORE_EXIT_BY_GATEWAY)) TIME_BEFORE_EXIT_BY_GATEWAY = 10
  if(isNaN(TIME_BEFORE_ENTER_EXIT)) TIME_BEFORE_ENTER_EXIT = 10
  if(isNaN(TIME_BEFORE_CHANGE_STATUS_FROM_GATEWAY)) TIME_BEFORE_CHANGE_STATUS_FROM_GATEWAY = 6
 
  TIME_BEFORE_PICKUP = +TIME_BEFORE_PICKUP
  TIME_BEFORE_PICKUPRETUREN = +TIME_BEFORE_PICKUPRETUREN
  DISTANCE_BEFORE_PICKUPRETUREN = +DISTANCE_BEFORE_PICKUPRETUREN
  DISTANCE_BEFORE_DELIVERY = +DISTANCE_BEFORE_DELIVERY
  TIME_BEFORE_DELIVERY = +TIME_BEFORE_DELIVERY
  TIME_BEFORE_POTENTIAL_DELIVERY = +TIME_BEFORE_POTENTIAL_DELIVERY
  GPS_STATIONARY_RADIUS = +GPS_STATIONARY_RADIUS
  GPS_STATIONARY_DELAY = +GPS_STATIONARY_DELAY
  TIME_BEFORE_DELIVERED_IF_LOCATION0 = +TIME_BEFORE_DELIVERED_IF_LOCATION0
  EXIT_DISTANCE_AFTER_DELIVERY = +EXIT_DISTANCE_AFTER_DELIVERY
  TIME_BEFORE_ENTER_EXIT = +TIME_BEFORE_ENTER_EXIT
  TIME_BEFORE_CHANGE_STATUS_FROM_GATEWAY = +TIME_BEFORE_CHANGE_STATUS_FROM_GATEWAY
}

function setLocationIDWhenGpsIsStationary(current_tags , full_data, ){
  let gps_histories = _.cloneDeep(process.gps_histories);
  if(!Array.isArray(gps_histories)) gps_histories = []

  if(!full_data) full_data = current_tags

  if(full_data[0]?.deviceType != 'gps') return full_data;
  let current_data_macs = current_tags.map(o => o.macAddr)

  let gps_history_info = gps_histories.find(o => full_data[0]?.deviceId == o.ident) || {};
  let base_gps_data = current_tags[0]?.gpsData;

  let canStationary = false
  if(base_gps_data){
    gps_history_info = { ...gps_history_info , ...base_gps_data}
    canStationary = canStartStationary(base_gps_data,gps_history_info);
    if(!canStationary) delete gps_history_info.isStationaryFrom
    else if(!gps_history_info?.isStationaryFrom) {
      gps_history_info.isStationaryFrom = moment().format("YYYY-MM-DDTHH:mm:ss");
      gps_history_info.stationaryLat= gps_history_info['position.latitude']
      gps_history_info.stationaryLng= gps_history_info['position.longitude']
    }
    saveGpsHistories(gps_history_info)
  }
  if(canStationary){
    let stationary = isGPsStationary(gps_history_info);
    if(stationary.stationary){
      loggermodule.info('GPS STATIONARY SINCE:'+stationary.since)
      full_data.forEach( o => {
        if(current_data_macs.includes(o.macAddr) && o.LocationID == 0){
          o.LocationID = (o.lat+o.lng).toFixed(2).replace(/\./g, '00')
          o.isFakeLocation= true
          o.wasStationary = true
          o.stationaryLat = gps_history_info['position.latitude']
          o.stationaryLng = gps_history_info['position.longitude']
          o.stationaryLocationID = o.LocationID
        }else if(current_data_macs.includes(o.macAddr)) {
          o.isFakeLocation = ''
        }
      })
    }
  }else{
    full_data.forEach( o => {
      if(current_data_macs.includes(o.macAddr) && o.isFakeLocation){
        delete o.LocationID
        o.isFakeLocation = ''
      }
    })
  }
  return full_data
}

function canStartStationary(info , oldInfo){
  oldInfo = oldInfo || info
  let dist = -1;
  let stationaryLat = oldInfo.stationaryLat || oldInfo.lastLat
  let stationaryLng = oldInfo.stationaryLng || oldInfo.lastLng

  let currentLat = info['position.latitude']
  let currentLng = info['position.longitude']
  if(stationaryLat && stationaryLng){
    dist = calculateDistance({lat: currentLat , lng: currentLng } , {lat: stationaryLat , lng: stationaryLng})
  }
  return info?.['position.speed'] === 0 || (dist != -1 && dist < GPS_STATIONARY_RADIUS)
}

function isGPsStationary(info){
  let gpsStationarySince = 0;
  if(info.isStationaryFrom){
    gpsStationarySince = moment().diff(
      moment(info.isStationaryFrom, "YYYY-MM-DDTHH:mm:ss"),
      "minutes",
      true
    );
    loggermodule.info(`GPS STATIONARY DIFF: ${info?.ident}:${gpsStationarySince} min`)
  }
  return { stationary: info.isStationaryFrom && gpsStationarySince >= GPS_STATIONARY_DELAY  , since: gpsStationarySince}
}

async function updateEnginStatusByGpsOrMobile(parsedData){
    try{
      console.log('parsed DATA from updateEnginStatusByGpsOrMobile',parsedData);


      if(['gps', 'mobile'].includes(parsedData?.[0]?.deviceType) && DISABLE_STATUS_CHANGE != 1){
        let enginsToUpdateStatus = isEnginsNeedsChangeStatus(parsedData)
        loggermodule.info('Gps needs tags status change:'+JSON.stringify(enginsToUpdateStatus))
        if(enginsToUpdateStatus?.response && Array.isArray(enginsToUpdateStatus?.data) && enginsToUpdateStatus?.data?.length > 0){
            let groupes = _.groupBy(enginsToUpdateStatus.data, 'statusTo');

            enginsToUpdateStatus.data.forEach( o => {
               if(['depositDelivered','delivered'].includes(o.statusTo)){
                parsedData.push({
                  ...o
                })
               }
            })
            let macs =  enginsToUpdateStatus.data.map( o => o.macAddr)

            parsedData.forEach( o => {
              if(macs.includes(o.macAddr)){
                o.immediate = true
              }
            })
            for(let [k , v] of Object.entries(groupes)){
              console.log('voir GPS data : ',v);
              await updateStatus(v.map(t => ({...t , mode: 'gps'})) , {} , false);
            }
        }
      }
    }catch(e){
      loggermodule.error('Error updateEnginStatusByGpsOrMobile:'+e.message)
    }
    return parsedData
}

async function updateBatteryLevelAfterScan(scannedData){
  try{
    loggermodule.info('Start updateBatteryLevelAfterScan')
    let scannedTags = process.scannedTags;
    if(!Array.isArray(scannedTags)) scannedTags = []
    let dataToSetBattLevel = scannedData.filter(o => o.vbatt)
      .map((o) => ({
        macAddr: o.macAddr,
        battery: o.vbatt,
      }))
      .filter((o) => {
        let scannedTag = scannedTags.find((s) => s.macAddr == o.macAddr);
        loggermodule.info(`${o.macAddr} lastUpdateBattery:`+scannedTag?.lastUpdateBattery )
        if (!scannedTag?.lastUpdateBattery) return true;
        return (
          moment().diff(moment(scannedTag.lastUpdateBattery), "minutes") > 10
        );
      }).map( t => {
        let o = {...t};
        if(o.battery > 3000) o.battery = 100
        else if (o.battery < 2500) o.battery = 0
        else o.battery = Math.ceil((o.battery - 2500) / 5) 
        return o
      });
      loggermodule.info('TAGS TO UPDATE BATTERY:'+JSON.stringify(dataToSetBattLevel))
      if(dataToSetBattLevel.length > 0){
        let params = [
          {
            name: "tags",
            type: TYPES.NVarChar,
            value: JSON.stringify(dataToSetBattLevel)
          }
        ];
        ssm.execProc("tag_saveBatteryLevel", params);
      }
      loggermodule.info('End updateBatteryLevelAfterScan')
      return dataToSetBattLevel.map( o => o.macAddr)
  }catch(e){
      loggermodule.error('Error updateBatteryLevelAfterScan:'+e.message)
      return []
  }
}

function  getEnginStatusTo(o, statusTo){
  if(!o.statusname) return null
  if(!statusTo){
      if(o?.statusname == 'pickup') statusTo = 'delivered'
      if(o?.statusname == 'delivered') statusTo = 'pickupReturn'
  }
  if(statusTo && checkHasStatusTransitionAuthorization(o?.statusname , statusTo)){
      return statusTo
  }
  return null
}

function checkHasStatusTransitionAuthorization(statusFrom , statusTo , transition){
  try{
    console.log('check trans:', statusFrom , statusTo)
    transition = transition || process.transitionList
    if(!Array.isArray(transition)) return false
    let item = transition.find(o => o.statusFrom == statusFrom && o.statusTo == statusTo);
    console.log('trans item:', item)
    if(item) return true
    else{
      loggermodule.info(`[checkHasStatusTransitionAuthorization]: Status transition not autorized from [${statusFrom}] to [${statusTo}]`)
    } 
  }catch(e){
    loggermodule.error('Error checkHasStatusTransitionAuthorization:'+e.message)
    return false
  }
}

function saveScannedTagsToFile(data){
  try{
    // return
    if(+process.env.SAVE_TAG_HISTORIES_IN_FILE === 0) return
    data = data || process.scannedTags
    if(!Array.isArray(data)) return
    let obj = {
      date: moment().format(),
      data
    }
    saveJsonToFile(obj , {
      directorie: 'logs',
      filename: 'scanned-tags',
      format: 'json'
    })
  }catch(e){
    loggermodule.info('Error saving scanned tags:'+e.message)
  }
}

async function saveStatusHistory(data){
  try{
    let old = await readJsonFile('logs' , 'status-change-histories')
    old = old?.response?.data || {};
    let date = moment().format('YYYY-MM-DD');
    if(!Array.isArray(old[date])) old[date] = [];
    old[date].push(data);
    saveToFile(old , {
      filename: 'status-change-histories',
      addDate: true
    })
    
  }catch(e){
    loggermodule.error('[saveStatusHistory] Error:'+e.message+'-'+e?.stack)
  }
}

function saveToFile(data ,options = {filename: '' , dir: 'logs'}){
  try{
    if(!data) return
    if(options?.addDate){
      data = {
        date: moment().format(),
        data
      }
    }
    saveJsonToFile(data , {
      directorie: options?.dir || 'logs',
      filename: options?.filename,
      format: 'json'
    })
  }catch(e){
    loggermodule.info('Error saving scanned tags:'+e.message)
  }
}

async function initializeScannedTags(){
    try{
      loggermodule.info('Start initializeScannedTags')
      let oldScanned = await readJsonFile('logs' , 'scanned-tags.json')
      let gpsHistories = await readJsonFile('logs' , 'gps-histories.json')
      if(oldScanned.success && Array.isArray(oldScanned?.response?.data)){
        let date = oldScanned.response.date;
        let diff = moment().diff(moment(date), 'minutes', true)
        if(date && diff > 5 ){
          loggermodule.info('[initializeScannedTags]:SCANNED DATA ARE TO OLD. > 5min')
          return 
        }
        process.scannedTags = oldScanned.response.data
      }

      if(gpsHistories.success && Array.isArray(gpsHistories?.response?.data)){
        let date = gpsHistories.response.date;
        let diff = moment().diff(moment(date), 'minutes', true)
        if(date && diff > 5 ){
          loggermodule.info('[initializeScannedTags]:GPS HISTORIES DATA ARE TO OLD. > 5min')
          return 
        }
        process.gps_histories = gpsHistories.response.data
      }
      
      loggermodule.info('End initializeScannedTags successfully')

    }catch(e){
      loggermodule.error('[initializeScannedTags]:'+e.message)
    }
    return
}

async function setLocationIDForData(data){
      let latlngs = data.map((t) => ({ lat: t.lat, lng: t.lng }));
      latlngs = _.uniqBy(latlngs, (t) => t.lat + "-" + t.lng);
  
      let addressInfos = await findAddressForTags(latlngs);
  
      data = data.map((t) => ({
        ...t,
        ...addressInfos.find((o) => o.lat == t.lat && o.lng == t.lng),
      }));
      data = await findGeofenceOfPoints(_.cloneDeep(data), {searchNearest: false});

      data.forEach((o) => {
        o.LocationID = o?.worksite?.id || 0;
        o.LocationName = o?.worksite?.name || o?.worksite?.label;
        delete o.worksite;
        delete o.nearest;
      });

      return data
}

function setStatusToFromData(data){
    try{
      let customer_worksites = _.cloneDeep(process.customer_worksites);
      if(!Array.isArray(customer_worksites)) customer_worksites = [];
      let customer_worksitesIds = customer_worksites.map( o => +o.geofenceID)
      data = data.map( item =>{
          let t = {
            enginId: item.activeID,
            lat: item.lat,
            lng: item.lng,
            macAddr: item.tagname,
            statusname: item.statusname,
            mode: customer_worksitesIds.includes(+item.LocationID) ? 'gps' : 'gateway' ,
            statusTo: customer_worksitesIds.includes(+item.LocationID) ? 'delivered' : 'receptioned'
          }
          if(item.LocationID == 0){
            t.mode = 'gps'
            t.statusTo = t.statusname == 'delivered' ? 'pickupReturn' : 'pickup'
          }
          return t
      })
      return data
    }catch(e){
      loggermodule.error('Error setStatusToFromData:'+e.message)
      return []
    }
}

async function getEnginsStatusInfos(filter){
  try{
      let sql = `
        SELECT uid enginId , uid activeID ,reference, tagname macAddr, tagname  ,
        statusname, last_lat lat , last_lng  lng, lastSeenAt,
        LocationActif, LocationID ,lastSeenRssi,lastSeenLocationId,lastSeenDevice
        FROM VW_Engin_List 
        WHERE  tagname != '' and last_lat is not null and last_lng is not null  
      `
      if(_.isPlainObject(filter)){
        for(let key of Object.keys(filter)){
          sql += ` AND ${key} ${filter[key].toString().includes('!=') ? '!=' : '='} '${filter[key].toString().replace('!=', '')}'`
        }
      }
      return await ssm.execSql(sql)
  }catch(e){
    
      return {result: null , success: false , error: e.message}
  }
}

async function parseStatusSaveData(){
  try{
    let data = await getEnginsStatusInfos()
    data = data?.result
    if(!Array.isArray(data)){
      loggermodule.error('GET STATUS RESULT:'+JSON.stringify(data))
      return []
    } 
    parsedData = await setLocationIDForData(data);
    parsedData = setStatusToFromData(parsedData)
    return parsedData
  }catch(e){
    return []
  }
}

async function setReelStatusValues(data){
  if(!Array.isArray(data)){
    data = await parseStatusSaveData();
    if(!Array.isArray(data)) data = []
    loggermodule.info('PARSED DATA BEFORE FILTERE SAME STATUS:'+JSON.stringify(data))
    data = data.filter( o => o.statusname && o.statusTo && o.statusname != o.statusTo)
    loggermodule.info('PARSED DATA AFTER FILTERE SAME STATUS:'+JSON.stringify(data))
  }
  if(Array.isArray(data) && data?.length > 0){
    let group = _.groupBy(data , o => o.lat+'-'+o.lng);
    loggermodule.info('SETTING REEL STATUS DATA:'+JSON.stringify(group))
    for(let [k , v] of Object.entries(group)){
      await updateStatus(v);
    }
  }else{
    loggermodule.info('NO REEL STATUS UPDATE NEEDED:')
  }
  return data
}

async function processRealEnterExitValues(execute=false){
  console.log('execute:', execute)
  let status = true
  let parsedData = [];
  let error = null
  try{
    loggermodule.info('START SETTING REEL ENTER EXIT')
    let sql = `
        SELECT 
          uid activeID , reference, tagname  , last_lat lat , last_lng  lng , 
          format(cast(lastSeenAt as datetime),'yyyy-MM-dd HH:mm:ss') lastSeenAt,
          statusName statusname , LocationActif, LocationObjectname  
        FROM VW_Engin_List
        WHERE tagname != '' and last_lat is not null and last_lng is not null -- and reference='4087004'
    `
    let customer_worksites = _.cloneDeep(process.customer_worksites);
    if(!Array.isArray(customer_worksites)) customer_worksites = [];

    parsedData = await ssm.execSql(sql)

    if(Array.isArray(parsedData.result)){
      loggermodule.info("Exit engins:"+JSON.stringify(parsedData.result))
      parsedData = await setLocationIDForData(parsedData.result);

      loggermodule.info(`PARSED DATA LOCATIONID (${parsedData?.length}):${JSON.stringify(parsedData)}`)
      parsedData = parsedData.filter( o =>  !(o.LocationName == o.LocationObjectname  && o.LocationActif == 7) )
      loggermodule.info(`PARSED DATA AFTER FILTER SAME (${parsedData?.length}):${JSON.stringify(parsedData)}`)

      parsedData = parsedData.filter( o =>  o.LocationActif == 8 && o.LocationID != 0 ||
                                            o.LocationActif == 7 && o.LocationID == 0 ||
                                            o.LocationActif == 7 && o.LocationName != o.LocationObjectname
                                          )
      loggermodule.info(`PARSED DATA AFTER FILTER Location Actif (${parsedData?.length}):${JSON.stringify(parsedData)}`)

      if(execute){
        let group = _.groupBy(parsedData ,'lastSeenAt');
        loggermodule.info('GROUPES TO SET REEL EnterExit:'+JSON.stringify(group))
        let tagsToSetEnterAfterExit = [];
        let dataToProcess = []
        for(let [k , v] of Object.entries(group)){
          let date = moment(k).format("YYYY-MM-DDTHH:mm:ss")
          loggermodule.info('DATE TO:'+date)
          let procData = v.map( item => {
            let t = {
              idEngin: item.activeID,
              tagname: item.tagname,
              LocationID: item.LocationID,
              lat: item.lat,
              lng: item.lng,
              address: (item.address || "").toString().replace(/'/g, "."),
              city: item.city,
              country: item.country,
              postal_code: item.postal_code,
              deviceName: item.deviceName ||'',
              status: 'enter',
              mode: 'gps',
            }
            if(item.LocationID != 0 && item?.LocationActif == 7){
              tagsToSetEnterAfterExit.push({
                ..._.cloneDeep(t),
                date
              });
              t.status = 'exits'
              t.LocationID = 0
            }
            dataToProcess.push(t);
            return t
          })
  
          
          let params = [
            {
              name: "data",
              type: TYPES.NVarChar,
              value: JSON.stringify(procData),
            },
            {
              name: "point_attachement",
              type: TYPES.Int,
              value:  0,
            },
            {
              name: "user",
              type: TYPES.Int,
              value:  0,
            },
            {
              name: "date",
              type: TYPES.NVarChar,
              value: date,
            }
          ];
  
          let rr = await ssm.execProc("tag_updatedSavePosition", params);
          loggermodule.info('RESPONSEEEE:'+JSON.stringify(rr))
        }
        
        if(tagsToSetEnterAfterExit.length > 0){
          await new Promise((rs , rj)=>{
            setTimeout(async ()=>{
              let group = _.groupBy(tagsToSetEnterAfterExit ,'date')
              for(let [date , v] of Object.entries(group)){
                v.forEach( o => {
                  delete o.date
                })
                let params = [
                  {
                    name: "data",
                    type: TYPES.NVarChar,
                    value: JSON.stringify(v),
                  },
                  {
                    name: "point_attachement",
                    type: TYPES.Int,
                    value:  0,
                  },
                  {
                    name: "user",
                    type: TYPES.Int,
                    value:  0,
                  },
                  {
                    name: "date",
                    type: TYPES.NVarChar,
                    value: date,
                  }
                ];
        
                await ssm.execProc("tag_updatedSavePosition", params);
              }

              rs(1)
            }, 3000)
          })

          loggermodule.info('tagsToSetEnterAfterExit:'+JSON.stringify(tagsToSetEnterAfterExit))
          loggermodule.info('tagsToSetEnterAfterExit dataToProcess:'+JSON.stringify(dataToProcess))
        }
      }
    }else{
      status = false
    }
  }catch(e){
    loggermodule.error('ERROR SETTING REEL ENTER EXIT:'+e.message)
    return false
  }
  if(!Array.isArray(parsedData)) parsedData = []
  loggermodule.info('End SETTING REEL ENTER EXIT')
  let response = {
    status , 
    response: parsedData , 
    references: parsedData.map(o => o.reference)  ,
    error , 
    count: parsedData?.length || 0
  }
  return response
}
async function  setEnginStatusReelValues(){
    try{
        loggermodule.info('START LAST SEEN UPDATE FROM FLESPI')
        let lastSeenResponse = await setEnginsLastSeenFromFlespi();
        loggermodule.info('END LAST SEEN UPDATE FROM FLESPI')
        loggermodule.info('Start processRealEnterExitValues')
        let response =  await processRealEnterExitValues(true);
        loggermodule.info('End processRealEnterExitValues')
        loggermodule.info('DATA TO CHANGE ENTEREXIT state:'+JSON.stringify(response))
        loggermodule.info('Start setReelStatusValues')
        let statusResponse = await setReelStatusValues();
        loggermodule.info('End setReelStatusValues:'+JSON.stringify(statusResponse))
        return {success: true }
    }catch(e){
      console.log('Error:'+e.message)
      return {success: false , response: e.message}
    }

}

async function processEnterExit(data){
  let response = null

  try{
      let format = {
        idEngin: '',
        tagname: "",
        LocationID: 0,
        address: '',
        city: '',
        country: '',
        postal_code: '',
        status: '',
        mode: 'mobile',
      }
    
      let global = data.global ||{};
      let dt = data.data || data;
      if(!Array.isArray(dt)) dt = []
      dt = dt.map(o => ({...global , ...o , mode: "mobile"}));
      for(let k in format){
        dt[k] = dt[k] || null
      }
    
      dt = dt.filter( o => o.idEngin && o.lat && o.lng && o.status)
      if(dt.length == 0) return {success: false , response: "No data to process - Make sure you've specified all required fields"}
      let params = [
        {
          name: "data",
          type: TYPES.NVarChar,
          value: JSON.stringify(dt),
        },
        {
          name: "point_attachement",
          type: TYPES.Int,
          value:  0,
        },
        {
          name: "user",
          type: TYPES.Int,
          value:  0,
        }
      ];
      response = await ssm.execProc("tag_updatedSavePosition", params);
  }catch(e){
    loggermodule.error('ERROR SETTING REEL ENTER EXIT:'+e.message)
    response = {success: false , response: e.message}
  }
  
  return response
}


async function applyBatteryLevel(data) {
  loggermodule.info('data for battery level: '+ JSON.stringify(data));
  let tagBatteryLevelList = process.tag_batteryLevelList;
   
  if (!Array.isArray(tagBatteryLevelList)) tagBatteryLevelList = []
 
  loggermodule.info('battery tags list from Db: '+ JSON.stringify(tagBatteryLevelList));


  let filteredTagList = tagBatteryLevelList
  .filter(tag => tag.isUpdated === 0)  
  .map(tag => tag.code);  


  if (!Array.isArray(filteredTagList)) filteredTagList = []
  console.log('filteredTagList : ',filteredTagList);

  let extractedData = data
  .filter(item => item.data1 && filteredTagList.includes(item.dmac)) 
  .map(item => {
     let extractedHex  = item.data1.substring(8, 10);  
     let extractedNumber = parseInt(extractedHex, 16);

    return {
      dmac: item.dmac,
      extractedNumber,
    };
  });

  if (!Array.isArray(extractedData)) extractedData = []

  console.log('extractedData length : ',extractedData?.length );

  // Add new process

  if(extractedData?.length > 0) {
    const filteredData = extractedData.filter(item => !isNaN(item.extractedNumber));
    const uniqueData = _.uniqBy(filteredData, 'dmac');
 
    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(uniqueData),
      },
    ];

    loggermodule.info('data for battery level After Extraction: '+ JSON.stringify(uniqueData));

    let response = await ssm.execProc("tag_updateBatteryLevel", params);
    let activeRes = response?.result?.[0]?.activeResult || "";

    process.tag_batteryLevelList = JSON.parse(activeRes);
    loggermodule.info('data for refreshing list after update: '+ JSON.stringify(activeRes));
  
  }
 
}

async function processPotentialPickup(process , exclude){
    loggermodule.info('[PotentialPickup]:Strat processing PotentialPickup at:'+moment().format())
    let mainDeposit = ssm.execSql(`SELECT * FROM Deposit where code='main_deposit'`)
    let latlng = {
      lat:33.600280, 
      lng:-7.500982
    }
    let response = {}
    let activeGateways = await getActiveGatewaysFromFlespi();
    let engins = await ssm.execProc('engin_NotSeenList');
    response.engin_from_db = (engins.result || []) //.map( o =>({ref: o.reference , last_lat: o.last_lat , last_lng: last_lng , last_seen: ''}))
    response.engin_from_db_references = (engins.result || []).map( o =>o.reference)
    response.gateways_result_from_flespi = activeGateways;
    if(activeGateways.gateways){
       engins = engins.result;
       if(typeof exclude == 'string'){
         exclude = exclude.split(',').map(o =>o.trim())
       }

       if(!Array.isArray(exclude)) exclude = []
       engins = engins.filter( o => !exclude.includes(o.reference)) 
       response.engins_to_process = engins.map( o => o.reference);
       response.engins_to_process_count = response.engins_to_process.length;

       if(process === true && engins.length > 0 && DISABLE_STATUS_CHANGE != 1){

          let updateRes = await updateStatus( engins.map( o => ({
            enginId: o.id , 
            locationID: 0 , 
            statusTo: 'potentialPickUp',
            mode: 'potential_pickup_job',
            gmac:'potential_pickup_job',
            ...latlng
          })))
          response.process_response = updateRes

          let enterEngins = engins.filter( o => o.etatenginname == 'reception')
                                  .map( item =>({
                                    idEngin: item.id,
                                    tagname: item.tagname,
                                    LocationID: item.LocationID,
                                    ...latlng,
                                    address: "",
                                    city: "",
                                    country: "",
                                    postal_code: "",
                                    status: "exits",
                                    mode: "potential_pickup_job",
                                  }))

          if (enterEngins.length > 0) {
            let params = [
              {
                name: "data",
                type: TYPES.NVarChar,
                value: JSON.stringify(enterEngins),
              },
              {
                name: "point_attachement",
                type: TYPES.Int,
                value: 0,
              },
              {
                name: "user",
                type: TYPES.Int,
                value: 0,
              },
              {
                name: "date",
                type: TYPES.NVarChar,
                value: moment().format('YYYY-MM-DDTHH:mm:ss'),
              }
            ];
            let responseStatus = await ssm.execProc("tag_updatedSavePosition", params); 
            response.exit_response = responseStatus.success
          }else if(process === true && DISABLE_STATUS_CHANGE == 1){
            let msg = "WARNING POTENTIAL PICKUP: Can't process potential pickup because the status update is disabled in env variables - DISABLE_STATUS_CHANGE=1"
            response.process_response = msg
            PotentialPickup
            loggermodule.info(msg)
          }
       }

    }else{
      response.response="Any gateway detected since 24h";
      loggermodule.info('[PotentialPickup] Any gateway detected since 24h')
      response.engins_to_process = [];
    }
    loggermodule.info('[PotentialPickup]:Engins to process:'+(response.engins_to_process || []))
    loggermodule.info('[PotentialPickup]:End processing PotentialPickup at:'+moment().format())
    return response
}

async function processPotentialDelivery(process , exclude){
  try{
    loggermodule.info('[PotentialDelivery]:Strat processing PotentialDelivery at:'+moment().format())
    if(typeof exclude == 'string'){
      exclude = exclude.split(',').map(o =>o.trim())
    }
    if(!Array.isArray(exclude)) exclude = []
    let data = await getEnginsStatusInfos({statusname: 'pickup'})
    data = data?.result
    if(!Array.isArray(data) || data.length == 0) {
      loggermodule.info('No engins to process with status pickup')
      return
    }

    data = data.filter( o => !exclude.includes(o.reference))

    let engins = _.uniqBy(data , 'enginId')
    engins = engins.filter( o=> {
      let diff = moment().diff(moment(o.lastSeenAt), 'minutes') 
      return diff > TIME_BEFORE_POTENTIAL_DELIVERY
    });
    engins = engins.map(o => o.enginId)
    
    let flespiData = await getEnginsLastSeenFromFlespi(engins);

    let allData = flespiData.allData;
    
    let data_to_process = [];
    let engins_to_process = []

    let notFound = flespiData.notPresent.map( o => data.find( t => t.enginId == o)?.reference || o);

    engins.forEach( enginId => {
      let odata = allData.filter( o => o.enginId == enginId).slice(0,6);
      if(odata.find(o => o.isFakeLocation)){ // && odata?.[0]?.LocationID == 0
        data_to_process.push(odata[0])
        let ref = data.find( o => o.enginId == enginId)?.reference
        engins_to_process.push(ref)
      }
    })

    let response={engins_to_process , data_to_process , count: data_to_process.length , notFound , process_response: []}
    if(process === true && engins_to_process.length > 0 && DISABLE_STATUS_CHANGE != 1){
      let groups = _.groupBy(data_to_process , o => o.lat+'-'+o.lng)
      for(let [k , v] of Object.entries(groups)){
        let updateRes = await updateStatus( v.map( o => ({
          enginId: o.enginId, 
          locationID: o.LocationID || 0, 
          statusTo: 'potentialDelivered',
          mode: 'potential_delivered_job',
          gmac:'potential_delivered_job',
          deviceId: o.deviceId,
          deviceType: o.deviceType,
          lat: o.lat,
          lng: o.lng
        })))
        response.process_response.push(updateRes)
      }
    }
    loggermodule.info('[PotentialDelivery]:End processing PotentialDelivery at:'+moment().format())
    return {success: true , response} 
  }catch(e){
    console.log('error:', e)
    return { success: false , response: e.message , stack: e.stack} 
  }
}

async function processDelivery(process , exclude){
  try{
    loggermodule.info('[processDelivery]:Strat processing processDelivery at:'+moment().format())
    if(typeof exclude == 'string'){
      exclude = exclude.split(',').map(o =>o.trim())
    }
    if(!Array.isArray(exclude)) exclude = []
    let data = await getEnginsStatusInfos({
      LastSeenLocationObject: 'worksite',
      // LocationActif: 7,
      statusName: `!=delivered`,
      lastSeenLocationId: `!=0`
    });
    console.log('dataaaaa:',  data)
    data = data?.result

    
    if(!Array.isArray(data) || data?.length == 0) {
      loggermodule.info('[processDelivery]:No engins to needs to be set to delivered')
      return
    }

    data = data.filter( o => !exclude.includes(o.reference))

    let engins = _.uniqBy(data , 'enginId')
    // engins = engins.filter( o=> {
    //   let diff = moment().diff(moment(o.lastSeenAt), 'minutes') 
    //   return diff > TIME_BEFORE_POTENTIAL_DELIVERY
    // });
    engins = engins.map(o => o.enginId)
    
    let flespiData = {allData: [] , notPresent: []} // await getEnginsLastSeenFromFlespi(engins);
    loggermodule.info('flespiData:'+ JSON.stringify(flespiData))
    let allData = flespiData.allData;
    
    let data_to_process = [];
    let engins_to_process = []

    let notFound = flespiData.notPresent.map( o => data.find( t => t.enginId == o)?.reference || o);

    engins.forEach( enginId => {
      let flespiData = allData.find( o => o.enginId == enginId)
      /*if(odata.find(o => o.isFakeLocation)){ // && odata?.[0]?.LocationID == 0
        data_to_process.push(odata[0])
        let ref = data.find( o => o.enginId == enginId)?.reference
        engins_to_process.push(ref)
      }*/
    })

    data = data.map( o => {
      let flespiData = allData.find( t => t.enginId == o.enginId)
      // if(flespiData){
        
      // }

      return {
        ...o,
        // ...(flespiData || {}),
        // lastSeenAt: flespiData?.dateFormated || o.lastSeenAt,
        // rssi: flespiData
      }
    })

    let response={engins_to_process , data_to_process , count: data_to_process.length , notFound , process_response: []}
    
    if(data.length > 0 && DISABLE_STATUS_CHANGE != 1){
      for(let o of data){
        let mode = (o.lastSeenDevice || '').split(':');
        let obj = [{
            enginId: o.enginId, 
            locationID: o.lastSeenLocationId, 
            LocationID: o.lastSeenLocationId, 
            statusTo: 'delivered',
            mode: mode?.[0] || 'gps',
            gmac: mode?.[1] || 'unknown',
            deviceId: mode?.[1],
            deviceType: mode?.[0] || 'unknown',
            lat: o.lat,
            lng: o.lng,
            date: o.lastSeenAt,
            rssi: o?.lastSeenRssi ||''
        }]
        data_to_process.push(...obj)
        console.log('obj:', obj)
        let updateRes = await updateStatus(obj)
        response.process_response.push(updateRes)
      }
    }
    loggermodule.info('[processDelivery]: All data to set to delivery:'+JSON.stringify(data_to_process))
    loggermodule.info('[processDelivery]:End processing processDelivery at:'+moment().format())
    return {success: true , response} 
  }catch(e){
    loggermodule.error('[processDelivery]:Error processing processDelivery:'+e.stack)
    return { success: false , response: e.message , stack: e.stack} 
  }
}

async function dailyDeliveryCheck(){
   let delivered = "SELECT TOP 10 e.reference, s.*  FROM SAT s INNER JOIN VW_ENGIN_LIST e on s.srcId =e.uid WHERE status=26 ORDER BY creaDate DESC"
   delivered = await ssm.execSql(delivered)
   let toDeliver = await getEnginsStatusInfos({
      LastSeenLocationObject: 'worksite',
      //LocationActif: 7,
      statusName: `!=delivered`
   });

  return {delivered: delivered.result , toDeliver: toDeliver.result}
}

async function processEnterPotentialPickup(process){
  try{
    let data = await getEnginsStatusInfos({statusname: 'potentialPickup'});
    data = data?.result || []
    let engins = _.uniqBy(data , 'enginId')
    engins = engins.map(o => o.enginId)
    let flespiData = await getEnginsLastSeenFromFlespi(engins);
    let allData = flespiData.allData;
    allData = _.uniqBy(allData , 'enginId')
               .filter(o => o.LocationID == 4678);

    if(process){
      let data =  allData.map( item =>({
        idEngin: item.id,
        tagname: item.macAddr,
        LocationID: item.LocationID,
        lat: item.lat,
        lng: item.lng,
        address: "",
        city: "",
        country: "",
        postal_code: "",
        status: "enter",
        mode: "process_enter_pickup_return",
      }))

      data = _.groupBy(data, o => o.lat+"-"+o.lng);
    }
    return {success: true , response: {
      count: allData.length ,
      data: allData.map(o => ({enginId: o.enginId, reference: o.reference, lastSeenAt: o.lastSeenAt}))
    }}
  }catch(e){
    console.log('error:', e)
    return { success: false , response: e.message , stack: e.stack}
  }
}

async function processStaff(parsedData,req){
    loggermodule.info("End process staff")
    let response = null
    loggermodule.info("staff list test : " + JSON.stringify(process.enginList))
    loggermodule.info("parsed : " + JSON.stringify(parsedData))
 
    let enginList = Array.isArray(process.enginList) ? process.enginList : [];

      // 🧠 Create lookup maps for quick access
    const staffMap = new Map();
    const enginMap = new Map();


    for (let item of enginList) {
      if (item.src === 'staff') {
        staffMap.set(item.tagname, item);
      } else if (item.src === 'engin') {
        enginMap.set(item.tagname, item);
      }
    }

    const staffTags = [];
    const enginTags = [];

    for (const tag of parsedData) {
      const mac = tag.macAddr;
      if (staffMap.has(mac)) {
        staffTags.push(tag);
      }
      if (enginMap.has(mac)) {
        enginTags.push(tag);
      }
    }


      // ✅ STAFF PROCESSING
    if (staffTags.length > 0) {
      const matchedStaff = staffTags.map(tag => staffMap.get(tag.macAddr));
      loggermodule.info("only staff list : " + JSON.stringify(matchedStaff));

      if (process.env.STATUS_GATEWAY != 0) {
        loggermodule.info("DATA TO PASS TO PROCESSCHANGESTATUS FOR STAFF: " + JSON.stringify(staffTags));
        await processChangeStaffStatus(staffTags, req);
      }

      response = await processSaveStaffPosition(staffTags, req);
    }

    // ✅ ENGIN PROCESSING
    if (enginTags.length > 0) {
      const matchedEngins = enginTags.map(tag => enginMap.get(tag.macAddr));
      loggermodule.info("only engin list : " + JSON.stringify(matchedEngins));

      if (process.env.STATUS_GATEWAY != 0) {
        loggermodule.info("DATA TO PASS TO PROCESSCHANGESTATUS FOR ENGIN: " + JSON.stringify(enginTags));
        await processChangeStatus(enginTags, req);
      }

      response = await processSavePosition(enginTags, req);
    }
    loggermodule.info("End process staff")
    return response
}

async function processStatusInDeposit(){
  try{
      if(+PROCESS_IN_DEPOSIT_WHEN_ENTER !== 1) return
      loggermodule.info('[processStatusInDeposit]:Start setting engin in deposit job')
      let sql = `
        SELECT uid , LocationObjectName ,last_lat , last_lng, LocationID , LocationObject , statusName ,statuslabel
        FROM VW_ENGIN_LIST
        WHERE LocationObject = 'deposit' 
            AND statusname != 'receptioned'
            AND LocationActif=7
      `

      let response = await ssm.execSql(sql);

      if(Array.isArray(response.result) && response.result.length > 0){
        loggermodule.info('[processStatusInDeposit]:Engin to set in deposit: '+ JSON.stringify(response.result.map( o => o.uid)))
        let data = response.result.map( o => ({
          enginId: o.uid,
          locationID: o.LocationID,
          lat: o.last_lat,
          lng: o.last_lng,
          statusTo: 'receptioned',
          mode: 'engin_in_deposit_job',
          gmac:'engin_in_deposit_job',
        }))
        let updateRes = await updateStatus(data)
      }else{

      }
      loggermodule.info('[processStatusInDeposit]:End setting engin in deposit job: '+ (response?.result?.length || 0) +' engin(s) processed')
  }catch(e){
    console.log('error:', e)
    return { success: false , response: e.message , stack: e.stack}
  }
}


setImmediate(formatEnvParams)

module.exports = {
    saveTagsHistory,
    emitUpdateWorksiteStats,
    gatewayResultData,
    removeTagsAfterExitByGateway,
    processSavePosition,
    processSaveStaffPosition,
    processChangeStatus,
    processChangeStaffStatus,
    fetchEnginAndEmitUpdate,
    setStatusScannedTags,
    findAddressForTags,
    initializeScannedTags,
    processRealEnterExitValues,
    setEnginStatusReelValues,
    setReelStatusValues,
    setLocationIDForData,
    applyBatteryLevel,
    processPotentialPickup,
    processPotentialDelivery,
    processEnterPotentialPickup,
    emitUpdateStaffStats,
    processStaff,
    processStatusInDeposit,
    processEnterExit,
    processDelivery,
    dailyDeliveryCheck
}


