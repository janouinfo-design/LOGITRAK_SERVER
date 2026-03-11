const loggermodule = require("#modules/loggermodule.js");
const moment = require("moment");
const { fetchDataFromProcedure } = require("./service");
const _ = require("lodash");

const { processSavePosition, saveTagHistories } = require("../../app/controllers/tag.controller");
const iomodule = require("#modules/iomodule.js");
const { executeNavixy } = require("#modules/navixy/navixy.service.js");
const { processGeofence } = require("#utils/geometry.utl.js");
const { saveTagsHistory } = require("#modules/tag/tag.util.js");

let configs = {
  users: {
    procedure: "Staff_list",
  },
  tag_batteryLevelList: {
    procedure: "tag_batteryLevelList",
  },
  enginList: {
    procedure: "engin_activeList",
    execAfter: (newData, oldData) => {
      if (!Array.isArray(oldData)) oldData = [];
      if (!Array.isArray(newData)) newData = [];
      let parseData = (data) => ({
        ...data,
        id: data.activeID,
        statusID: data.activeStatus,
        LocationID: data.activeLocationID,
      });
      let changedEngins = [];
      for (let old of oldData) {
        let newDt = newData.find(
          (o) =>
            o.activeID == old.activeID && ( o.activeStatus != old.activeStatus || o.statuslabel != old.statuslabel)
        );
        if (newDt) {
          changedEngins.push(parseData(newDt));
        }
      }

      if (oldData.length == 0) changedEngins = newData.map(parseData);

      //loggermodule.info(`ENGIN STATE:${JSON.stringify(changedEngins)}`)

      if (changedEngins.length > 0) {
        iomodule.emit("new_updated_engins", {
          engins: newData.map(parseData) // changedEngins,
        });
      }

      if(newData.length > 0){
        let formatedEngins = newData.map( o => ({...o , macAddr: o.tagname , alreadyUpdated: false}));
        saveTagsHistory(formatedEngins , [] , {addIfNotExist: false})
      }
    },
  },
  /** 
    "worksite_statistiques": {
        procedure : "worksite_statistiques",
        execAfter : (newData, oldData) => {
            if(!Array.isArray(oldData)) oldData = []
            if(!Array.isArray(newData)) newData = []

            console.log('old Data : ',oldData);
            console.log('new Data : ',newData);

            let updatedWorsites = [];

            for(let old of oldData){
                let newDt = newData.find( o => o.uid == old.uid && (o.enginEnter != old.enginEnter || o.enginExit != old.enginExit))
                if(newDt){
                    updatedWorsites.push(newDt)
                }
            }

            console.log('updated worksites : ',updatedWorsites);

            if(updatedWorsites.length > 0) {
                iomodule.emit('worksite_statistiques', {
                    worksiteStats: updatedWorsites
                })
            }

        }
    },*/
  gateway: {
    procedure: "Gateway_list",
  },
  transitionList: {
    procedure: "Transition_List",
  },
  authorisationTransList: {
    procedure: "authorisationTransition_List",
  },
  geofenceAndAddressList: {
    procedure: "geofence_getGeofenceAndAddressList",
  },
  engins_state_by_gateway: {
    procedure: "engin_entryListByGateway",
    transform: (new_data, old_data) => {
      let isRestarted = !Array.isArray(old_data);
      old_data = _.cloneDeep(old_data);
      new_data = _.cloneDeep(new_data);
      if (!Array.isArray(new_data)) new_data = [];
      if (!Array.isArray(old_data)) old_data = [];
      loggermodule.info("Gateway engins old data:" + JSON.stringify(old_data));
      let formatData = (item) => ({
        gmac: item.label,
        time: moment.utc(item.lastSeenAt, 'DD/MM/YYYY HH:mm').format("YYYY-MM-DDTHH:mm:ss"),
        macAddr: item.tagname,
        lat: item.lat,
        lng: item.lng,
        LocationID: item.LocationID,
      });

      let dataNotInside = new_data.filter(
        (o) => !old_data.find((t) => t.macAddr == o.tagname)
      );
      if (dataNotInside.length > 0) {
        old_data = [...old_data, ...new_data.map(formatData)];
      }
      if (isRestarted) {
        loggermodule.info(
          "Gateway engins state after restart:" + JSON.stringify(old_data)
        );
      } else {
        loggermodule.info(
          "Gateway engins new data:" + JSON.stringify(old_data)
        );
      }
      return old_data;
    },
  },
  customer_worksites: {
    procedure: 'customer_getWorksiteIds'
  },
  worksites_geofences: {
      procedure: 'worksiteAndDeposit_list',
      transform: async (new_data , old_data)=>{
        try{
          if(!Array.isArray(new_data)) new_data = old_data;
          if(!Array.isArray(new_data)) new_data = [];
  
          for (let inv of new_data) {
            inv.geofence = await processGeofence(inv.geofence);
            inv.geofence = inv.geofence?.[0]
            let _data = { ...inv };
            delete _data.geofence
            inv.worksite = _data
          }
        }catch(e){
          if(!Array.isArray(new_data)) new_data = old_data;
          if(!Array.isArray(new_data)) new_data = [];
          loggermodule.error("Error updating local geodences list:"+e.message)
        }
        return new_data.map(o => ({...o.geofence , worksite: o.worksite  })).filter( o => _.isPlainObject(o.geometry))
    }
  },
  sub_deposites: {
    procedure: 'deposit_getSubDeposites'
  },
  appconfig: {
    procedure: "Config_Get",
    params: {
      configName: "appName",
    },
    transform: (newData, oldData) => {
      let value = newData?.[0]?.value || newData?.[0]?.Value || ""
      if(value.includes('{')) newData = JSON.parse(value)
      else newData = {};
      console.log('confiiiigs:', newData)
      return newData
    }
  }
};

exports.fetchAppData = async () => {
  try {
    loggermodule.info("Start getting app data");
    for (let [k, v] of Object.entries(configs)) {
      await fetchDataFromProcedure(v.procedure, {
        processKey: k,
        ...(v || {}),
      });
    }
    loggermodule.info("End getting app data");
  } catch (e) {
    loggermodule.error("An getting app data:" + e.message);
  }
};

exports.navixyProcess = async () => {
  return
  try {
    let dateFrom = moment()
      .subtract(59, "seconds")
      .format("YYYY-MM-DDTHH:mm:ss");
    let dateTo = moment().format("YYYY-MM-DDTHH:mm:ss");
    let arrayNavixy = [];
    let firstDate;

    let result = await executeNavixy("beacon/data/read", {
      from: dateFrom,
      to: dateTo,
    });

    if (result.list && result.list.length > 1) {
      firstDate = result.list[1].get_time;
    }

    result.list.forEach((item) => {
      let obj = {
        gps: item.tracker_id,
        macAddr: item.hardware_id,
        lat: item.latitude,
        lng: item.longitude,
      };
      arrayNavixy.push(obj);
    });

    console.log("navixy data fetched well!", arrayNavixy);

    processSavePosition(arrayNavixy, { date: firstDate });

    loggermodule.info("End getting app data");
  } catch (e) {
    loggermodule.error("An getting app data:" + e.message);
  }
};
