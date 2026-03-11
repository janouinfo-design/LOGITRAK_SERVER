const loggermodule = require('#modules/loggermodule.js');
const { TYPES } = require('tedious');
let ssm = require('../../apis/sql-server-request');
const _ = require('lodash')
exports.fetchDataFromProcedure = async (procedure , options )=> {
    try{
        loggermodule.info(`Start retrieving ${options?.processKey} data`)
        let params = []
        if(options?.params){
            if(Array.isArray(options?.params)) params = options?.params
            else params = Object.entries(options?.params).map(([key, value]) => ({
                    type: TYPES.NVarChar,
                    name: key, 
                    value 
                }))
        }
        let response = await ssm.execProc(procedure, params);
        if(!response?.success) throw new Error(response?.error);
        let dt = Array.isArray(response?.result) ? response.result :[];

        if(typeof options?.execAfter == 'function'){
            options.execAfter(_.cloneDeep(dt) , _.cloneDeep(process[options.processKey]))
        }
        if(options?.processKey && typeof options?.processKey == 'string' ){
            if(typeof options.transform == 'function'){
                dt = await options.transform(_.cloneDeep(dt) , _.cloneDeep(process[options.processKey]))
            }
            process[options.processKey] = dt
        }

        loggermodule.info(`End retrieving ${options?.processKey} data`)
        return { success: response?.success , response: dt  }
    }catch(e){
        loggermodule.error(`Error retrieving ${options?.processKey} data:${e.message}`)
        return { success: false , response: e.message}
    }
}