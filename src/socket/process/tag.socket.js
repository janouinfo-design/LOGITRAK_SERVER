exports.onTagStatusChanged = (socket, data, io) => {
  socket.broadcast.emit("tag_status_changed", data);
};
