
const express = require('express');
const cluster = require('cluster')
const os = require('os')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const { existsSync } = require('fs');
const path = require('path');

class ExpressModule {
    app = null
    server = null
    configs = {
        port: "3300",
        instance: -1,
        appFunctions: [],
        jsonLimit: '50mb',
        corsOptions: {
            origin: (origin, callback) => {
                callback(null, true)
                return
              if (acrow.includes(origin) || !origin || origin.includes('/localhost')) {
                   callback(null, true)
              } else {
                   callback(new Error('Origin not allowed'))
              }
            },
            methods: 'GET,POST,PUT,DELETE,OPTIONS',
            preflightContinue: false,
            optionsSuccessStatus: 204,
            // allowedHeaders: ['Content-Type'],
            credentials: true
        },
        cookieOptions: {}
    }

    constructor(configs){
        Object.assign(this.configs , configs);
        if(!Array.isArray(this.configs.appFunctions)) this.configs.appFunctions = []
        else{
            this.configs.appFunctions = this.configs.appFunctions.filter( func => typeof func == 'function')
        }
    }

    start(){
       let tasks = this.configs.instance == -1 ? os.cpus().length - 1 : this.configs.instance;
       if(isNaN(tasks)) tasks = 1;
       tasks = +tasks;
       if(process.env.NODE_ENV == 'development' || tasks < 2){
        this.createWorkerTasks();
        this.logStart();
       }else{
           if(cluster.isPrimary){
                Array.from({length: tasks}).forEach( i => {
                    cluster.fork();
                })
                cluster.on('exit' , worker => {
                    console.log(`Worker ${worker.process.pid} has been killed`);
                    console.log('start another worker');
                    cluster.fork();
                })
           }else{
             this.createWorkerTasks();
           }
       }

       return { app: this.app , server: this.server}
    }

    logStart(){
        if(!this.logger) return;
        logger.info('App started');
        logger.info(`App started on http://localhost:${this.configs.port}`)
    }

    createWorkerTasks(){
        let app = express();
        console.log(`#Worker pid=${process.pid}`)
        app.use(
            express.urlencoded({ extended: true}),
            express.json({extended: true , limit: this.configs.jsonLimit}),
            cookieParser(this.configs.cookieOptions),
            cors(this.configs.corsOptions)
        )

        this.configs.appFunctions.forEach( func => func(app));
       
        let root = path.join(process.cwd(), 'dist')
        if(existsSync(path.join(process.cwd(), 'dist/index.html'))){
            app.use(express.static(root));
        }
        app.use('**', (req , res)=> {
            if(existsSync(path.join(process.cwd(), 'dist/index.html'))){
                res.sendFile('index.html', { root })
            }else{
                res.status(404).json({response: 'Ressource not found'});
            }
        })
       
        const server = http.createServer(app);

        if(this.configs.socket?.module){
            this.configs.socket.module.init(server, {
                events: Array.isArray(this.configs.socket?.events) ? this.configs.socket.events: [],
                params: this.configs.socket?.params || {}
            })
        }else if(this.configs.initIo !== false){
            this.IO = new Server(server , {
                cors: {
                    origin: "*"
                }
            })
            if(this.configs.socketStarter){
                this.configs.socketStarter(this.IO)
            }

            if(typeof this.configs.onConnect == 'function'){
                this.configs.onConnect({io: this.IO , instance: this})
            }
            this.initSockets();
        }
        
        server.listen(this.configs.port , ()=> {
            if(this.configs.logger)
              this.configs.logger.info(`#App started on http://localhost:${this.configs.port}`)
        })

        this.app = app
        this.server = server
        return { app , server }
       
    }

    getIoInstance(){
        return this.IO
    }
    initSockets(){
       if(!this.IO) return
       this.IO.on('connection', socket => {
          if(this.configs.logger)
            this.configs.logger.info(`new socket connected (${socket.id})`)
          this.initSocketEvents(socket)
       })
    }

    initSocketEvents(socket){
       if(!this.IO || !Array.isArray(this.configs.sockets)) return
       try{
            for( const s of this.configs.sockets){
                console.log('initializing.... socket for', s?.on || s)
                if(typeof s == 'string'){
                    socket.on(s , dt => this.IO.emit(s, {
                        data: dt,
                        receivedAt: new Date(),
                        socketid: socket.id
                    }))
                    continue
                }
                if('on' in s && typeof s?.execute == 'function'){
                    socket.on(s.on , dt => s.execute( socket , dt , this.IO))
                }
            }
        }catch(e){
            console.log(`Error binding event for socket ${socket.id}`)
        }
    }
}

module.exports = ExpressModule