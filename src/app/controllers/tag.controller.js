let ssm = require("../../apis/sql-server-request");
let { TYPES } = require("tedious");
let { findAddress } = require("../../services/location.service");
let { onResult, onException } = require("#utils/error.utl.js");
let loggermodule = require("#modules/loggermodule.js");
let _ = require("lodash");
let moment = require("moment");
let { env } = require("../../configs");

let {setLocationIDForData , applyBatteryLevel, processPotentialPickup, processPotentialDelivery, processEnterPotentialPickup , emitUpdateStaffStats, processStaff, processEnterExit, dailyDeliveryCheck} = require("#modules/tag/tag.util.js");

const { calculateDistance } = require("../../services/location.service");

const { gatewayResultData, processChangeStatus,processChangeStaffStatus,  processSavePosition, processSaveStaffPosition,  processRealEnterExitValues, setEnginStatusReelValues, setReelStatusValues } = require("#modules/tag/tag.util.js");

const { PROCESS_STAFF_CHANGE_STATUS } = process.env

exports.list = async (req, res) => {
  try {
    let data = req.body.data || req.body;


    let params = [
      {
        name: "LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || "",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
      },
      {
        name: "IDCustomer",
        type: TYPES.Int,
        value: data.IDCustomer || 0,
      },
      {
        name: "page",
        type: TYPES.Int,
        value: data.page || 1,
      },
      {
        name: "PageSize",
        type: TYPES.Int,
        value: data.PageSize || 10,
      },
      {
        name: "search",
        type: TYPES.NVarChar,
        value: data.search || "",
      },
      {
        name: "displayAll",
        type: TYPES.Int,
        value: data.displayAll || 0,
      },
      {
        name: "All",
        type: TYPES.Int,
        value: data.All || 0,
      },
      {
        name: "Parent",
        type: TYPES.VarChar,
        value: data.Parent || "engin",
      },
      {
        name: "version",
        type: TYPES.Int,
        value: data.version || 1,
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

    let response = await ssm.execProc("tag_list", params);
    
    if (!Array.isArray(response.result)) response.result = [];

     
    response.result.forEach((tag) => {
      if (
        typeof tag.engin == "string" ||
        typeof tag.familleId == "string"
      ) {
         
        tag.engin = JSON.parse(tag.engin);
        
        tag.familleId = parseInt(tag.familleId);
      }
    });
     


    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};





exports.listHistory = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "tagId",
        type: TYPES.Int,
        value: data.tagId || 0,
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

    let response = await ssm.execProc("tag_listHistory", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.dashboarddetail = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    let params = [
      {
        name: "LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || "",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
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
      },
    ];

    let response = await ssm.execProc("tag_dashboard_details", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    console.log('data : ',data);

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
    ];

    let response = await ssm.execProc("tag_dashboard",params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.mobdashboard = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || "",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
      },
      {
        name: "lang",
        type: TYPES.NVarChar,
        value: data.lang || "fr",
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

    let response = await ssm.execProc("mob_dashboard", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.dashboardDetails = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    let params = [
      {
        name: "src",
        type: TYPES.NVarChar,
        value: data.src || "",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
      },
      {
        name: "LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || "",
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

    let response = await ssm.execProc("dashboard_getDataById", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.bystatut = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "src",
        type: TYPES.NVarChar,
        value: data.src || "",
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

    let response = await ssm.execProc("tags_byStatut", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.gethistorique = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id,
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

    let response = await ssm.execProc("tag_getHistorique", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.activate = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id,
      },
      {
        name: "active",
        type: TYPES.Int,
        value: data.active,
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

    let response = await ssm.execProc("tag_active", params);
    loggermodule.info("End activation tag");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error activation tag :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id,
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

    let response = await ssm.execProc("tag_get", params);
    loggermodule.info("End getting tag");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error getting tag :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.save = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;


    if (data.id === undefined || data.code == undefined) {
      res.status(401).json({ error: "name can't be null !!!" });
      return;
    }

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0
      },
      {
        name: "code",
        type: TYPES.NVarChar,
        value: data.code
      },
      {
        name: "label",
        type: TYPES.NVarChar,
        value: data.label
      },
      {
        name: "log",
        type: TYPES.NVarChar,
        value: data.log || ""
      },
      {
        name: "adresse",
        type: TYPES.NVarChar,
        value: data.adresse || ""
      },
      {
        name: "IDCustomer",
        type: TYPES.Int,
        value: data.IDCustomer || 0
      },
      {
        name: "active",
        type: TYPES.Int,
        value: data.active || 0
      },
      {
        name: "status",
        type: TYPES.Int,
        value: data.status || 0
      },
      {
        name: "familleId",
        type: TYPES.Int,
        value: data.familleId || 0
      },
      {
        name: "batterylevel",
        type: TYPES.Int,
        value: data.batterylevel || 0
      },
      {
        name: "point_attachement",
        type: TYPES.Int,
        value: attachement
      },
      {
        name: "user",
        type: TYPES.Int,
        value: userId
      },
    ];

    let response = await ssm.execProc("tag_save", params);
    loggermodule.info("End saving tag");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error saving tag :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    let data = req.body;

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
    ];

    let response = await ssm.execProc("tag_remove", params);
    loggermodule.info("End removing tag");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error removing tag :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.removebyCustomer = async (req, res) => {
  try {
    let data = req.body;

    let response = await ssm.execProc("remove_byCustomer", data);
    loggermodule.info("End removing by customer");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error removing by customer :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.getbyCustomer = async (req, res) => {
  try {
    let data = req.body;

    let response = await ssm.execProc("get_byCustomer", data);
    loggermodule.info("End get by customer");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error get by customer :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.saveByCustomer = async (req, res) => {
  try {
    let data = req.body;

    let response = await ssm.execProc("tag_saveByCustomer", data);
    loggermodule.info("End save by customer");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error save by customer :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.countTag = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "srcType",
        type: TYPES.NVarChar,
        value: data.srcType,
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

    let response = await ssm.execProc("tag_taggedCount", params);
    loggermodule.info("End count tag");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error count tag :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.saveBattery = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id,
      },
      {
        name: "batterylevel",
        type: TYPES.Int,
        value: data.batterylevel || 0,
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

    let response = await ssm.execProc("tag_saveBattery", params);
    loggermodule.info("End save Battery");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error save Battery :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.saveBatteryLevel = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    //action

    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.tags) || "",
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

    let response = await ssm.execProc("tag_saveBatteryLevel", params);
    loggermodule.info("End save Battery level");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error save Battery level :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.savePosition = async (req, res) => {
  try {
    let data = req.body;
    let parsedData = data.tags;


    //let entryListByGateway = process.entryListByGateway;
    let gatewayList = process.gateway;


    if (!Array.isArray(gatewayList)) gatewayList = [];

    let finalResult = [];

    if (data.gmac) {
      loggermodule.info(
        `Received gateway [${data.gmac}] data: ${
          data.obj?.length || 0
        } devices, latlng:${JSON.stringify(data?.loc || data?.location)}`
      );
      if (Array.isArray(data.obj)) {
         
        loggermodule.info("DATA SLICED:" + data.obj.length);
        loggermodule.info("CHECK DATA SLICED:" + JSON.stringify(data.obj));
        
        if(data.obj.length > 0)
        applyBatteryLevel(data.obj);
      }
    }

    if (
      data.gmac &&
      env.DISABLE_GATEWAY != 1 &&
      Array.isArray(data.obj) &&
      (data.obj?.length || 0) > 0
    ) {
      console.log('gatewayList', gatewayList);
      
      let gate = gatewayList.find((o) => o.label === data.gmac);

      console.log('gate here : ',data.gmac);

      let loc = data.loc || data.location;
      if(gate){
        loc = {latitude: gate.lat , longitude: gate.lng}
      }

      let res = await setLocationIDForData([ { "lat" : loc?.latitude , "lng" : loc?.longitude }])

      console.log('res lat lng : ',res);

      console.log('process customer worksites : ',process.worksite)

      console.log('display data : ',data)

      let parseDataFunc = () => {
        if (loc?.latitude && loc?.longitude && Array.isArray(data.obj))
          return data.obj.map((o) => ({
            ...o,
            lat: gate?.lat || loc.latitude,
            lng: gate?.lng || loc.longitude,
            gmac: data.gmac,
            macAddr: o.dmac,
            locationID : gate?.locationId || 0,
            locationObject : gate?.locationObject || ''
          }));
        else return [];
      };



      if (gate) {
        console.log('gate here : ',gate);
        if (!gate.exit_lat || !gate.exit_lng)
          loggermodule.info(
            `[GATEWAY_EXIT_POSITION]: The gateway ${data.gmac} doesn't have exit_position`
          );
        if (isNaN(gate.exit_lat)) gate.exit_lat = 0;
        if (isNaN(gate.exit_lng)) gate.exit_lng = 0;
        if (gate.sysMode == "EnterExit") {

          
          finalResult = gatewayResultData(data, gate);

          console.log('gate here mode: ',finalResult);
          if (!Array.isArray(finalResult)) finalResult = [];
          finalResult = _.uniqBy(
            finalResult.map((o) => _.cloneDeep(o)),
            "macAddr"
          );

          finalResult.forEach((item) => {
            if (item.isExit === -1) {
              let lastSeenTime = moment(item.time);
              let timeDifference = moment().diff(lastSeenTime, "minutes");
              item.time_diff = timeDifference;
              if (item.exitCount >= 6) {
                item.isExit = 1;
                item.lat = gate.exit_lat || parseFloat(item.lat);
                item.lng = gate.exit_lng || parseFloat(item.lng);
              }
            }
          });
        } else {
          loggermodule.info(`${data.gmac} Not EnterExit`)
          finalResult = parseDataFunc();
        }
      } else {
        finalResult = parseDataFunc();
        console.log('final resulttt : ',finalResult);
      }
      parsedData = finalResult;
    }


    loggermodule.info('parsed Data to status gateway: ' + JSON.stringify(parsedData));


    if (data.gmac && (data.obj?.length || 0) == 0) {
      loggermodule.info("DATA TO PROCESS WITH GATE 0:" + JSON.stringify(data));
    }

    if (!Array.isArray(parsedData)) parsedData = [];

    if (parsedData.length > 0) {
      if(PROCESS_STAFF_CHANGE_STATUS != 1){
        // do the process check from env here
        if (process.env.STATUS_GATEWAY != 0) {
          loggermodule.info("DATA TO PASS TO PROCESSCHANGESTATUS" + JSON.stringify(parsedData));
          await processChangeStatus(parsedData, req);
        }
        parsedData = await processSavePosition(parsedData, req);
      }else{
        parsedData = await processStaff(parsedData, req);
      }
    }
    onResult(res, { success: true, response: parsedData });
  } catch (e) {
    loggermodule.error(`Error save position :` + e.message);
    onException(e, res);
  }
};


exports.chargeEngin = async (req, res) => {
  try {
    let data = req.body.data;

    let addrResponse = await findAddress({ lat: data.lat, lng: data.lng });

    let object = { address: "", city: "", country: "", postal_code: "" };

    if (addrResponse.success) {
      if (addrResponse?.response?.address) {
        object.address = addrResponse?.response.address;
        object.city = addrResponse?.response.city;
        object.country = addrResponse?.response.country;
        object.postal_code = addrResponse?.response.postal_code;
      }
    }

    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.tags),
      },
      {
        name: "statusType",
        type: TYPES.NVarChar,
        value: data.statusType || "",
      },
      {
        name: "LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || "",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
      },
      {
        name: "lat",
        type: TYPES.NVarChar,
        value: data.lat || "",
      },
      {
        name: "lng",
        type: TYPES.NVarChar,
        value: data.lng || "",
      },
      {
        name: "enginAddress",
        type: TYPES.NVarChar,
        value: object.address || "",
      },
      {
        name: "enginCity",
        type: TYPES.NVarChar,
        value: object.city || "",
      },
      {
        name: "enginCountry",
        type: TYPES.NVarChar,
        value: object.country || "",
      },
      {
        name: "enginZipCode",
        type: TYPES.NVarChar,
        value: object.postal_code || "",
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

    let response = await ssm.execProc("tag_chargeEngin", params);
    loggermodule.info("End charge Engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error charge Engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.returnEngin = async (req, res) => {
  try {
    let data = req.body.data;

    let addrResponse = await findAddress({ lat: data.lat, lng: data.lng });

    let object = { address: "", city: "", country: "", postal_code: "" };

    if (addrResponse.success) {
      if (addrResponse?.response?.address) {
        object.address = addrResponse?.response.address;
        object.city = addrResponse?.response.city;
        object.country = addrResponse?.response.country;
        object.postal_code = addrResponse?.response.postal_code;
      }
    }

    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.tags),
      },
      {
        name: "statusType",
        type: TYPES.NVarChar,
        value: data.statusType || "",
      },
      {
        name: "LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || "",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
      },
      {
        name: "lat",
        type: TYPES.NVarChar,
        value: data.lat || "",
      },
      {
        name: "lng",
        type: TYPES.NVarChar,
        value: data.lng || "",
      },
      {
        name: "enginAddress",
        type: TYPES.NVarChar,
        value: object.address || "",
      },
      {
        name: "enginCity",
        type: TYPES.NVarChar,
        value: object.city || "",
      },
      {
        name: "enginCountry",
        type: TYPES.NVarChar,
        value: object.country || "",
      },
      {
        name: "enginZipCode",
        type: TYPES.NVarChar,
        value: object.postal_code || "",
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

    let response = await ssm.execProc("tag_returnEngin", params);
    loggermodule.info("End return Engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error return Engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.deliverEngin = async (req, res) => {
  try {
    let data = req.body.data;

    let addrResponse = await findAddress({ lat: data.lat, lng: data.lng });

    let object = { address: "", city: "", country: "", postal_code: "" };

    if (addrResponse.success) {
      if (addrResponse?.response?.address) {
        object.address = addrResponse?.response.address;
        object.city = addrResponse?.response.city;
        object.country = addrResponse?.response.country;
        object.postal_code = addrResponse?.response.postal_code;
      }
    }

    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.tags),
      },
      {
        name: "LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || "",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
      },
      {
        name: "lat",
        type: TYPES.NVarChar,
        value: data.lat || "",
      },
      {
        name: "lng",
        type: TYPES.NVarChar,
        value: data.lng || "",
      },
      {
        name: "enginAddress",
        type: TYPES.NVarChar,
        value: object.address || "",
      },
      {
        name: "enginCity",
        type: TYPES.NVarChar,
        value: object.city || "",
      },
      {
        name: "enginCountry",
        type: TYPES.NVarChar,
        value: object.country || "",
      },
      {
        name: "enginZipCode",
        type: TYPES.NVarChar,
        value: object.postal_code || "",
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

    let response = await ssm.execProc("tag_deliverEngin", params);
    loggermodule.info("End charge Engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error charge Engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};



exports.getLocationIDForData = async (req, res) => {
  try {
    let data = req.body.data;

    console.log('data : ',data.array);

    let response = await setLocationIDForData(data.array);
    res.status(200).json(response);
  } catch (e) {
    loggermodule.error(`Error charge Engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};



exports.saveTagHistories = async (req, res) => {
  try {
    loggermodule.info("Start saving histories");
    let histories = req.body.histories;
    let respObj = {};
    for (let history of histories) {
      req.body = { body: { userInfos: req.body.userInfos, ...history } };
      let response = await processSavePosition(history.tags, req.body);
      respObj[history.date] = response?.status == 200;
    }
    loggermodule.info("End saving histories");
    onResult(res, { response: respObj });
  } catch (e) {
    loggermodule.info("Error saving histories");
    onException(e, res);
  }
};

exports.tagsWithWrongEnterExitState = async (req , res)=>{
     try{
        let response = await processRealEnterExitValues(req.query.execute == 1)
        onResult(res, response)
     }catch(e){
        onException(e , res)
     }
}

exports.setEnginStatusReelValues = async (req , res)=>{
  try{
     let response = await setEnginStatusReelValues(req.query.execute == 1)
     onResult(res, response)
  }catch(e){
     onException(e , res)
  }
}

exports.processRealEnterExitValues = async (req , res)=>{
  try{
     let response = await processRealEnterExitValues(true)
     onResult(res, response)
  }catch(e){
     onException(e , res)
  }
}

exports.processEnterExit = async (req , res)=>{
  try{
    
     let response = await processEnterExit(req.body)
     onResult(res, response)
  }
  catch(e){
     onException(e , res)
  }
}
exports.processPotentialPickup = async (req , res)=>{
  try{
     let response = await processPotentialPickup(req.query.execute == 1 , req.query.exclude)
     onResult(res, response)
  }catch(e){
     onException(e , res)
  }
}

exports.setReelStatusValues = async (req , res)=>{
  try{
     let response = await setReelStatusValues()
     onResult(res, response)
  }catch(e){
     onException(e , res)
  }
}

exports.processPotentialDelivery = async (req , res)=>{
  try{
     let response = await processPotentialDelivery(req.query.execute == 1 , req.query.exclude)
     onResult(res, response)
  }catch(e){
     onException(e , res)
  }
}


// Function to reorder keys
function reorderKeys(obj) {
  return Object.keys(obj)
      .sort((a, b) => {
          const isNumericA = !isNaN(a);
          const isNumericB = !isNaN(b);

          if (isNumericA && isNumericB) {
              // Both are numeric, sort numerically
              return Number(a) - Number(b);
          } else if (isNumericA) {
              // Numeric keys come before non-numeric keys
              return -1;
          } else if (isNumericB) {
              return 1;
          } else {
              // Non-numeric keys are sorted lexicographically
              return a.localeCompare(b);
          }
      })
      .reduce((acc, key) => {
          acc[key] = obj[key]; // Rebuild the object with sorted keys
          return acc;
      }, {});
}

exports.processEnterPotentialPickup = async (req , res)=>{
  try{
     let response = await processEnterPotentialPickup(req.query.execute == 1 , req.query.exclude)
     onResult(res, response)
  }catch(e){
     onException(e , res)
  }
}

exports.checkDailyDelivery = async (req , res)=>{
  try{
     let response = await dailyDeliveryCheck()
     onResult(res, response)
  }catch(e){
     onException(e , res)
  }
}



