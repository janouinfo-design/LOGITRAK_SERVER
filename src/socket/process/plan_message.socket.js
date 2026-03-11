
const moment = require('moment')
exports.onMessage = (socket , data , io) => {
   io.emit('plan_message' , {
      ...data,
      time: moment().format('HH:mm')
   })
}