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


let { emitUpdateStaffStats} = require("#modules/tag/tag.util.js");


exports.list = async (req, res) => {
  try{
    let data = req.body.data || req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    let params = [
      {
        name: "type",
        type: TYPES.NVarChar,
        value: data.type || "",
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


   let response = await ssm.execProc("Staff_list", params);

  loggermodule.info('End displaying list')
  res.status(response.status).json(response);

}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
};

exports.save = async (req, res) => {
  try{
    
    let data = req.body.data;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    console.log('staff save data : ',data )

    console.log('data birthday', data.birthday );

    let birthdayDate = data.birthday ? moment(data.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
    let hiredayDate = data.hireday ? moment(data.hireday, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
      },
      {
        name: "firstname",
        type: TYPES.NVarChar,
        value: data.firstname || "",
      },
      {
        name: "lastname",
        type: TYPES.NVarChar,
        value: data.lastname || "",
      },
      {
        name: "typeId",
        type: TYPES.Int,
        value: data.typeId || 0,
      },
      {
        name: "birthday",
        type: TYPES.Date,
        value: birthdayDate,
      },
      {
        name: "hireday",
        type: TYPES.Date,
        value: hiredayDate,
      },
      {
        name: "exitday",
        type: TYPES.Date,
        value: data.exitday || null,
      },
      {
        name: "companyId",
        type: TYPES.Int,
        value: data.companyId || 0,
      },
      {
        name: "departementId",
        type: TYPES.Int,
        value: data.departementId || 0,
      },
      {
        name: "active",
        type: TYPES.Int,
        value: data.active || 0,
      },
      {
        name: "point_attachement",
        type: TYPES.Int,
        value: attachement || 1,
      },
      {
        name: "user",
        type: TYPES.Int,
        value: userId || 1,
      },
    ];

    console.log('params : ',params);

   let response = await ssm.execProc("Staff_save", params);

  loggermodule.info('End saving Staff ')
  res.status(response.status).json(response);

}catch(e){
  loggermodule.error(`Error saving Staff :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
};

/** Staff/save_user */
exports.saveUser = async (req, res) => {
  try{
    let data = req.body.data;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
      },
      {
        name: "login",
        type: TYPES.NVarChar,
        value: data.login || "",
      },
      {
        name: "addrMail",
        type: TYPES.NVarChar,
        value: data.addrMail || "",
      },
      {
        name: "pass",
        type: TYPES.NVarChar,
        value: data.pass || "",
      },
      {
        name: "pwd2",
        type: TYPES.NVarChar,
        value: data.pwd2 || "",
      },
      {
        name: "rest",
        type: TYPES.Int,
        value: data.rest || 0,
      },
      {
        name: "active",
        type: TYPES.Int,
        value: data.active || 0,
      },
      {
        name: "point_attachement",
        type: TYPES.Int,
        value: attachement || 1,
      },
      {
        name: "user",
        type: TYPES.Int,
        value: userId || 1,
      },
    ];

    console.log('test data : ',req?.userInfos?.userID || 0 );

   let response = await ssm.execProc("Staff_user_save", params);

  loggermodule.info('End saving user ')
  res.status(response.status).json(response);

}catch(e){
  loggermodule.error(`Error saving user :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
};



exports.remove = async (req, res) => {
  try{
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

   let response = await ssm.execProc("Staff_remove", params);

  loggermodule.info('End displaying list')
  res.status(response.status).json(response);

}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
};



exports.tags = async (req, res) => {
  try {
    let data = req?.body?.data || req.body;

    console.log('data : ', req?.body?.data);

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

    let response = await ssm.execProc("staff_tags", params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.DisplayCalendarHistory = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "srcId",
        type: TYPES.NVarChar,
        value: data.srcId || "",
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
        name : "staffList",
        type: TYPES.NVarChar,
        value : data.staffList || ""
      },
      {
        name : "filterIsError",
        type: TYPES.Int,
        value : data.filterIsError || null
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

    let response = await ssm.execProc("TimeMgt_DisplayCalendarHistory", params);

    console.log('parameters DisplayCalendarHistory : ',params);

    

  
    loggermodule.info("End DisplayCalendarHistory action");
    res.status(response.status).json( response );
  } catch (e) {
    loggermodule.error(`Error DisplayCalendarHistory action :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.NotifyUser = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "Id",
        type: TYPES.Int,
        value: data.Id || 0,
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

    let response = await ssm.execProc("TimeMgt_NotifyUserAboutEndingWork", params);

    loggermodule.info("End NotifyStaff action");
    res.status(response.status).json( response );
  } catch (e) {
    loggermodule.error(`Error NotifyStaff action :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.resetUser = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "login",
        type: TYPES.NVarChar,
        value: data.login,
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

    let response = await ssm.execProc("reset_checkUser", params);

    loggermodule.info("End resetUser action");
    res.status(response.status).json( response );
  } catch (e) {
    loggermodule.error(`Error resetUser action :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};



exports.resetSave = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id,
      },
      {
        name: "pass",
        type: TYPES.NVarChar,
        value: data.pass,
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

    let response = await ssm.execProc("reset_save", params);

    loggermodule.info("End resetSave action");
    res.status(response.status).json( response );
  } catch (e) {
    loggermodule.error(`Error resetSave action :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.getLastTimeStaff = async (req, res) => {
  try {
    //publication
    let data = req.body.data || req.body;

    let params = [
      {
        name: "srcId",
        type: TYPES.Int,
        value: data.srcId || 0,
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

    let response = await ssm.execProc("getLastTimeStaff", params);

    /** 
    const datetimeWithTimezone = response.result[0].datetimeStaff; // ex: '2025-04-03 19:25:43.0000000 +02:00'
    const datePauseWithTimezone = response.result[0].datePauseStaff; // ex: '2025-04-03 19:25:43.0000000 +02:00'

    let diffInMinutes, pauseTimeInMin;

  
    // Check if it's a string (likely a datetimeoffset), otherwise assume float
    if  (datetimeWithTimezone instanceof Date)  {

      const staffMoment = moment.parseZone(datetimeWithTimezone); // preserves timezone
      const now = moment.utc();
      diffInMinutes = now.diff(staffMoment, "minutes", true);
      console.log("datetimeoffset detected, duration (in minutes):", diffInMinutes);


    } else if (typeof datetimeWithTimezone === "number") {
      // Already a float representing minutes
      diffInMinutes = datetimeWithTimezone;
      pauseTimeInMin = datePauseWithTimezone
      console.log("float detected, duration (in minutes):", diffInMinutes);



    } else {
      // Fallback case
      throw new Error("Unexpected data type for datetimeStaff");
    }*/

  
    loggermodule.info("End getLastTimeStaff action");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error getLastTimeStaff action :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.pauseTimer = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "srcId",
        type: TYPES.Int,
        value: data.srcId || 0,
      },
      {
        name : "action",
        type: TYPES.NVarChar,
        value : data.action || ""
      },
      {
        name : "LocationID",
        type: TYPES.Int,
        value : data.LocationID || 0
      },
      {
        name : "LocationObject",
        type: TYPES.NVarChar,
        value : data.LocationObject || ""
      },
      {
        name : "lat",
        type: TYPES.NVarChar,
        value : (data.lat || 0).toString()
      },
      {
        name : "lng",
        type: TYPES.NVarChar,
        value : (data.lng || 0).toString()
      },
      {
        name : "dateTimeZone",
        type: TYPES.NVarChar,
        value :  data.dateTimeZone || null
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

    let response = await ssm.execProc("Staff_pauseTimer", params);

    console.log('params pause timer : ',params);
    
    emitUpdateStaffStats(params.filter(param => param.name !== "action"), data.srcId);
  
    loggermodule.info("End displaying list");
    res.status(response.status).json( response );
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.getCalendarByDate = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name : "dateFrom",
        type: TYPES.Date,
        value : data.dateFrom || null
      },
      {
        name : "dateTo",
        type: TYPES.Date,
        value : data.dateTo || null
      },
      {
        name : "staffList",
        type: TYPES.NVarChar,
        value : data.staffList || ""
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

    let response = await ssm.execProc("TimeMgt__GetUserWorkPauseTimeByMonth", params);

    console.log('response result :',response.result);



       /*Transform result to desired format
    const transformed = response.result.map(item => {
      const timeEntries = {};
      const resultItem = {};

      for (const key in item) {
        if (/^\d{2}$/.test(key)) {
          const day = parseInt(key, 10); // Convert '01' -> 1
          timeEntries[day] = item[key]; // Keep even if value is 0
        } else {
          resultItem[key] = item[key]; // Copy other properties
        }
      }

      return {
        ...resultItem,
        timeEntries,
      };
    });*/

 // Transform result to desired format
  const transformed = (response.result || []).map(item => {
  const timeEntries = {};
  const resultItem = {};

  for (const key in item) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) { // Match keys in YYYY-MM-DD format
      timeEntries[key] = item[key]; // Use the MM-DD key directly
    } else {
      resultItem[key] = item[key]; // Copy other properties
    }
  }

  return {
    ...resultItem,
    timeEntries,
  };
});

   console.log('check transformed Results :', transformed);

    console.log('check transformated Results :', transformed);
    

    loggermodule.info("End displaying getCalendarByDate list");
    res.status(200).json( transformed );
  } catch (e) {
    loggermodule.error(`Error displaying getCalendarByDate list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};



exports.rapport = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "staffList",
        type: TYPES.NVarChar,
        value: data.staffList || "",
      },
      {
        name: "object",
        type: TYPES.NVarChar,
        value: data.object || "staff",
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
        name: "title",
        type: TYPES.NVarChar,
        value: data.title || "",
      },
      {
        name: "templateName",
        type: TYPES.NVarChar,
        value: data.templateName || "",
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

 
    let response = await ssm.execProc("staff_generateRapportCalendar", params);

    console.log("response ", response);


    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};



exports.generateXLS = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    let params = [
      {
        name: "staffList",
        type: TYPES.NVarChar,
        value: data.staffList || "",
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
        name: "templateName",
        type: TYPES.NVarChar,
        value: data.templateName || "",
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

 
    let response = await ssm.execProc("FileGenerators_saveStaffCalendar", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};



exports.updateHistory = async (req, res) => {
  try {
    // update history
    let data = req.body.data || req.body;

    let params = [
      {
        name: "satId",
        type: TYPES.BigInt,
        value: data.satId || 0,
      },
      {
        name: "satIdTo",
        type: TYPES.BigInt,
        value: data.satIdTo || 0,
      },
      {
        name: "historyDateFrom",
        type: TYPES.NVarChar,
        value: data.historyDateFrom || "",
      },
      {
        name: "historyDateTo",
        type: TYPES.NVarChar,
        value: data.historyDateTo || "",
      },
      {
        name: "command",
        type: TYPES.NVarChar,
        value: data.command || "",
      },
      {
        name: "srcId",
        type: TYPES.BigInt,
        value: data.srcId || 0,
      },
      {
        name: "srcObject",
        type: TYPES.NVarChar,
        value: data.srcObject || "",
      },
      {
        name: "status",
        type: TYPES.Int,
        value: data.status || 0,
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

 
    let response = await ssm.execProc("ValidateAndInsertHistory_V3", params);

    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};