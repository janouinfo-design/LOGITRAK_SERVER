exports.onConnection = (socket , data)=> {
    console.log('new connection')
    socket.emit('connection', data)
}


