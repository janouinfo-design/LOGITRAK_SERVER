const { execProc } = require("#apis/sql-server-request.js");
const { TYPES } = require("tedious");

exports.fetchStatusTransitions = async (req, res) => {
  let data = req.body.data || req.body;
  let userId = req.body.userInfos.userID;
  let attachement = req.body.userInfos.attachement;

  let params = [
    {
      name: "statusId",
      type: TYPES.Int,
      value: data?.statusId || 0,
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
  let response = await execProc("Transition_List", params);
  return response;
}