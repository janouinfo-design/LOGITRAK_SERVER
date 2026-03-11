exports.onEnginStatusChanged = (socket, data, io) => {
  socket.broadcast.emit("engin_status_changed", data);
};


exports.onEnginStateChanges  = (socket, data, io) => {
  socket.broadcast.emit("engin_state_changed", data);
};