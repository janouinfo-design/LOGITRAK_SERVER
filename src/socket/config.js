const planSocket = require("./process/plan_message.socket");
const defaultSocket = require("./process/default.socket");
const tagSocket = require("./process/tag.socket");
const enginSocket = require("./process/engin.socket");
const dataSocket = require("./process/data_message.socket");
const tagPositionSocket = require("./process/tag_position.socket");

module.exports = {
  sockets: [
    {
      on: "plan_message",
      execute: planSocket.onMessage,
    },
    {
      on: "connection",
      execute: defaultSocket.onConnection,
    },
    {
      on: "tag_status_changed",
      execute: tagSocket.onTagStatusChanged,
    },
    {
      on: "engin_status_changed",
      execute: enginSocket.onEnginStatusChanged,
    },
    {
      on: "engin_state_changed",
      execute: enginSocket.onEnginStateChanges,
    },
    {
      on: "data_message",
      execute: dataSocket.onDataMessage,
    },
    {
      on: "new_location",
      execute: dataSocket.onNewLocation,
    },
    {
      on: "tag_position",
      execute: tagPositionSocket.onTagPosition,
    },
  ],
};
