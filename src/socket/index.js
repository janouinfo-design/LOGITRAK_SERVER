const { sockets } = require('./config')
const moment = require('moment')
exports.initSocket = ( io )=> {

    if(!Array.isArray(sockets)) return
    io.on('connection' , (socket)=> onSocketConnected(socket , io) )
}

const onSocketConnected = (socket , io)=> {
    try{
        for( const s of sockets){
           if('on' in s && typeof s?.execute == 'function'){
              socket.on(s.on , dt => s.execute( socket , dt , io))
           }
        }
    }catch(e){
        console.log(`Error binding event for socket ${socket.id}`)
    }
}