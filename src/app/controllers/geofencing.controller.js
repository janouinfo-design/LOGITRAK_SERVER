const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const { saveJsonToFile ,readGeofenceFile , removeFile} = require('../../utils/file.utl')
const { findContainedLayer, getWorksitesList } = require('../../utils/geometry.utl')
const _ = require('lodash')
const {  saveGeofenceToFlespi } = require('../../services/flespi.Service')
const moment = require('moment')


exports.list = async (req, res)=> {

   let data = req.body.data || req.body
   //console.log('data : ',data,data)
   let params = [
    {
        name: "point_attachement",
        type: TYPES.Int,
        value: req?.userInfos?.attachement || 0,
      },
      {
        name: "user",
        type: TYPES.Int,
        value: req?.userInfos?.userID || 0,
      },
]

   let response = await ssm.execProc('geofence_list',params);

    console.log('response : ',response);
   if(Array.isArray(response.result)){
    for(let o of response.result) {
        o.path = process.env.origin+o.path;
        let name = o.path.split('/').reverse()[0];
        o.geometry = await readGeofenceFile(name);
    }  
   } 
   res.status(response.status).json(response)
}

exports.get = async (req, res)=> {
   let data = req.data
   console.log('body:', data)

   let params = [
    {
        name:"id",
        type: TYPES.Int,
        value: data.id || 0
    },
    {
        name: "point_attachement",
        type: TYPES.Int,
        value: req?.userInfos?.attachement || 0,
      },
      {
        name: "user",
        type: TYPES.Int,
        value: req?.userInfos?.userID || 0,
      },
]
   //let response = await ssm.execProc('get_deposit', data)
   let response = await ssm.execProc('geofence_get', params)       
   res.status(200).json(response)
}

exports.save = async (req, res)=>{
    try{
        let data = req.body.data || req.body ; 
        let obj = data.properties;
        let userInfos = req.userInfos

        let fileOptions = {
            format:'geojson'
        }

        if(obj?.tags == 'exclude-potential'){
            fileOptions.rootDir= "potential_exclude";
            fileOptions.filename = (obj?.label || moment().format('DD-MM-YYYY-HH-mm-ss'))
        }
        let response = await saveJsonToFile(data, fileOptions);

        if(!response.success) {
            res.status(500).json({success: false , result: "Erreur du sauvegarde du geogson:"+response.result})
            return
        }
        
        if(obj?.tags == 'exclude-potential'){
            res.status(201).json({success: true , response: 'saved successfully'});
            return 
        }
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
                value: req?.userInfos?.attachement || 0,
              },
              {
                name: "user",
                type: TYPES.Int,
                value: req?.userInfos?.userID || 0,
              },
        
        ]

        let geom = data?.geometry?.coordinates?.[0] || [];
        
        let geomObj = {
            
            geometry: {
                type: data?.geometry?.type || 'Polygon',
                path: geom.map( ([lon , lat])=>({lat,lon}))
            },
            
        }

        console.log('geommm:', geomObj)

        let respo = await saveGeofenceToFlespi(geom , {
            metadata: {
                ...obj,
                attachement: userInfos?.attachement,
                userID: userInfos?.userID
            },
            name: obj.label,
        })
        console.log('respo:', respo )
        response = await ssm.execProc('geofence_save',params)
        
        res.status(response.status || 200).json({success: true , result: 'OK',response})
    }catch(e){
        console.log('err:', e.message)
        res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
}


