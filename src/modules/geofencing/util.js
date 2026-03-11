const { getFilesnameFromDirectory, readJsonFile } = require("#utils/file.utl.js")
const { findContainedLayer } = require("#utils/geometry.utl.js")
const { directories } = require("../../configs")
const path = require('path')
const _ = require('lodash')

let potential_exclude_root = path.join(directories.geofencing , 'potential_exclude')
async function getExcludedPotentialAreas(){
    let filenames = await getFilesnameFromDirectory(potential_exclude_root)
    let output = []
    for(let f of filenames){
        let geojson = await readJsonFile(potential_exclude_root , f.name)
        if(geojson.success) output.push(geojson.response)
    }
    return output
}

async function checkPointsExcludeByPotentilArea(latlngs){
    let areas = await getExcludedPotentialAreas();
    let uniqLatLng = _.uniqBy(latlngs, (t) => t.lat + "-" + t.lng);
    let locations = {}
    for(let latlng of uniqLatLng){
        let location = findContainedLayer(latlng , areas)
        locations[latlng.lat + "-" + latlng.lng] = location ? true : false
    }
    return latlngs.map((t) => ({...t, has_potential_exclude_area: locations[t.lat + "-" + t.lng]}))
}

module.exports = {
    checkPointsExcludeByPotentilArea
};