const ssm = require("../../apis/sql-server-request");
const { TYPES } = require("tedious");
const { findAddress } = require("../../services/location.service");
const { userInfo } = require("os");
const iomodule = require("#modules/iomodule.js");
const loggermodule = require("#modules/loggermodule.js");
const { some } = require("lodash");
const _ = require("lodash");
const { onResult, onException } = require("#utils/error.utl.js");
const { findGeofenceOfPoints } = require("#utils/geometry.utl.js");
const moment = require("moment");
const { fetchEnginAndEmitUpdate } = require("#modules/tag/tag.util.js");
const { setEnginsLastSeenFromFlespi, getPotentialDeliveredHistory, fetchGrafanaDashboards, fetchEnginDashboardFromProcs, fetchEnginCountByLocation } = require("#modules/engin/engin.service.js");

const { saveJsonToFile ,readGeofenceFile , removeFile} = require('../../utils/file.utl');
const { setLocationIDForData } = require("#modules/geometry/geometry.util.js");
const { checkPointsExcludeByPotentilArea } = require("#modules/geofencing/util.js");

exports.list = async (req, res) => {
  try {
    console.log("ok");
    // engin list
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
        name: "statutEngin",
        type: TYPES.NVarChar,
        value: data.statutEngin || "",
      },
      {
        name: "tatEngin",
        type: TYPES.NVarChar,
        value: data.tatEngin || "",
      },
      {
        name: "typeEngin",
        type: TYPES.NVarChar,
        value: data.typeEngin || "",
      },
      {
        name: "tagged",
        type: TYPES.NVarChar,
        value: data.tagged || "",
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
        name: "SortColumn",
        type: TYPES.NVarChar,
        value: data.SortColumn || "",
      },
      {
        name: "SortDirection",
        type: TYPES.NVarChar,
        value: data.SortDirection || "",
      },
      {
        name: "LastSeenFrom",
        type: TYPES.NVarChar,
        value: data.LastSeenFrom || "",
      },
      {
        name: "searchLastSeen",
        type: TYPES.NVarChar,
        value: data.searchLastSeen || "",
      },
      {
        name: "searchReference",
        type: TYPES.NVarChar,
        value: data.searchReference || "",
      },
      {
        name: "searchLabel",
        type: TYPES.NVarChar,
        value: data.searchLabel || "",
      },
      {
        name: "searchVin",
        type: TYPES.NVarChar,
        value: data.searchVin || "",
      },
      {
        name: "searchSituation",
        type: TYPES.NVarChar,
        value: data.searchSituation || "",
      },
      {
        name: "searchTag",
        type: TYPES.NVarChar,
        value: data.searchTag || "",
      },
      {
        name: "searchStatus",
        type: TYPES.NVarChar,
        value: data.searchStatus || "",
      },
      {
        name: "searchFamille",
        type: TYPES.NVarChar,
        value: data.searchFamille || "",
      },
      {
        name: "searchMarque",
        type: TYPES.NVarChar,
        value: data.searchMarque || "",
      },
      {
        name: "searchSite",
        type: TYPES.NVarChar,
        value: data.searchSite || "",
      },
      {
        name: "filterPosition",
        type: TYPES.Int,
        value: data.filterPosition || 0,
      },
      {
        name: "displayMap",
        type: TYPES.Int,
        value: data.displayMap || 0,
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

    console.log("test data : ", req?.userInfos?.userID || 0);

    let response = (await ssm.execProc("ENGIN_LIST", params)) || "";

    if (response.result == undefined) response.result = [];

    console.log('response length : ', response.result.length);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.getForMap = async (req, res) => {
  try {
    // engin list
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
    ];

 
    let response = (await ssm.execProc("engin_getForMap", params)) || "";

    if (response.result == undefined) response.result = [];

    console.log('response length : ', response.result.length);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.getModel = async (req, res) => {
  try {
    // engin list
    let data = req.body.data || req.body;

    let params = [
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

 
    let response = (await ssm.execProc("engin_GetModel", params)) || "";

    if (response.result == undefined) response.result = [];

    console.log('response length : ', response.result.length);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.getByLocation = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    console.log('all data : ',data);

    let params = [
      {
        name: "macAddr",
        type: TYPES.NVarChar,
        value: data.macAddr || "",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
      },
      {
        name: "locationObject",
        type: TYPES.NVarChar,
        value: data.locationObject || "",
      },
      {
        name: "lang",
        type: TYPES.NVarChar,
        value: data.lang || "",
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

    let response = (await ssm.execProc("Engin_getByLocation", params)) || "";

    if (response.result == undefined) response.result = [];

    console.log("response result", response.result);

    loggermodule.info("End engin getByLocation action ");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error engin getByLocation action :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.listnoactive = async (req, res) => {
  try {
    console.log("ok");
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
        name: "statutEngin",
        type: TYPES.NVarChar,
        value: data.statutEngin || "",
      },
      {
        name: "page",
        type: TYPES.Int,
        value: data.page || 0,
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

    console.log("test data : ", req?.userInfos?.userID || 0);

    let response = await ssm.execProc("ENGIN_LISTNOACTIVE", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.bystatut = async (req, res) => {
  //let response = {}
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

    let response = await ssm.execProc("engin_byStatut", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.listhistory = async (req, res) => {
  try {
    let data = req.body;

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
        name: "srcMouvement",
        type: TYPES.NVarChar,
        value: data.srcMouvement || "",
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

    let response = await ssm.execProc("Engin_ListHistory", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.troubleshoot = async (req, res) => {
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

    let response = await ssm.execProc("ENGIN_TROUBLESHOOT", params);

    loggermodule.info("End troubleshooting engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error troubleshooting engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.timelinelist = async (req, res) => {
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
        name: "statutEngin",
        type: TYPES.NVarChar,
        value: data.statutEngin || "",
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

    let response = await ssm.execProc("ENGIN_TIMELINELIST", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.timelineEvent = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "enginID",
        type: TYPES.Int,
        value: data.enginID || 0,
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

    let response = await ssm.execProc("ENGIN_timelineEvent", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.typelist = async (req, res) => {
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
        name: "typeEngin",
        type: TYPES.NVarChar,
        value: data.typeEngin || "",
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

    let response = await ssm.execProc("ENGIN_TYPELIST", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.event = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || "engin",
      },
      {
        name: "LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0,
      },
      {
        name: "dateFrom",
        type: TYPES.Date,
        value: data.dateFrom || null,
      },
      {
        name: "dateTo",
        type: TYPES.Date,
        value: data.dateTo || null,
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

    let response = await ssm.execProc("ENGIN_event", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.statut = async (req, res) => {
  try {
    let data = req.body.data || req.body;

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
        name: "id",
        type: TYPES.Int,
        value: data.id,
      },
      {
        name: "srcStatus",
        type: TYPES.NVarChar,
        value: data.srcStatus,
      },
      {
        name: "mode",
        type: TYPES.NVarChar,
        value: data.mode || "mobile",
      },
      {
        name: "statusForced",
        type: TYPES.Int,
        value: data.statusForced || 0,
      },
      {
        name: "locationID",
        type: TYPES.Int,
        value: data.locationID || 0,
      },
      {
        name: "locationObject",
        type: TYPES.NVarChar,
        value: data.locationObject || '',
      },
      {
        name: "lat",
        type: TYPES.Float,
        value: data.lat || 0,
      },
      {
        name: "lng",
        type: TYPES.Float,
        value: data.lng || 0,
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

    let response = await ssm.execProc("Engin_statut_save", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.modifyStatus = async (req, res) => {
  try {
    let data = req.body.data || req.body;

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
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
      },
      {
        name: "statusName",
        type: TYPES.NVarChar,
        value: data.statusName || "",
      },
      {
        name: "locationId",
        type: TYPES.Int,
        value: data.locationId || 0,
      },
      {
        name: "locationObject",
        type: TYPES.NVarChar,
        value: data.locationObject || "",
      },
      {
        name: "lat",
        type: TYPES.Float,
        value: data.lat || 0,
      },
      {
        name: "lng",
        type: TYPES.Float,
        value: data.lng || 0,
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
        name: "mode",
        type: TYPES.NVarChar,
        value: data.mode || "manual",
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

    console.log('parameters : ',params)

    let response = await ssm.execProc("engin_modifyStatus", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.saveTypes = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "enginID",
        type: TYPES.Int,
        value: data.enginID,
      },
      {
        name: "types",
        type: TYPES.NVarChar,
        value: data.types,
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

    let response = await ssm.execProc("engin_saveTypes", params);
    loggermodule.info("End save types for engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error save types for engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.save = async (req, res) => {
  try {
    let data = req.body;
    console.log("boddy:", data);

    if (data.id === undefined) {
      res.status(401).json({ error: "name can't be null !!!" });
      return;
    }

    let addrResponse = await findAddress({ lat: data.lat, lng: data.lng });

    console.log("address Response : ", addrResponse);

    let object = { address: "", city: "", country: "", postal_code: "" };

    if (addrResponse.success) {
      if (addrResponse?.response?.address) {
        object.address = addrResponse?.response.address;
        object.city = addrResponse?.response.city;
        object.country = addrResponse?.response.country;
        object.postal_code = addrResponse?.response.postal_code;
      }
    }

    console.log("address : ", object.address);
    console.log("city : ", object.city);
    console.log("country : ", object.country);
    console.log("postal_code : ", object.postal_code);

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id,
      },
      {
        name: "reference",
        type: TYPES.NVarChar,
        value: data.reference,
      },
      {
        name: "label",
        type: TYPES.NVarChar,
        value: data.label,
      },
      {
        name: "model",
        type: TYPES.NVarChar,
        value: data.model,
      },
      {
        name: "types",
        type: TYPES.NVarChar,
        value: data.types,
      },
      {
        name: "subtypeid",
        type: TYPES.Int,
        value: data.subtypeid || 1,
      },
      {
        name: "speedmax",
        type: TYPES.Int,
        value: data.speedmax || 1,
      },
      {
        name: "platelicense",
        type: TYPES.NVarChar,
        value: data.platelicense || "",
      },
      {
        name: "nochassis",
        type: TYPES.NVarChar,
        value: data.nochassis || "",
      },
      {
        name: "fueltype",
        type: TYPES.NVarChar,
        value: data.fueltype || "",
      },
      {
        name: "fuelconsumption100km",
        type: TYPES.Int,
        value: data.fuelconsumption100km || 1,
      },
      {
        name: "tankcapcityl",
        type: TYPES.Int,
        value: data.tankcapcityl || 1,
      },
      {
        name: "companyId",
        type: TYPES.Int,
        value: data.companyId || 1,
      },
      {
        name: "departmentId",
        type: TYPES.Int,
        value: data.departmentId || 1,
      },
      {
        name: "providerId",
        type: TYPES.Int,
        value: data.providerId || 1,
      },
      {
        name: "brand",
        type: TYPES.NVarChar,
        value: data.brand,
      },
      {
        name: "immatriculation",
        type: TYPES.NVarChar,
        value: data.immatriculation,
      },
      {
        name: "vin",
        type: TYPES.NVarChar,
        value: data.vin,
      },
      {
        name: "infosAdditionnelles",
        type: TYPES.NVarChar,
        value: data.infosAdditionnelles,
      },
      {
        name: "familleId",
        type: TYPES.Int,
        value: data.familleId,
      },
      {
        name: "tagName",
        type: TYPES.NVarChar,
        value: data.tagName || "",
      },
      {
        name: "beaconName",
        type: TYPES.NVarChar,
        value: data.beaconName || "",
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
        name: "tagId",
        type: TYPES.Int,
        value: data.tagId || 0,
      },
      {
        name: "imageId",
        type: TYPES.Int,
        value: data.imageId || 0,
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
        name: "familleIdTag",
        type: TYPES.Int,
        value: data.familleIdTag || 0,
      },
      {
        name: "active",
        type: TYPES.Int,
        value: data.active || 1,
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

    let response = await ssm.execProc("Engin_save", params);
    loggermodule.info("End saving engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error saving engin :` + e.message);
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

    let response = await ssm.execProc("engin_remove", params);
    loggermodule.info("End removing engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error removing engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.delete = async (req, res) => {
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

    let response = await ssm.execProc("engin_delete", params);
    loggermodule.info("End deleting engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error deleting engin :` + e.message);
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

    let response = await ssm.execProc("engin_activate", params);
    loggermodule.info("End activating engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error activating engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.reception = async (req, res) => {
  try {
    let data = req.body;

    let addrResponse = await findAddress({ lat: data.lat, lng: data.lng });

    console.log("address Response : ", addrResponse);

    let object = { address: "", city: "", country: "", postal_code: "" };

    if (addrResponse.success) {
      if (addrResponse?.response?.address) {
        object.address = addrResponse?.response.address;
        object.city = addrResponse?.response.city;
        object.country = addrResponse?.response.country;
        object.postal_code = addrResponse?.response.postal_code;
      }
    }

    console.log("address : ", object.address);
    console.log("city : ", object.city);
    console.log("country : ", object.country);
    console.log("postal_code : ", object.postal_code);

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
      },
      {
        name: "tagId",
        type: TYPES.Int,
        value: data.tagId || 0,
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

    let response = await ssm.execProc("Engin_reception", params);
    loggermodule.info("End reception for engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error reception for engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.exit = async (req, res) => {
  try {
    let data = req.body;

    let addrResponse = await findAddress({ lat: data.lat, lng: data.lng });

    console.log("address Response : ", addrResponse);

    let object = { address: "", city: "", country: "", postal_code: "" };

    if (addrResponse.success) {
      if (addrResponse?.response?.address) {
        object.address = addrResponse?.response.address;
        object.city = addrResponse?.response.city;
        object.country = addrResponse?.response.country;
        object.postal_code = addrResponse?.response.postal_code;
      }
    }

    console.log("address : ", object.address);
    console.log("city : ", object.city);
    console.log("country : ", object.country);
    console.log("postal_code : ", object.postal_code);

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
      },
      {
        name: "tagId",
        type: TYPES.Int,
        value: data.tagId || 0,
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

    let response = await ssm.execProc("Engin_exit", params);
    loggermodule.info("End exit for engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error exit for engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.tags = async (req, res) => {
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

    let response = await ssm.execProc("engin_tags", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

/*
exports.remove = async (req, res)=> {
  let response = {}  
try {


  let data = req.body

  let params = [
    {
      name: "id",
      type: TYPES.Int,
      value: data.id || 0,
    },
  ];

  let response = await ssm.execProc('engin_remove', params)
  loggermodule.info('End displaying list')
  res.status(response.status).json(response)

}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
}
*/

exports.saveaddinfo = async (req, res) => {
  try {
    let data = req.body;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
      },
      {
        name: "infosAdditionnelles",
        type: TYPES.NVarChar,
        value: data.infosAdditionnelles || 0,
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

    let response = await ssm.execProc("Engin_SaveAddInfo", params);
    loggermodule.info("End saving additionnal info");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error saving additionnal info :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.CountTagged = async (req, res) => {
  try {

    let data = req.body.data || req.body;

    let params = [
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

    let response = await ssm.execProc("Engin_CountTagged",params);
    loggermodule.info("End count tagged engin");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error count tagged engin :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.tagLink = async (req, res) => {
  try {
    let data = req.body;

    let addrResponse = await findAddress({ lat: data.lat, lng: data.lng });

    console.log("address Response : ", addrResponse);

    let object = { address: "", city: "", country: "", postal_code: "" };

    if (addrResponse.success) {
      if (addrResponse?.response?.address) {
        object.address = addrResponse?.response.address;
        object.city = addrResponse?.response.city;
        object.country = addrResponse?.response.country;
        object.postal_code = addrResponse?.response.postal_code;
      }
    }

    console.log("address : ", object.address);
    console.log("city : ", object.city);
    console.log("country : ", object.country);
    console.log("postal_code : ", object.postal_code);

    let params = [
      {
        name: "enginId",
        type: TYPES.Int,
        value: data.enginId,
      },
      {
        name: "tagName",
        type: TYPES.NVarChar,
        value: data.tagName,
      },
      {
        name: "familleIdTag",
        type: TYPES.BigInt,
        value: data.familleIdTag || 0,
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

    let response = await ssm.execProc("Engin_tagLink", params);
    loggermodule.info("End linking engin with tag");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error linking engin with tag :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.updateImage = async (req, res) => {
  try {
    let data = req.body;

    if (data.id === undefined || data.imageId === undefined) {
      res.status(401).json({ error: "id can't be null !!!" });
      return;
    }

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id,
      },
      {
        name: "imageId",
        type: TYPES.Int,
        value: data.imageId,
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

    let response = await ssm.execProc("ENGIN_updateImage", params);
    loggermodule.info("End updating image");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error updating image :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.rapport = async (req, res) => {
  try {
    let data = req.body;
    let parsedData = data.ref;

    let params = [
      {
        name: "ref",
        type: TYPES.NVarChar,
        value: JSON.stringify(parsedData),
      },
      {
        name: "object",
        type: TYPES.NVarChar,
        value: data.object,
      },
      {
        name: "begDate",
        type: TYPES.Date,
        value: data.begDate || null,
      },
      {
        name: "endDate",
        type: TYPES.Date,
        value: data.endDate || null,
      },
      {
        name: "title",
        type: TYPES.NVarChar,
        value: data.title || "",
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

    console.log("params Json : ", params[0].value);

    let response = await ssm.execProc("engin_rapport", params);

    console.log("response ", response);

    if (Array.isArray(response.result) && response.result.length === 0) {
      obj = {
        result: "No Data Found",
        status: response.status,
      };
      res.status(response.status).json(obj);
    }

    let newobject = JSON.parse(response.result[0].res);
    //let newobject = JSON.parse(response.result.res)
    console.log("result : ", newobject);

    let updatedResponse = {
      filepath: response.result[0].filepath,
      generatorId: response.result[0].generatorId,
      res: newobject,
    };

    loggermodule.info("End displaying list");
    res.status(response.status).json(updatedResponse);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.rapportList = async (req, res) => {
  try {
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
    ];
    let response = await ssm.execProc("engin_RapportList",params);

    loggermodule.info("End rapport list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error rapport list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.rapportGet = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    let params = [
      {
        name: "id",
        type: TYPES.BigInt,
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
    ];

    let response = await ssm.execProc("engin_RapportGet", params);

    let parsedData = JSON.parse(response.result[0].Result);

    /*
        let updatedResponse = {
          data: parsedData,
          typeMsg: "success"
        }*/

    loggermodule.info("End rapport list");
    res.status(response.status).json(parsedData);
  } catch (e) {
    loggermodule.error(`Error rapport list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.rapportDelete = async (req, res) => {
  try {
    let data = req.body;
    let params = [
      {
        name: "id",
        type: TYPES.BigInt,
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

    let response = await ssm.execProc("Rapport_Delete", params);

    loggermodule.info("End rapport delete");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error rapport list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.generationData = async (req, res) => {
  try {
    let data = req.body;
    let parsedData = data.ref;

    let params = [
      {
        name: "ref",
        type: TYPES.NVarChar,
        value: JSON.stringify(parsedData),
      },
      {
        name: "enginDate",
        type: TYPES.Date,
        value: data.enginDate || null,
      },
      {
        name: "title",
        type: TYPES.NVarChar,
        value: data.title || "",
      },
      {
        name: "comment",
        type: TYPES.NVarChar,
        value: data.comment || "",
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

    console.log("params Json : ", params[0].value);

    let response = await ssm.execProc("engin_generationData", params);

    console.log("response ", response);

    if (Array.isArray(response.result) && response.result.length === 0) {
      obj = {
        result: "No Data Found",
        status: response.status,
      };
      res.status(response.status).json(obj);
    }

    let newobject = JSON.parse(response.result[0].res);
    //let newobject = JSON.parse(response.result.res)
    console.log("result : ", newobject);

    let updatedResponse = {
      filepath: response.result[0].filepath,
      generatorId: response.result[0].generatorId,
      res: newobject,
    };

    loggermodule.info("End displaying list");
    res.status(response.status).json(updatedResponse);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};



async function loopAddress(data) {
  for (const tag of data) {
    tag.address = "";
    tag.city = "";
    tag.country = "";
    tag.postal_code = "";

    let addrResponse = await findAddress({ lat: tag.lat, lng: tag.lng });

    if (addrResponse.success) {
      const response = addrResponse.response;
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

exports.changementEventList = async (req, res) => {
  try {
    let data = req.body;
    let parsedData = data.tags;

    if (data.mode !== "select") {
      if (!Array.isArray(parsedData)) parsedData = [];
      console.log("here");

      let latlngs = parsedData.map((t) => ({ lat: t.lat, lng: t.lng }));

      latlngs = _.uniqBy(latlngs, (t) => t.lat + "-" + t.lng);

      let addressInfos = await loopAddress(latlngs);
      parsedData = parsedData.map((t) => ({
        ...t,
        ...addressInfos.find((o) => o.lat == t.lat && o.lng == t.lng),
      }));
      parsedData = await findGeofenceOfPoints(_.cloneDeep(parsedData));
      dataToSendToIo = _.cloneDeep(parsedData);
      parsedData.forEach((o) => {
        o.LocationID = o?.worksite?.id || 0;
        delete o.worksite;
      });
    }

    loggermodule.info("End changement event list");

    console.log("get address ", parsedData.address);

    loggermodule.info("before passing param");

    console.log("PARSED DATA : ", parsedData);

    /** test */
    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(parsedData),
      },
      {
        name: "mode",
        type: TYPES.NVarChar,
        value: data.mode,
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

    console.log("params : ", params);

    let response = await ssm.execProc("Engin_changementEventList", params);

    console.log("response :", response);

    console.log("enter", response?.result?.[0]?.EnginEntree || "[]");
    console.log("exit", response?.result?.[0]?.EnginSortie || "[]");
    console.log("params mode", data.mode);
    console.log("responce all", response);

    let resp;

    if (data.mode == "select") {
      resp = {
        enginEnter: JSON.parse(response?.result?.[0]?.EnginEntree || "[]"),
        enginExit: JSON.parse(response?.result?.[0]?.EnginSortie || "[]"),
      };
    } else {
      resp = {};
    }

    console.log("responce", resp);

    if (Object.keys(resp).length !== 0) res.status(response.status).json(resp);
    else res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error changement event list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.ByMac = async (req, res) => {
  try {
    console.log("ok");
    let data = req.body;
    let parsedData = data.tags;

    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(parsedData),
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

    let response = await ssm.execProc("Engin_listByMac", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.statusListHistory = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    let params = [
      {
        name: "srcId",
        type: TYPES.Int,
        value: data.srcId,
      },
      {
        name: "srcObject",
        type: TYPES.NVarChar,
        value: data.srcObject,
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


    let response = await ssm.execProc("Engin_statusListHistory", params);

    for (let inv of response.result) {
      inv.geofence = await processGeofence(inv.geofence);
    }
    
    console.log('Response result : ',response.result);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.listByLocation= async (req, res) => {
  try {
    let data = req.body.data;

    console.log(data);

    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.tags),
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
        value: req?.userInfos?.attachement || 0,
      },
      {
        name: "user",
        type: TYPES.Int,
        value: req?.userInfos?.userID || 0,
      },
      
    ];

    console.log(params);

    let response = await ssm.execProc("Engin_ListByLocation", params);
    loggermodule.info("End Engin_ListByLocation");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error Engin_ListByLocation :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.getVehiculeByMac = async (req, res) => {
  try {
    console.log("ok");

    let data = req.body.data;
    let parsedData = data.tags;

    console.log("parsed Data post", parsedData);

    let params = [
      {
        name: "tags",
        type: TYPES.NVarChar,
        value: JSON.stringify(parsedData),
      },
      {
        name: "vehiculeId",
        type: TYPES.BigInt,
        value: data.vehiculeId,
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

    let response = await ssm.execProc("Engin_getVehiculeByMac", params);

    console.log("params : ", JSON.stringify(parsedData));

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.multiEnter = async (req, res) => {
  try {
    let data = req.body.data;
    let date = moment(data?.date || moment()).format("YYYY-MM-DDTHH:mm:ss");

    console.log('userId: ',data?.userInfos?.userID );

    let params = [
      {
        name: "locationID",
        type: TYPES.Int,
        value: data.locationID,
      },
      {
        name: "enginIds",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.enginIds),
      },
      {
        name: "date",
        type: TYPES.NVarChar,
        value: date,
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

    console.log("params : ",params)

    let response = await ssm.execProc("engin_saveMultipleEnter", params);

    console.log('response : ', response?.result);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.multiExit = async (req, res) => {
  try {
    let data = req.body.data;
    let date = moment(data?.date || moment()).format("YYYY-MM-DDTHH:mm:ss");

    console.log('userId: ',data?.userInfos?.userID );

    let params = [
      {
        name: "locationID",
        type: TYPES.Int,
        value: data.locationID,
      },
      {
        name: "enginIds",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.enginIds),
      },
      {
        name: "date",
        type: TYPES.NVarChar,
        value: date,
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

    console.log("params : ",params)

    let response = await ssm.execProc("engin_saveMultipleExit", params);

    console.log('response : ', response?.result);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.StatusList = async (req, res) => {
  try {
    console.log("ok");
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

    console.log("params", params);
    let response = await ssm.execProc("engin_StatusList", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.activeList = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
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

    let response = await ssm.execProc("engin_activeList", params);

    loggermodule.info("End displaying active list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying active list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    console.log("ok");

    let data = req.body.data || req.body;

    console.log('enginId ',data.enginId);

    console.log('status : ',data.status);

    let params = [
      {
        name: "enginId",
        type: TYPES.NVarChar,
        value: JSON.stringify(data.enginId),
      },
      {
        name: "status",
        type: TYPES.NVarChar,
        value: data.status,
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

    let response = await ssm.execProc("engin_updateStatus", params);

    setTimeout(()=> fetchEnginAndEmitUpdate(data.enginId.map( o => o.enginId)) , 2000)
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.enginProposed = async (req, res) => {
  try {
    console.log("ok");
    let data = req.body; 

    let params = [
	  {
        name: "reference",
        type: TYPES.NVarChar,
        value: data.reference || "",
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

    let response = await ssm.execProc("Engin_list_Proposed", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.engindashboard = async (req , res) => {
  try{
    let data = req.body.data || req.body;

    let params = [ 
	    {
        name: "dashboardDate",
        type: TYPES.NVarChar,
        value: data.dashboardDate || "",
      },
      {
        name: "vehiculeID",
        type: TYPES.Int,
        value: data.vehiculeID || 0,
      },
      {
        name: "lang",
        type: TYPES.NVarChar,
        value: data.lang || "",
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

    let response = await ssm.execProc("engin_dashboard", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  }catch(e){
    loggermodule.error(`[ENGIN] - Error in engindashboard:` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
}

exports.engindashboardDetail = async (req , res) => {
  try{
    let data = req.body.data || req.body;

    let params = [ 
      {
        name: "src",
        type: TYPES.NVarChar,
        value: data.src || "",
      },
	    {
        name: "dashboardDate",
        type: TYPES.NVarChar,
        value: data.dashboardDate || "",
      },
      {
        name: "vehiculeID",
        type: TYPES.Int,
        value: data.vehiculeID || 0,
      },
      {
        name: "lang",
        type: TYPES.NVarChar,
        value: data.lang || "",
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

    let response = await ssm.execProc("engin_dashboard_detail", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  }catch(e){
    loggermodule.error(`[ENGIN] - Error in engindashboard:` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
}

exports.setLastSeenFromFlespi = async (req , res)=>{
  try{
    let response = setEnginsLastSeenFromFlespi()
    onResult(res , response)
  }catch(e){
    onException(e , res)
  }
}

exports.statistic = async (req , res) => {
  try{
    let data = req.body.data || req.body;

    let params = [ 
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

    let response = await ssm.execProc("PROC_Engin_statistic", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  }catch(e){
    loggermodule.error(`[ENGIN] - Error in engindashboard:` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
}

exports.statisticDetail = async (req , res) => {
  try{
    let data = req.body.data || req.body;

    let params = [ 
      {
        name:"src",
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

    let response = await ssm.execProc("PROC_Engin_statistic_details", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  }catch(e){
    loggermodule.error(`[ENGIN] - Error in engindashboard:` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
}

exports.potentialDeliveredHistory = async (req , res)=>{
  try{
    loggermodule.info("Start potentialDeliveredHistory");
    let response = await getPotentialDeliveredHistory(req.body.data);
    let result = response?.result || [];
    result = await setLocationIDForData(_.cloneDeep(result) , {reload: true})
    result = result.filter( o => o.LocationID == 0)
    result = await checkPointsExcludeByPotentilArea(result);
    response.result = result.filter( o => !o.has_potential_exclude_area)
    loggermodule.info("End potentialDeliveredHistory");
    onResult(res, response)
  }catch(e){
    loggermodule.info("Error potentialDeliveredHistory:"+e.stack);
    onException(e, res)
  }
}

exports.grafanadashboards = async (req , res)=>{
    try{
      let response = await fetchEnginDashboardFromProcs(req.body?.data ||req.body)
      onResult(res, response)
    }catch(e){
      loggermodule.error("Error grafanadashboards:"+e.stack)
      onException(e, res)
    }
}

exports.enginCountByLocation = async (req , res)=>{
  try{
    let query = req.body?.data || req.body
    let response = await fetchEnginCountByLocation(query)
    onResult(res ,response)
  }catch(e){
    console.log('error:', e)
    onException(e , res)
  }
}
const processGeofence = async (geofence) => {
  if (typeof geofence === "string" && geofence !== "") {
      let parsedGeofence = JSON.parse(geofence);

      if (Array.isArray(parsedGeofence)) {
          for (let o of parsedGeofence) {
              o.path = process.env.origin + o.path;
              let name = o.path.split('/').reverse()[0];
              o.geometry = await readGeofenceFile(name);
          }
      }
      return parsedGeofence;
  }

  return geofence;
};