require('dotenv').config();
const TTModule = require('@omniyat/tomtommodule')
const ssm = require("../apis/sql-server-request");
const loggermodule = require("../modules/loggermodule.js");
const initSwaggerDocs = require("../libs/swagger.lib");
const { PORT } = require("../configs/index").env;
const initialize = require("./app.js");
const ExpressModule = require("../modules/expressmodule.js");
const iomodule = require("../modules/iomodule.js");
const socketEvents = require("../socket/config.js");
const { initJobsProcessing } = require("../jobs/index.js");
const { initializeScannedTags } = require("#modules/tag/tag.util.js");
loggermodule.init();
const appConfigs = {
  port: PORT,
  appFunctions: [
    (app) => initSwaggerDocs(app, PORT),
    initialize,
    (app) => {
      initSwaggerDocs(app, PORT)
      initJobsProcessing();
      initializeScannedTags();
    }
  ],
  logger: loggermodule,
  initIo: false,
  instance: 2
};

let app = new ExpressModule(appConfigs);

app.start();

if(!iomodule.io){
  iomodule.init(app.server, { events: socketEvents.sockets });
}

TTModule.init({
  apiKey: process.env.TOMTOM_APIKEY
})
