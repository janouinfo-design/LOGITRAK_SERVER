
const moment = require('moment')
exports.onNewLocation = (socket , data , io) => {
   socket.broadcast.emit('new_location' , {
      ...data,
      time: moment().format('HH:mm')
   })
}