const ssm = require("../../apis/sql-server-request");
const { TYPES } = require("tedious");
const { findAddress } = require("../../services/location.service");
const { userInfo } = require("os");
const iomodule = require("#modules/iomodule.js");
const loggermodule = require("#modules/loggermodule.js");
const { some } = require("lodash");
const _ = require('lodash');
const { onResult , onException } = require('#utils/error.utl.js')
const { findGeofenceOfPoints } = require('#utils/geometry.utl.js');
let moment = require("moment")


 

exports.FrequencyAVG = async (req, res) => {
    try{
      let data = req.body.data || req.body;
  
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
  
  
     let response = await ssm.execProc("statistics_FrequencyAVG", params);
  
    loggermodule.info('End displaying list')
    res.status(response.status).json(response);
  
  }catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
  };


  exports.DeliveryNumberByWeek = async (req, res) => {
    try{
      let data = req.body.data || req.body;
  
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
  
  
     let response = await ssm.execProc("statistics_DeliveryNumberByWeek", params);
  
    loggermodule.info('End displaying list')
    res.status(response.status).json(response);
  
  }catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
  };


  exports.ResidenceAVGInDays = async (req, res) => {
    try{
      let data = req.body.data || req.body;
  
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
  
  
     let response = await ssm.execProc("statistics_ResidenceAVGInDays", params);
  
    loggermodule.info('End displaying list')
    res.status(response.status).json(response);
  
  }catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
  };



  exports.DepositRotation = async (req, res) => {
    try{
      let data = req.body.data || req.body;
  
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
  
  
     let response = await ssm.execProc("statistics_DepositRotation", params);
  
    loggermodule.info('End displaying list')
    res.status(response.status).json(response);
  
  }catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
};

exports.GetResults = async (req, res) => {
    try {
        let data = req.body.data || req.body;

        let userId = req.body?.userInfos?.userID || 0;
        let attachement = req.body?.userInfos?.attachement || 0;

        let params = [
          {
              name: "statisticType",
              type: TYPES.NVarChar,
              value: data.statisticType || "",
          },
          {
            name: "periodType",
            type: TYPES.NVarChar,
            value: data.periodType || "",
          },
          {
            name: "enginModel",
            type: TYPES.NVarChar,
            value: data.enginModel || "",
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

        // Execute the stored procedure
        let response = await ssm.execProc("statistics_GetResults", params);

        // Log the raw response for debugging
        console.log('Raw Response:', response.result);

        // Check if the response contains the JSON string
        if (
            Array.isArray(response.result) &&
            response.result.length > 0 &&
            response.result[0]['JSON_F52E2B61-18A1-11d1-B105-00805F49916B']
        ) {
            // Extract the JSON string from the response
            const jsonString = response.result[0]['JSON_F52E2B61-18A1-11d1-B105-00805F49916B'];

            // Parse the JSON string into a proper JSON object
            const parsedJson = JSON.parse(jsonString);

            // Replace the raw result with the parsed JSON
            response.result = parsedJson;
        } else {
            // Handle cases where the JSON string is missing or invalid
            loggermodule.error('Invalid or missing JSON response from stored procedure');
            throw new Error('Invalid or missing JSON response from stored procedure');
        }

        // Log the parsed JSON response for debugging
        console.log('Parsed JSON Response:', response.result);

        // Return the parsed JSON response
        loggermodule.info('End displaying list');
        res.status(response.status || 200).json({ success: true, result: response.result });

    } catch (e) {
        loggermodule.error(`Error displaying list: ${e.message}`);
        res.status(500).json({ success: false, message: e.message });
    }
};