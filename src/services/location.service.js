const { xLocation } = require("../configs") 
const axios = require('axios') 
const TTModule = require('@omniyat/tomtommodule')
const loggermodule = require("#modules/loggermodule.js")
const { distance, point } = require("@turf/turf")
let moment = require('moment')
let _cache = {}

async function findAddress(latlng = {lat:  null , lng: null}, options){
    let response = { success: false , response: ''}
    if(+xLocation.allow_geocode === 0) {
      loggermodule.info('GEOCODING IS DESACTIVATED. To active set env variable LOCATION_ALLOW_GEOCODE=1');
      return {success: false, response: 'Geocoding is desactivated'}
    }
    try{
          loggermodule.info('[GEOCODING]:Start finding address for:'+JSON.stringify(latlng))
          if(_cache[`${latlng.lat}@${latlng.lng}`]) loggermodule.info('[GEOCODING]:ALREADY GEOCODED')
          
          let res = _cache[`${latlng.lat}@${latlng.lng}`]

          if(!res){
            let nearest = getNearestLocation(latlng)
            if(nearest){
              res = nearest
              loggermodule.info('[GEOCODING]: location get from nearest')
            }else{
              loggermodule.info(`[GEOCODING REQUEST] - ${moment().format('YYYY-MM-DD')}: start  geocoding request for: ${JSON.stringify(latlng)}`)
              res = await TTModule.reverseGeocode({
                latitude: latlng.lat,
                longitude: latlng.lng,
              })
              // res = await axios(xLocation.geocoding.uri , {
              //   params: {
              //       latlng: `${latlng.lat},${latlng.lng}`,
              //       key: xLocation.apikey
              //   }
              // })
              loggermodule.info(`[GEOCODING REQUEST]: End new geocoding request:  ${JSON.stringify(latlng)}`)
            }
          }
          console.log('response:', res)
          if(res.data?.results?.length > 0 || res?.response?.address){
            let addr = res.data?.results?.[0] || res?.response?.address
            _cache[`${latlng.lat}@${latlng.lng}`] = res
            response.response = formatAddress(addr , xLocation.provider) 
          }else{
            if(res?.data?.error_message)
              throw new Error(`[${res.data.status}]:${res.data.error_message}`)
            response.response = res
          }
          response.success = true
    }catch(e){
        response.response = e.message
    }
    finally {
        //console.log('respose:', response)
        if(response.success)
          loggermodule.info('[GEOCODING]:End address find for:'+JSON.stringify(latlng))
        else loggermodule.error(`[GEOCODING]:Error finding address for ${JSON.stringify(latlng)}:`+response.response)
        return response
    }
}

async function reverseGeocode(){
   
}

function getNearestLocation(latlng){
    for(let [key , val] of Object.entries(_cache)){
        let latlngs = key.split('@');
        let _latlng = {lat: +latlngs[0].trim(), lng: +latlngs[1].trim()}
        let dist = calculateDistance(latlng , _latlng)
        console.log('dist:', dist , _latlng,key)
        if(dist <= 0.1){
          return val
        }
    }

    return null
}

function calculateDistance(from , to){
        from = point([from.lng, from.lat]);
        to = point([to.lng, to.lat]);
        return distance(from , to )
}

function formatAddress(address , type){
     let formatedAddress = address
     let obj = null
     if(!address) return  
     switch(type){
        case 'googlemaps':
            obj  = {
                address: formatedAddress.formatted_address,
                lat: formatedAddress.geometry.location.lat,
                lng: formatedAddress.geometry.location.lng,
            }

            if(Array.isArray(formatedAddress.address_components)){
                let f = formatedAddress.address_components.reduce((c , v)=> {
                    if(!Array.isArray(v.types)) return c

                    for( let type of v.types){
                         c[type] = v.long_name
                    }

                    return c
                }, {})
                
                obj.city = f.city || f.locality
                obj = { ...obj , ...f}
            }
            formatedAddress = obj
            break
        case 'tomtom': 
            formatedAddress.postal_code = address.postalCode
            formatedAddress.address = address.freeformAddress
            break
        default:
            break
     }

     return formatedAddress
}



module.exports = {
    findAddress,
    calculateDistance
}
