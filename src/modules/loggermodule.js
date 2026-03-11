const winston = require('winston');

const customFormat = winston.format( info => {
    let d = new Date()
    const format = `${d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0')+' '+d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0')+':'+d.getSeconds().toString().padStart(2,'0')+'.'+d.getMilliseconds()}`
    info.message = `[${format}] ${info.message}`
    info.level = (info.level || '').toUpperCase()
    return info
})

class LoggerModule {
    
    static instance = null

    config = {
      init: false,
      directory: 'logs',
      logStream: 'logs.log',
      maxsize: 50 * 1024 * 1024,
      maxFiles: 10
    }

    processid = process.env.pm_id ||  -1
    stackSeparator = "\n"

    init(config){
       Object.assign(this.config , config);
       this.logger = this.getLogger(this.config.logStream)
       this.debugLogger = this.getLogger(this.config.logStream.replace('.log', '_debug.log'))
       this.config.init = true
    }

    getInstance(){
       if(LoggerModule.instance == null)
        LoggerModule.instance = new LoggerModule()

       return LoggerModule.instance
    }

    on(eventName, listener) {
        return this.eventEmitter.on(eventName, listener);
    }
    
    getStack(error, index, count) {
        const splited = error.stack.split(this.stackSeparator)
        const spliced = count ? splited.splice(index, count) : splited.splice(index)
        return spliced.map(item => item.trim()).join(this.stackSeparator)
    }
    
    getErrorStack = error => error ? this.getStack(error, 1) : this.getStack(new Error(), 3, 1)

    log(level , message , error){
        if(!this.config.init) throw new Error('Init logger before !!!')

        if(level == 'debug')
         this.debugLogger.log(level,message)
        else
         this.logger.log(level,message)
    }

    getLogger(filename){
        return new winston.Logger({
            transports: [
                new winston.transports.Console({level: 'info'}),
                new winston.transports.File({
                    filename: this.config.directory+'/'+filename , 
                    level: 'debug',
                    handleExceptions: true,
                    handleRejections: true,
                    maxsize: this.config.maxsize,
                    maxFiles: this.config.maxFiles,
                })
            ],
            format: winston.format.combine(
                customFormat(),
                winston.format.simple()
            )
        })
    }

    debug(message, error) {
		this.log("debug", message, this.getErrorStack(error))
	}
	infoDebug(message, error) {
		this.log("info", message, "", true)
	}
	info(message, error) {
		this.log("info", message)
	}
	warn(message, error) {
		this.log("warn", message)
	}
	error(message, error) {
		this.log("error", message, this.getErrorStack(error))
	}
}

module.exports = (new LoggerModule()).getInstance()