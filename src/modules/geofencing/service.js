const { saveJsonToFile } = require("#utils/file.utl.js");
const { TYPES } = require("tedious");
const { saveGeofenceToFlespi } = require("../../services/flespi.Service");
const ssm = require('../../apis/sql-server-request')

const saveGeofence = async (req)=>{
    try{
        let data = req.body.data || req.body ; 
        let userInfos = req.userInfos

        let response = await saveJsonToFile(data, 'geojson')

        if(!response.success) return {success: false , result: "Erreur du sauvegarde du geogson:"+response.result}
        let obj = data.properties;

        let params = [
            {
                name : "id",
                type: TYPES.Int,
                value: data.id || 0
            },
            {
                name : "label",
                type: TYPES.NVarChar,
                value: obj.label
            },
            {
                name : "description",
                type: TYPES.Text,
                value: obj.description
            },
            {
                name : "tags",
                type: TYPES.NVarChar,
                value: obj.tags
            },
            {
                name : "path",
                type: TYPES.NVarChar,
                value: response.result
            },
            {
                name : "type",
                type: TYPES.NVarChar,
                value: obj.type
            },
            {
                name : "worksiteId",
                type: TYPES.Int,
                value: obj.worksiteId
            },
            {
                name: "point_attachement",
                type: TYPES.Int,
                value: userInfos?.attachement || 0,
              },
              {
                name: "user",
                type: TYPES.Int,
                value: userInfos?.userID || 0,
              }
        ]

        let geom = data?.geometry?.coordinates?.[0] || [];
        
        let geomObj = {
            
            geometry: {
                type: data?.geometry?.type || 'Polygon',
                path: geom.map( ([lon , lat])=>({lat,lon}))
            },
            
        }


        let respo = await saveGeofenceToFlespi(geom , {
            metadata: {
                ...obj,
                attachement: userInfos?.attachement,
                userID: userInfos?.userID
            },
            name: obj.label,
        })
        response = await ssm.execProc('geofence_save',params)
        
        return {success: true , result: 'OK',response}
    }catch(e){
        console.log('err:', e.message)
        return { error: "Internal Server Error", details: e.message }
    }
}


module.exports = {
    saveGeofence
}