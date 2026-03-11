const { fetchAppData } = require("#modules/data/job.js");

const { navixyProcess } = require("#modules/data/job.js");
const { getAndEmitTackerStates, getGpsIdents } = require("#modules/navixy/navixy.service.js");
const { processPotentialPickup, processPotentialDelivery, processStatusInDeposit, processDelivery } = require("#modules/tag/tag.util.js");

const { sendNotification} = require("#modules/fcmtoken/fcmtoken.service.js");

module.exports = [
    {
        name: "fetch app data",
        cron: "*/5 * * * *",
        alert: fetchAppData,
        immediate: true
    },
    {
        name: "fetch navixy data",
        cron: "*/120 * * * * *",
        alert: navixyProcess
    },
    {
        name: "fetch navixy trackers states",
        cron: "1 */5 * * * *",
        alert: getAndEmitTackerStates
    },
    {
        name: "update local navixy trakers idents",
        cron: "1 */59 * * * *",
        alert: getGpsIdents,
        immediate: true
    },
    {
        name: "Process pentential pickup",
        cron: "1 59 23 * * *",
        alert: ()=> processPotentialPickup(true)
    },
    {
        name: "Process pentential delivery",
        cron: "0 0 3 * * *",
        alert: ()=> processPotentialDelivery(true)
    },
    {
        name: "Process processDelivery",
        cron: "*/10 0 22 * * *",
        alert: ()=> processDelivery(true)
    },
    {
        name: "Send Notification",
        cron: "0 * * * * *", // Every minute
        alert: () => sendNotification() 
    },
    {
        name: "Set engin in deposit",
        cron: "*/60 * * * * *", // Every minute
        alert: () => processStatusInDeposit()
    }
]