exports.saveDepot = async (req, res)=>{
    try{
        let data = req.body.data || req.body ; 
        let userInfos = req.userInfos
        let response = await saveJsonToFile(data, 'geojson')
        if(!response.success) res.status(500).json({success: false , result: "Erreur du sauvegarde du geogson:"+response.result})
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
                name : "depositId",
                type: TYPES.Int,
                value: obj.depositId
            },
            {
                name: "point_attachement",
                type: TYPES.Int,
                value: req?.userInfos?.attachement || 0,
              },
              {
                name: "user",
                type: TYPES.Int,
                value: req?.userInfos?.userID || 0,
              },
        
        ]

        let geom = data?.geometry?.coordinates?.[0] || [];
        console.log('dataaaa:', data)
        
        response = await ssm.execProc('geofence_saveDepot',params)
        let gomObj = {
            name: obj.label,
            geometry: {
                type: data?.geometry?.type || 'Polygon',
                path: geom.map( ([lon , lat])=>({lat,lon}))
            },
            metadata: {
                ...obj,
                attachement: userInfos?.attachement,
                userID: userInfos?.userID
            }
        }


        console.log('geom:', gomObj)

        res.status(response.status || 200).json({success: true , result: 'OK',response})
    }catch(e){
        console.log('err:', e.message)
        res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
    
}

exports.remove = async (req, res)=> {
    let data = req.body.data || req.body
    console.log('reqqqq:', data);
    
    let params = []

    if(Array.isArray(data)){
        if(!data.find( o => isNaN(o))){
            params.push({
                name:"ids",
                type: TYPES.NVarChar,
                value: data.join(',')
             })
        }
    }else if(!isNaN(data.id) && +data.id > 0){
        params.push({
            name:"ids",
            type: TYPES.NVarChar,
            value: data.id || 0
        })

    }

    let response = {  success: false , error: 'Incorrect id or ids. Nothing has been removed!!'}
     console.log('params:',params )
    if(params.length > 0){
        // let paths = await ssm.exexSql(`select path from geofence where id`)
        response = await ssm.execProc('remove_geofence', params)
    }
    
    if(Array.isArray(response.result) && response?.result?.length  > 0){
        let paths = response.result.filter( o=> o.path != null)
        .map( o => o.path.split('/').slice(1).join('/'))

        console.log('paths:', paths)
        removeFile(paths)
    }
    res.status(200).json(response)
  
}

exports.activate = async (req, res)=> {
    let data = req.body.data

    /*
    let data = req.body
    
    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id
        },
        {
            name:"active",
            type: TYPES.Int,
            value: data.active 
        },
        {
            name:"user",
            type: TYPES.Int,
            value: data.user || 1 
        }
    ] */
 
    let response = await ssm.execProc('activate_deposit', data)
          
    res.status(200).json(response)
  
}


exports.saveNavixy = async (req, res) => {
    let data = req.body;
   
    console.log("data",data)
    let response = await ssm.execProc('SaveNavixy_Geofence', data);
   
    res.status(response.status).json(response);
}


exports.GetGeofence = async (req,res) => {
    let data = req.body;

    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    let params = [
        {
            name : "id",
            type: TYPES.Int,
            value: data.id || 0
        },
        {
            name : "src",
            type: TYPES.NVarChar,
            value: data.src || "worksite"
        },
        {
            name: "point_attachement",
            type: TYPES.Int,
            value: attachement,
          },
          {
            name: "user",
            type: TYPES.Int,
            value: userId,
          },
    ]

    let response = await ssm.execProc("geofence_get",params);

    if(Array.isArray(response.result)){
    for(let o of response.result) {
        o.path = process.env.origin+o.path;
        let name = o.path.split('/').reverse()[0];
        o.geometry = await readGeofenceFile(name);
    }   
   } 

    res.status(response.status).json(response);
}



exports.GetGeofenceByID = async (req,res) => {
    let data = req.body;
    let userId = req.body.userInfos.userID;
    let attachement = req.body.userInfos.attachement;

    let params = [
        {
            name : "id",
            type: TYPES.Int,
            value: data.id || 0
        },
        {
            name: "point_attachement",
            type: TYPES.Int,
            value: attachement,
          },
          {
            name: "user",
            type: TYPES.Int,
            value: userId,
          },
    ]

    let response = await ssm.execProc("geofence_getByID",params);

    if(Array.isArray(response.result)){
    for(let o of response.result) {
        o.path = process.env.origin+o.path;
        let name = o.path.split('/').reverse()[0];
        o.geometry = await readGeofenceFile(name);
    }   
   } 

    res.status(response.status).json(response);
}


