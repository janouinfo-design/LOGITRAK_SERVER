
const loggermodule = require("#modules/loggermodule.js")
const { onResult, onException } = require("#utils/error.utl.js")
const { executeNavixy, getTrackersState } = require("./navixy.service.js")
const _ = require('lodash')

exports.execute = async (req , res)=> {
    try{
        if(req.query.path){
            let response = await executeNavixy(req.query.path , req.body || {} )
            res.json(response)
        }else{
            throw new Error('params path not specified')
        }
    }catch(e){
       res.status(403).json({success: false , response: e.message})
    }
}

exports.getTrackers = async (req , res)=>{
    try{
        loggermodule.info("Start getVehicles")
        let list = await executeNavixy('tracker/list')
        if(Array.isArray(list.list)){
            list = list.list;
            let trackers = list.map(o => o.id);
            let trakersState = await getTrackersState(trackers)
            if(_.isPlainObject(trakersState.states)){
                list = list.map( o => {
                    let state = trakersState.states[o.id];
                    if(state){
                        return { 
                            ...o,
                            state
                        }
                    }
                    return o
                })
            }
            process.trackers = trackers
        }
        loggermodule.info("End getVehicles")
        onResult(res, list)
    }catch(e){
        loggermodule.error("Error getVehicles:"+e.message)
        onException(e , res)
    }
}





