const { findGeofenceOfPoints } = require("#utils/geometry.utl.js");
const _ = require('lodash');
async function setLocationIDForData(data , options){
    let latlngs = data.map((t) => ({ lat: t.lat, lng: t.lng }));
    latlngs = _.uniqBy(latlngs, (t) => t.lat + "-" + t.lng);
    console.log('optionsssss:', options)
    data = await findGeofenceOfPoints(_.cloneDeep(data),  {searchNearest: false ,...(options || {})});
    data.forEach((o) => {
      o.LocationID = o?.worksite?.id || 0;
      o.LocationName = o?.worksite?.name || o?.worksite?.label;
      delete o.worksite;
      delete o.nearest;
    });
    return data
}

module.exports = {
    setLocationIDForData
}