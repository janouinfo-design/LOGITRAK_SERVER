const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const { saveJsonToFile , readGeofenceFile , removeFile} = require('../../utils/file.utl')


exports.list = async (req, res)=> {
   

   let params = [
      
   ]
  
   let response = await ssm.execProc('geofence_list', params);

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
   let data = req.body
   console.log('body:', req.body)
   let params = [
       {
           name:"id",
           type: TYPES.Int,
           value: data.id || 0
       }
   ]
   console.log('params:', params)

   let response = await ssm.execProc('deposit_get', params)
         
   res.status(200).json(response)
 
}

exports.save = async (req, res)=>{
    try{
        let data = req.body.data || req.body ; 
        let response = await saveJsonToFile(req.body, 'geojson')
        if(!response.success) res.status(500).json({success: false , result: "Erreur du sauvegarde du geogson:"+response.result})
        let obj = data.properties;

        let params = [
            {
                name : "id",
                type: TYPES.Int,
                value: obj.id || 0
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
        
        ]

        response = await ssm.execProc('geofence_save',params)
        
        res.status(response.status || 200).json({success: true , result: 'OK'})
    }catch(e){
        console.log('err:', e.message)
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
    ]
 
    let response = await ssm.execProc('deposit_activate', params)
          
    res.status(200).json(response)
  
}