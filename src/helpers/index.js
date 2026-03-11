const moment = require('moment')
const { resolve } = require('path')
function formatCurrentDate(format){
    return moment().format(format)
}

function resolvePath(...parameters){
   return resolve(...parameters)
}

module.exports = {
    formatCurrentDate,
    resolvePath
}