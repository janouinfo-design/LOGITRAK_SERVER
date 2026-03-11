const turf = require('@turf/turf') 
const ssm = require('../apis/sql-server-request.js');
const { readGeofenceFile } = require('./file.utl');

const _ = require('lodash');
const loggermodule = require('#modules/loggermodule.js');
const { TYPES } = require('tedious')


function isPointInLayer(latlng , layer){
     try{
        latlng = turf.point(Array.isArray(latlng) ? latlng :[latlng.lng , latlng.lat]);
        if(layer?.geometry?.type == 'Point'){
            if(!isNaN(layer?.properties?.radius)){
                let distance = turf.distance(layer.geometry.coordinates , latlng , { units: 'meters'})
                return distance <= +layer.properties.radius
            }else{
                return false
            }
        }
       
        layer = turf.polygon(layer.geometry.coordinates)
        return turf.inside(latlng , layer , {
        });
     }catch(e){
       console.log('errr:', e.message)
       console.log('latlng:', latlng)
       console.log('layer:', layer)
       return false
     }
    
}

function distanceToPolygon(latlng , layer , options){
    try{
        let line = turf.polygonToLineString(layer);
        latlng = turf.point(Array.isArray(latlng) ? latlng :[latlng.lng , latlng.lat]);
        let distance = turf.pointToLineDistance(latlng , line , {
            units:  options?.units || 'kilometers'
        })
        return {distance}
    }catch(e){
        loggermodule.error(`Error in isNearest:${e.message}`)
        return {error: e.message}
    }
}

function findNearestLayer(latlng , layers , geometryKey , distOptions){
    try{
        return layers.find( layer => {
            if(geometryKey) layer = layer?.[geometryKey];
            let nearest = isNearest(latlng , layer , distOptions?.distance || 0.02)
            if(nearest.nearest) {
                latlng.nearestInfo = nearest
            }
            return  nearest.nearest
        })
    }catch(e){
       return null
    }
}


function isNearest(latlng , layer , dist , options){
    try{
        if(!options) options = {}

        options.units = options.units || 'kilometers'; //kilometers

        let distanceInfo = distanceToPolygon(latlng , layer , options);
        if(distanceInfo.error) throw new Error(distanceInfo.error)
        let distance = distanceInfo?.distance || -1
        return {nearest: distance <= dist , distance}
    }catch(e){
        loggermodule.error(`Error in isNearest:${e.message}`)
        return { nearest: false , error: e.message}
    }
}

function findContainedLayer(latlng , layers , geometryKey){
    try{
        return layers.find( layer => {
            if(geometryKey) layer = layer?.[geometryKey];
            return isPointInLayer(latlng , layer) 
        })
    }catch(e){
       return null
    }
}


async function  findGeofenceOfPoints(latlngs , nearestOptions){
    try{
        let geofenceObj = {}
        let nearestGeofenceObj = {}
        let result = Array.isArray(process.worksites_geofences) && !nearestOptions?.reload ? process.worksites_geofences : await getWorksitesList({ IDCustomer: 0 });
        if(!Array.isArray(result)) result = [];
        if(result.length > 0){
            for(let latlng of latlngs){
                let location = {lat: latlng.lat , lng: latlng.lng}
                let key = `${latlng.lat}-${latlng.lng}`
                if(key in geofenceObj){
                    latlng.worksite = geofenceObj[key]
                }else{
                    latlng.worksite = _.cloneDeep(findContainedLayer(location , result , 'geometry')) 
                    delete latlng?.worksite?.nearestDistance;
                    geofenceObj[key] = _.cloneDeep(latlng.worksite || null)
                }

                if(!latlng?.worksite && nearestOptions?.searchNearest !== false) {
                    if(key in nearestGeofenceObj){
                        latlng.nearest = nearestGeofenceObj[key]
                    }else{
                        latlng.nearest = findNearestLayer(location , result , 'geometry' , nearestOptions)
                        let obj = _.cloneDeep(latlng.nearest || null) 
                        if(obj){
                            obj.nearestDistance =  location.nearestInfo?.distance
                        }
                        nearestGeofenceObj[key] =   obj
                    }
                    if(latlng.nearest) {
                        latlng.nearest.nearestDistance = latlng.nearest?.nearestDistance || location.nearestInfo?.distance
                    }
                }
            }
        }else{
            loggermodule.info("No worksite found to findGeofenceOfPoints")
        }
    }catch(e){
        console.log('err:', e)
      loggermodule.error("ERROR findGeofenceOfPoints:"+e.message)
    }
    finally{
        return latlngs
    }
}

async function getWorksitesList(data = {IDCustomer: 0}){
   
    try {
        loggermodule.info('START GETTING WORKSITES AND DEPOSITS')
        let params = [
            {
                name: "IDCustomer",
                type: TYPES.Int,
                value: data?.IDCustomer || 0
            },
            {
                name: "point_attachement",
                type: TYPES.Int,
                value: data?.userInfos?.attachement || 0,
              },
              {
                name: "user",
                type: TYPES.Int,
                value: data?.userInfos?.userID || 0,
              },
        ];
        let response = await  ssm.execProc('worksiteAndDeposit_list', params);
        //let response = await  ssm.execProc('worksite_list', params);
        
        for (let inv of response.result) {
            inv.geofence = await processGeofence(inv.geofence);
            inv.geofence = inv.geofence?.[0]
            let _data = { ...inv };
            delete _data.geofence
            inv.worksite = _data
        }

        process.worksites_geofences = response.result.map(o => ({...o.geofence , worksite: o.worksite  })).filter( o => _.isPlainObject(o.geometry))
        loggermodule.info('End GETTING WORKSITES AND DEPOSITS')
        console.log('FST:', process.worksites_geofences[0])
        return process.worksites_geofences
    } catch (e) {
        loggermodule.error('ERROR GETTING WORKSITES AND DEPOSITS:'+e.message)

        console.log('Getting worsite error:', e)
        return Array.isArray(process.worksites_geofences) ? process.worksites_geofences  : []
    }
}

const processGeofence = async (geofence) => {
    if (typeof geofence === "string" && geofence !== "") {
        let parsedGeofence = JSON.parse(geofence);

        if (Array.isArray(parsedGeofence)) {
            for (let o of parsedGeofence) {
                o.path = process.env.origin + o.path;
                let name = o.path.split('/').reverse()[0];
                o.geometry = await readGeofenceFile(name);
            }
        }
        return parsedGeofence;
    }

    return geofence;
};

const distanceToGeofenceByID =(id , latlng)=>{
    let geofence = getOneWorksiteFromLocal(id);
    loggermodule.info('id geofence work dep ' + id)
    if(!geofence) return { error: `Worksite or deposit ${id} not found. Check in DB if the worksite exists or check if its geofence exists`}
    return distanceToPolygon(latlng , geofence?.geometry)
}
const  getOneWorksiteFromLocal = (id)=>{
    if(!Array.isArray(process.worksites_geofences)) {
        return null
    }
    return process.worksites_geofences.find( o => o && (o?.worksite?.id == id))
}



module.exports = { 
    findContainedLayer , 
    isPointInLayer  , 
    findGeofenceOfPoints , 
    getWorksitesList,
    isNearest,
    findNearestLayer,
    processGeofence,
    distanceToGeofenceByID
}