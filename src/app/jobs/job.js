const schedule = require("node-schedule");

const moment = require("moment");
const { executeNavixy } = require("#modules/navixy/navixy.service.js");

const job = schedule.scheduleJob("1 * * * * *", async function () {
  try {
    console.log("process");
    const result = await navixyProcess();
    console.log("Result from navixyProcess:", result);
  } catch (e) {
    console.error("Error occurred during navixyProcess:", e.message);
  }
});

async function navixyProcess() {
  let dateFrom = moment().subtract(5, 'seconds').format("YYYY-MM-DDTHH:mm:ss");
  let dateTo = moment().format("YYYY-MM-DDTHH:mm:ss");
  console.log('date From ', dateFrom)
  console.log('date To ', dateTo)

  let result = await executeNavixy("beacon/data/read", {
    from: dateFrom,
    to: dateTo,
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, 1000); // 1 second delay for example
  });
}

module.exports = {
  job,
  navixyProcess,
};