
const { default: axios } = require("axios")
const { xNavixy } = require('../../configs/index.js')
const _ = require('lodash')
const loggermodule = require('#modules/loggermodule.js')
const iomodule = require('#modules/iomodule.js')
const auth = {
    hash: ''
}
async function executeNavixy(url , data , method = 'POST'){
    try{
        let params = {
            hash: auth.hash
        }
        if(!_.isPlainObject(data) && !Array.isArray(data)) data = {}
        let bUrl = (xNavixy.api.baseUrl+url)
        params = {...params, ...data}
        let obj = {
            url: bUrl,
            data,
            params,
            method
        }
        let result = await axios(obj)
        if(result.data?.success === false && result.data?.status?.code == 3){
            throw { message: result.data?.status?.description , code: result.data?.status?.code }
        }

        return result.data

    }catch(e){
         if((e?.code == 3 || e.response?.data?.status?.code == 3) && url != 'user/auth'){
            let authRes = await executeNavixy('user/auth' , { 
                login: xNavixy.user.login,
                password: xNavixy.user.password
            });
            if(authRes?.hash){
                auth.hash = authRes?.hash;
                return await executeNavixy(url , data , method)
            }
         }
         return e.response?.data || { success: false , response: e.message }
    }
}

async function getTrackersState(trackers){
    try{
        if(!trackers) trackers = process.trackers
        if(!Array.isArray(trackers)) return {response: 'No tracker specified'}
        let data = await executeNavixy('tracker/get_states', {
            trackers
        })
        return data
    }catch(e){
        loggermodule.error('Error getTrackersState');
        return []
    }
}

async function getAndEmitTackerStates(){
    try{
        let states = await getTrackersState(process.trackers);
        if(_.isPlainObject(states?.states)){
            iomodule.emit('navixy_trackers_state', {
                data: states.states
            })
        }
    }catch(e){

    }
}


async function getGpsIdents(){
    try{
        loggermodule.info("Start getGpsIdents")
        let list = await executeNavixy('tracker/list')
        if(Array.isArray(list.list)){
            list = list.list;
            process.tracker_idents = list.map(o => o.source.device_id);
        }
        loggermodule.info("End getGpsIdents")
    }catch(e){
        loggermodule.error("Error getGpsIdents:"+e.message)
    }

    loggermodule.info('[TRAKERS IDENTS]:'+process.tracker_idents)
    return process.tracker_idents
}

/**
async function getTrackersList() {
    try{
        loggermodule.info("Start getting Trackers list")
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
        loggermodule.info("End getting Tracker list")
        return list
    }catch(e){
        loggermodule.error("Error getting Tracker list:"+e.message)
        onException(e , res)
    }
}
 */


module.exports = {
    executeNavixy,
    getTrackersState,
    getAndEmitTackerStates,
    getGpsIdents
}