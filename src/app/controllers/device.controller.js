const ssm = require("../../apis/sql-server-request");
const { TYPES } = require("tedious");
const { findAddress } = require("../../services/location.service");
const loggermodule = require("#modules/loggermodule.js");
const _ = require("lodash");


exports.list = async (req, res) => {
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
  
      let response = await ssm.execProc("Device_list", params);
  
      loggermodule.info("End displaying list");
      res.status(response.status).json(response);
    } catch (e) {
      loggermodule.error(`Error displaying list :` + e.message);
      res.status(500).json({ success: false, res: e.message });
    }
  };
  

exports.save = async (req, res) => {
    try {
      let data = req.body.data || req.body;

      let userId = req.body.userInfos.userID;
      let attachement = req.body.userInfos.attachement;

    
      let params = [
        {
          name: "id",
          type: TYPES.Int,
          value: data.id || 0,
        },
        {
          name: "code",
          type: TYPES.NVarChar,
          value: data.code || "",
        },
        {
          name: "label",
          type: TYPES.NVarChar,
          value: data.label || "",
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
          name: "rssi",
          type: TYPES.Int,
          value: data.rssi || 0,
        },
        {
          name: "srcObject",
          type: TYPES.NVarChar,
          value: data.srcObject || "",
        },
        {
          name: "mode",
          type: TYPES.NVarChar,
          value: data.mode || "",
        },
        /*{
          name: "exitLat",
          type: TYPES.NVarChar,
          value: data.exitLat || "",
        },
        {
          name: "exitLng",
          type: TYPES.NVarChar,
          value: data.exitLng || "",
        },*/
        {
          name: "exitLat",
          type: TYPES.Float,
          value: data.exitLat || 0,
        },
        {
          name: "exitLng",
          type: TYPES.Float,
          value: data.exitLng || 0,
        },
        {
          name: "active",
          type: TYPES.Int,
          value: data.active || 1,
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
  
      let response = await ssm.execProc("Device_save", params);
      loggermodule.info("Device saved successfully");
      res.status(response.status).json(response);
    } catch (e) {
      loggermodule.error(`Error saving device ` + e.message);
      res.status(500).json({ success: false, res: e.message });
    }
  };


  exports.delete = async (req, res) => {
    try {
      let data = req.body.data || req.body;

      let userId = req.body.userInfos.userID;
      let attachement = req.body.userInfos.attachement;

      let params = [
        {
          name: "id",
          type: TYPES.Int,
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
  
      let response = await ssm.execProc("Device_delete", params);
      loggermodule.info("Device deleted successfully");
      res.status(response.status).json(response);
    } catch (e) {
      loggermodule.error(`Error deleting device ` + e.message);
      res.status(500).json({ success: false, res: e.message });
    }
  };


  exports.updateStatus = async (req, res) => {
    try {
      let data = req.body.data || req.body;

      let userId = req.body.userInfos.userID;
      let attachement = req.body.userInfos.attachement;

      let params = [
        {
          name: "gatewayId",
          type: TYPES.Int,
          value: data.gatewayId || 0,
        },
        {
          name: "status",
          type: TYPES.Int,
          value: data.status || 0,
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
  
      let response = await ssm.execProc("Gateway_updateStatus", params);
      loggermodule.info("Device deleted successfully");
      res.status(response.status).json(response);
    } catch (e) {
      loggermodule.error(`Error deleting device ` + e.message);
      res.status(500).json({ success: false, res: e.message });
    }
  };