exports.GetGeofenceByWorksite = async (req,res) => {
    try {
    let data = req.body;

    let params = [
        {
            name : "worksiteID",
            type: TYPES.Int,
            value: data.worksiteID || 0
        },
        {
            name: "point_attachement",
            type: TYPES.Int,
            value: req?.userInfos?.attachement || 0,
          },
          {
            name: "user",
            type: TYPES.Int,
            value: req?.userInfos?.userID || 0,
          },
    ]

    let response = await ssm.execProc("geofence_getbyworksite",params);

    if(Array.isArray(response.result)){
    for(let o of response.result) {
        o.path = process.env.origin+o.path;
        let name = o.path.split('/').reverse()[0];
        o.geometry = await readGeofenceFile(name);
    }   
   } 

    res.status(response.status).json(response);
    }
    catch(e){
        loggermodule.error(`Error Get Geofence By Worksite :`+ e.message)
        res.status(500).json({ success:false, res : e.message });
      }
}




// exports.saveNavixy = async (req, res) => {
//     let data = req.body.data; // Get the data JSON object from the request body
//     console.log("geo data", data);

//     // Convert the data object to a string
//     let dataString = JSON.stringify(data);

//     let response = await ssm.execProc('GeoFence_SaveNavixy', { data: dataString }); // Pass as an object with parameter name

//     res.status(response.status).json(response);
// }



exports.getGeofenceOfPoint = async (req, res )=> {
      try{
        const data = req.body.data || {}
        let result = await getWorksitesList({ IDCustomer: 0 });
        let { lat , lng } = data
        let contained = null
        if(Array.isArray(result) && !isNaN(lat) && !isNaN(lng)){
           contained = findContainedLayer({ lat , lng} , result , 'geometry')
        }
        res.status(200).json({success: true,result: contained})
      }catch(e){
        res.status(500).json({success: false,result: e.message})
      }
}

async function getList(data){
    
   let response = await ssm.execProc('list_geofence', data);

   if(Array.isArray(response.result)){
    for(let o of response.result) {
        o.path = process.env.origin+o.path;
        let name = o.path.split('/').reverse()[0];
        o.geometry = await readGeofenceFile(name);
    }  

    response.result = response.result.filter( o => typeof o.geometry != 'string')
   } 
   
   return response
}

// const processGeofence = async (geofence) => {
//     if (typeof geofence === "string" && geofence !== "") {
//         let parsedGeofence = JSON.parse(geofence);

//         if (Array.isArray(parsedGeofence)) {
//             for (let o of parsedGeofence) {
//                 o.path = process.env.origin + o.path;
//                 let name = o.path.split('/').reverse()[0];
//                 o.geometry = await readGeofenceFile(name);
//             }
//         }
//         return parsedGeofence;
//     }

//     return geofence;
// };


const worksiteList = async (data = {IDCustomer: 0})=> {

    let params = [
        {
            name: "IDCustomer",
            type: TYPES.Int,
            value: data?.IDCustomer || 0
        },
        {
            name: "point_attachement",
            type: TYPES.Int,
            value: req?.userInfos?.attachement || 0,
          },
          {
            name: "user",
            type: TYPES.Int,
            value: req?.userInfos?.userID || 0,
          },
    ];

    try {
        let response = await ssm.execProc('worksite_list', params);

        for (let inv of response.result) {
            inv.geofence = await process(inv.geofence);
            inv.geofence = inv.geofence?.[0]
            let _data = { ...inv };
            delete _data.geofence

            inv.worksite = _data
        }

        return response.result.map(o => ({...o.geofence , worksite: o.worksite  })).filter( o => _.isPlainObject(o.geometry))
    } catch (error) {
        console.log('Getting worsite error:', error)
        return []
    }
}


