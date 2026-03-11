const { Server } = require('socket.io')

class IOModule {
    configs = {
       params: {
         cors: {
            origin: '*'
         }
       }
    }

    sockets = {}
    io = null

    constructor(){
       
    }

    init(app , configs = this.configs.params){
        Object.assign(this.configs , configs);
        if(!this.configs?.params?.cors) {
            this.configs.params = {
                cors: {
                    origin: '*'
                 }
            }
        }
        this.io = new Server(app , this.configs.params);

        this.io.on('connection', socket => {
            console.log('socket connected', socket.id)
            if(!this.sockets[socket.id])
               this.sockets[socket.id] = {}
            this.sockets[socket.id].socket = socket

            socket.on('disconnect' , (_socket , e) => {
                console.log('socket disconnected', _socket ,e)
                if(_socket?.id) delete this.sockets[_socket.id] 
            })

            this.bindSocketEvents(socket)
        })
    }

    bindSocketEvents(socket){
        if(!this.io || !Array.isArray(this.configs.events)) return
        try{
             for( const s of this.configs.events){
                 console.log('initializing.... socket for', s?.on || s)
                 if(typeof s == 'string'){
                     socket.on(s , dt => this.io.emit(s, {
                         data: dt,
                         receivedAt: new Date(),
                         socketid: socket.id
                     }))
                     continue
                 }
                 if('on' in s && typeof s?.execute == 'function'){
                     socket.on(s.on , dt => s.execute( socket , dt , this.io))
                 }
             }
         }catch(e){
             console.log(`Error binding event for socket ${socket.id}`, e.message)
         }
    }

    unbindSocketEvents(socket){
    
    }

    emit(event , data , options){
        if(this.sockets[process.socket_id] && options?.includeUser !== true){
            this.sockets[process.socket_id].socket.broadcast.emit(event , {
                ...data,
                receivedAt: new Date()
            })  
        }else if(this.io){
            this.io.emit(event , {
                ...data,
                receivedAt: new Date()
            })
        }
     }
}

module.exports = new IOModule()