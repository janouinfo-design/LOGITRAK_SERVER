const config = require(`../configs`);
const { resolvePath } = require("../helpers");
const url = require("url");

const controllers = require('../app/controllers/index');
const defaults = {
  method: "all",
};

let actions = [
  {
    name: "statistics",
    children: ["FrequencyAVG", "DeliveryNumberByWeek","ResidenceAVGInDays","DepositRotation","GetResults"],
  },
  {
    name: "communication",
    children: ["mainList", "isReadAll","list","isRead","save"],
  },
  {
    name: "positions",
    children: ["getHistorique"],
  },
  {
    name: "inventory",
    children: [
      "list",
      "get",
      "save",
      "details",
      "close",
      "byStatus",
      "scan",
      "multiscan",
      "remove"
    ],
  },
  {
    name: "vehicule",
    children: ["list", "getInfoByUser","movementHistorique","save","remove"],
  },
  {
    name: "logs",
    children: ["save", "list", "applogs"],
  },
  {
    name: "config",
    children: ["get"],
  },
  {
    name: "staff",
    children: ["list","save","saveUser","remove","tags","DisplayCalendarHistory","NotifyUser","resetUser","resetSave","getCalendarByDate","pauseTimer","getLastTimeStaff","rapport","generateXLS","updateHistory"],
  },
  {
    name: "engin",
    children: [
      "list",
      "listnoactive",
      "listhistory",
      "troubleshoot",
      "timelinelist",
      "event",
      "statut",
      "reception",
      "exit",
      "tags",
      "saveaddinfo",
      "CountTagged",
      "save",
      "remove",
      "bystatut",
      "typelist",
      "saveTypes",
      "tagLink",
      "updateImage",
      "rapport",
      "rapportList",
      "rapportGet",
      "delete",
      "activate",
      "rapportDelete",
      "changementEventList",
      "ByMac",
      "StatusList",
      "getVehiculeByMac",
      "listByLocation",
      "activeList",
      "multiEnter",
      "multiExit",
      "updateStatus",
      "getByLocation",
      "statusListHistory",
      'enginProposed',
      'engindashboard',
      'engindashboardDetail',
      'statistic',
      'statisticDetail',
      'getForMap',
      'setLastSeenFromFlespi',
      'modifyStatus',
      "generationData",
      "potentialDeliveredHistory",
      "grafanadashboards",
      "getModel",
      "enginCountByLocation"
    ],
  },
  {
    name: "device",
    children: ["list", "save","delete","updateStatus"],
  },
  {
    name: "address",
    children: ["list", "get", "save", "remove", "get_default", "save_default"],
  },
  {
    name: "invoice",
    children: ["list", "get", "save", "remove","filter"],
  },
  {
    name: "matrix",
    children: [
      "list",
      "get",
      "save",
      "remove",
      "getMatriceItems",
      "AddDimension",
      "UpdatePrixMatrice",
    ],
  },
  {
    name: "tarif",
    children: [
      "list",
      "get",
      "save",
      "remove",
      "getParamsNiveau",
      "GetParamsNiveauSrcData",
      "ClientGetPrestationList",
      "TarifGetEtat",
      "getParametres",
    ],
  },
  {
    name: "invoicePendingBilling",
    children: ["list", "save"],
  },
  {
    name: "tag",
    children: [

      "list",
      "get",
      "save",
      "remove",
      "getbyCustomer",
      "removebyCustomer",
      "saveByCustomer",
      "countTag",
      "bystatut",
      "saveBattery",
      "saveBatteryLevel",
      "savePosition",
      "listHistory",
      "saveTagHistories",
      "dashboardDetails",
      "mobdashboard",
      "chargeEngin",
      "deliverEngin",
      "returnEngin",
      "dashboard",
      "dashboarddetail",
      "tagsWithWrongEnterExitState",
      "setEnginStatusReelValues",
      "processRealEnterExitValues",
      "setReelStatusValues",
      "getLocationIDForData",
      "processPotentialPickup",
      "processPotentialDelivery",
      "processEnterExit",
      "checkDailyDelivery"
    ],
  },
  // {
  //     name: "file" , children: ["save"]
  // },
  {
    name: "user",
    children: [
      "login",
      "logout",
      "verifyUser",
      "auth",
      "getPointAttachement",
      { path: "refresh", action: "handleRefreshToken" },
      { path: "checkUserToken", action: "checkToken" },
    ],
  },
  {
    name: "deposit",
    children: ["list", "get", "save", "remove", "activate"],
  },
  {
    name: "geofencing",
    children: [
      "list",
      "get",
      "save",
      "saveDepot",
      "remove",
      "activate",
      "saveNavixy",
      "GetGeofence",
      "GetGeofenceByWorksite",
      "getGeofenceOfPoint",
      "GetGeofenceByID"
    ],
  },
  {
    name: "lang",
    children: ["list", "get", "save", "mobList"],
  },
  {
    name: "realtime",
    children: [{ path: "on", action: "onEvent" }],
  },
  {
    name: "company",
    children: ["list", "get", "save", "saveSetup"],
  },
  {
    name: "relation",
    children: ["add", "remove","save"],
  },
  {
    name: "customer",
    children: [
      {
        path: "list",
        procedure: "customer_list",
      },
      "get",
      "save",
      "remove",
      "removeWithWorksite"
    ],
  },
  {
    name: "catalog",
    children: ["list", "get", "save", "remove"],
  },
  {
    name: "provider",
    children: ["list", "save"],
  },
  {
    name: "types",
    children: [
      "list",
      "get",
      "save",
      "saveItems",
      "saveFamille",
      "trcStatusList",
      "typeItemsList",
      "iconslist",
      "remove"
    ],
  },
  {
    name: "status",
    children: ["list", "get", "save", "remove", "activate","transitions"],
  },
  {
    name: "order",
    children: ["print"],
  },
  {
    name: "file",
    children: [
      "save",
      {
        path: "upload",
        middlewareBefore: [
          require("../middlewars/multer.middleware").single("File"),
        ],
      },
    ],
  },
  {
    name: "fileGenerator",
    children: ["getStatus","save","checkFile"],
  },
  {
    name: "object",
    children: ["count","noActiveList","activate","delete"],
  },
  {
    name: "validator",
    children: ["list"],
  },
  {
    name: "worksite",
    children: ["list","save","remove"],
  },
  {
    name: "menu",
    children: ["get"],
  },
  {
    name: "xlocation",
    children: ["findAddress", "pushLocation"],
  },
  {
    name: "xnavixy",
    children: [
      "execute",
      "getTrackers",
      {
        pathGroup: [],
        action: "execute",
        middlewareBefore: [
          (req, res, next) => {
            let pathname = url.parse(req.url).pathname;
            req.query.path = pathname.replace("/xnavixy/", "");
            next();
          },
        ],
      },
    ],
  },
  {
    name: "xflespi",
    children: ["list","listHistory","streamdata"]
  },
  {
    name: "fcmtoken",
    children: ["list","save"]
  },
];

