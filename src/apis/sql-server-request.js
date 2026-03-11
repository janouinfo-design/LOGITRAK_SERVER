let sql = require('mssql');
const _ = require('lodash');
const loggermodule = require('#modules/loggermodule.js');
const { TYPES } = require('tedious');
const { SERVER_NAME , SERVER_PORT , DB_USER , DB_PASS ,DB_DEFAULT_DB } =  require('../configs').env
const { procedures } = require('../configs').configs?.store_procedure || {}

const sqlConfig = {
    user: DB_USER,
    password: DB_PASS,
    database: DB_DEFAULT_DB,
    server: SERVER_NAME,
    connectionTimeout: 10000,
    pool: {
      max: 50,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};
let appPool = null;
(()=>{
  if(appPool == null ) appPool = new  sql.ConnectionPool(sqlConfig);
})();

let request = (type = 'proc',req='',params = [],option = 's') =>{
    let request;
    let output = [];
    let recordsets = [];
    return new Promise((resolve,reject)=>{
        try{
            loggermodule.info(`[NSSM]: Start SQL ${req}`)
            appPool.connect().then(async pool => {
                try{
                    if(!pool){
                        throw new Error("Connexion Error: undefined pool")
                    }
                    else{
                        let request = pool.request();

                        // request.stream = true
                        
                        if(params){
                            for(let param of params){
                                request.input(param.name, param?.type?.name ? sql[param?.type?.name]: param.type,param.value)
                            }
                        }

                        
                        /*request.on('row',(data)=>{
                            output.push(data)
                        })

                        request.on('recordset', columns => {
                            recordsets.push(columns)
                        })

                        request.on('error', err => {
                            resolve({success: false , response: err.message , status: 500})
                        })
                    
                        request.on('done', result => {
                            resolve({success: true , result: recordsets.length > 0 ? recordsets[0] : result , response: {...result , recordsets}, status: 200})
                        })*/

                        if(type.toLowerCase() != 'proc')
                          output = await  request.query(req);
                        else
                          output = await  request.execute(req);
                        loggermodule.info(`NSSM]: End SQL ${req}`)
                        resolve({success: true , result: output?.recordset , detail: output, status: 200})
                    }
                }catch(e){
                     loggermodule.error(`NSSM]: Error SQL  ${req}:`+e.message)
                     resolve({result: undefined , error: e.message , status:500});
                }
            }).catch(e=> {
                loggermodule.error(`NSSM]: Error SQL  ${req}:`+e.message)
                resolve({success: false , error: e.message , status: 500})
            })
        }catch(e){
             loggermodule.error(`NSSM]: Error SQL  ${req}:`+e.message)
             resolve({result: undefined , error: e.message , status:500});
        }
        sql.on('error', e => {
            // ... error handler
            loggermodule.error(`NSSM]: Error SQL  ${req}:`+e.message)
            resolve({success: false , error: e.message , status: 500})
        })
    })
}

exports.execSql = (req='',params = [],option = 's')=>{
    return request('sql',req,params,option);
}

exports.execProc = (procName ='', paramsValues = [],option = 's')=>{

    try{
        if(!_.isArray(paramsValues) && !(procName in  procedures)) 
          return { success: false , result: 'Erreur procédurerrrr. CODE 222', status: 500}

        paramsValues = !_.isArray(paramsValues) &&  !_.isPlainObject(paramsValues) ? {} :  paramsValues
                                               
        let iParams = _.isArray(paramsValues) ? paramsValues : []

        if(_.isPlainObject(paramsValues) || !paramsValues){
            let userInfos = paramsValues.userInfos
            delete paramsValues.userInfos

            let procConfs = procedures?.[procName]
            procName = procConfs?.id || procName
            iParams = _.isArray(procConfs?.params) ? procConfs.params : [];
            
            iParams = iParams
                        .filter( t => t.name in paramsValues)
                        .map( t => ({
                            ...t , 
                            value: t.type ? paramsValues[t.name] : (paramsValues[t.name] || '').toString() , 
                            type: t.type || Types.NVarChar
                        }))
            
        }
        
        return request('proc',procName,iParams,option);

    }catch(e){
        console.log('errrror:', e.message)
        return { success: false , result: e.message, status: 500}
    }
}

exports.bulkUpdate = (payload , proc)=> {
    try{
        const tvp = {
            name: "BulkUpdateJsonPayloadType",
            columns: [
              { name: "payload", type: TYPES.NVarChar }
            ],
            rows: payload.map(d => [JSON.stringify(d)])
        };

        let params = [
            { name: 'Rows', type: TYPES.TVP, value: tvp }
        ];
        return request('proc',proc,params);
    }catch(e){
        console.log('errrror:', e.message)
        return { success: false , result: e.message, status: 500}
    }
  
}