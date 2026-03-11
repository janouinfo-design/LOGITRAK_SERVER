const ssm = require("../../apis/sql-server-request");
const { TYPES } = require("tedious");
const loggermodule = require("#modules/loggermodule.js");

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

    let response = await ssm.execProc("vehicule_list",params);
    loggermodule.info("End displaying list");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error displaying list :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};

exports.getInfoByUser = async (req, res) => {
  try {
    let data = req.body.data || req.body;

    
    console.log("data vehicule", data);

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

    let response = await ssm.execProc("vehicule_getInfoByUser", params);

    loggermodule.info("End getting vehicule statistics");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error getting vehicule statistics :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};



exports.movementHistorique = async (req, res) => {
  try {
    let data = req.body.data;
    console.log("data vehicule", data);

    let params = [
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

    let response = await ssm.execProc("vehicule_movementHistorique", params);

    console.log('response',response)

    loggermodule.info("End getting vehicule_movementHistorique");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error getting vehicule_movementHistorique :` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};


exports.save = async (req, res) => {
  try{
    let data = req.body.data || req.body;

    let params = [
      {
        name: "id",
        type: TYPES.Int,
        value: data.id || 0,
      },
      {
        name: "name",
        type: TYPES.NVarChar,
        value: data.name || "",
      },
      {
        name: "label",
        type: TYPES.NVarChar,
        value: data.label || "",
      },
      {
        name: "active",
        type: TYPES.Int,
        value: data.active || 0,
      },
      {
        name: "providerId",
        type: TYPES.Int,
        value: data.providerId || 0,
      },
      {
        name: "model",
        type: TYPES.NVarChar,
        value: data.model || "",
      },
      {
        name: "fuelTypeId",
        type: TYPES.Int,
        value: data.fuelTypeId || 0,
      },
      {
        name: "subtypeid",
        type: TYPES.Int,
        value: data.subtypeid || 0,
      },
      {
        name: "speedmax",
        type: TYPES.Int,
        value: data.speedmax || 0,
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
        value: data.fuelconsumption100km || 0,
      },
      {
        name: "tankcapcityl",
        type: TYPES.Int,
        value: data.tankcapcityl || 0,
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
        name: "userID",
        type: TYPES.Int,
        value: data.userID || 0,
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

   let response = await ssm.execProc("vehicule_save", params);

  loggermodule.info('End saving vehicule ')
  res.status(response.status).json(response);

}catch(e){
  loggermodule.error(`Error saving vehicule :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
};


exports.remove = async (req, res) => {
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

    let response = await ssm.execProc("vehicule_remove", params);
    loggermodule.info("Vehicule deleted successfully");
    res.status(response.status).json(response);
  } catch (e) {
    loggermodule.error(`Error deleting Vehicule ` + e.message);
    res.status(500).json({ success: false, res: e.message });
  }
};