actions = setActions();

function setActions() {
  try {
    let a = [];
    for (const action of actions) {
      let controller = controllers[action.controllerName || action.name];

      if (!controller) {
        throw new Error("Invalid controller for action:" + action.name);
      }

      if (Array.isArray(action.children)) {
        for (let ch of action.children) {
          if (typeof ch == "string") ch = { path: ch };
          if (typeof controller[ch.action || ch.path] != "function")
            throw new Error(
              `Invalid action ${ch.action || ch.path} on ${
                action.controllerName || action.name
              } controller`
            );

          let middlewareBefore = ch.middlewareBefore || action.middlewareBefore;
          let middlewareAfter = ch.middlewareAfter || action.middlewareAfter;

          if (!Array.isArray(middlewareBefore)) middlewareBefore = [];
          if (!Array.isArray(middlewareAfter)) middlewareAfter = [];

          if (Array.isArray(ch.pathGroup)) {
            for (let pg of ch.pathGroup) {
              if (typeof pg == "string") {
                a.push({
                  ...defaults,
                  path: "/" + action.name + "/" + pg,
                  controller: controller[ch.action],
                  middlewareBefore,
                  middlewareAfter,
                });
              }
            }
          } else {
            a.push({
              ...defaults,
              path: "/" + action.name + "/" + ch.path,
              controller: controller[ch.action || ch.path],
              middlewareBefore,
              middlewareAfter,
            });
          }
        }
      } else {
        if (typeof controller[ch.action || ch.path] != "function")
          throw new Error(
            `Invalid action ${ch.action || ch.path} on ${
              action.controllerName || action.name
            } controller`
          );

        let middlewareBefore = action.middlewareBefore;
        let middlewareAfter = action.middlewareAfter;

        if (!Array.isArray(middlewareBefore)) middlewareBefore = [];
        if (!Array.isArray(middlewareAfter)) middlewareAfter = [];
        a.push({
          ...defaults,
          path: "/" + action.name,
          controller: controller[ch.action || ch.path],
          middlewareBefore,
          middlewareAfter,
        });
      }
    }

    return a;
  } catch (ex) {
    console.log("error on formating actions:", ex.message);
    return [];
  }
}

module.exports = actions;
