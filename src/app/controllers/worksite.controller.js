const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const { saveJsonToFile , readGeofenceFile , removeFile} = require('../../utils/file.utl')

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


exports.list = async (req, res) => {
    let data = req.body;

    let params = [
        {
            name: "IDCustomer",
            type: TYPES.Int,
            value: data.IDCustomer
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
            inv.geofence = await processGeofence(inv.geofence);
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};



exports.save = async (req, res)=> {
    let data = req.body.data || req.body;

    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id || 0
        },
        {
            name:"name",
            type: TYPES.NVarChar,
            value: data.name || ""
        },
        {
            name:"label",
            type: TYPES.NVarChar,
            value: data.label || ""
        },
        {
            name:"customerID",
            type: TYPES.Int,
            value: data.customerID || 0
        },
        {
            name:"location",
            type: TYPES.NVarChar,
            value: data.location || ""
        },
        {
            name:"active",
            type: TYPES.Int,
            value: data.active || 0
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
     
   let response = await ssm.execProc('worksite_save' , params);
   res.status(response.status).json(response);
   
}



exports.remove = async (req, res)=> {
    let data = req.body.data || req.body;

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
     
   let response = await ssm.execProc('worksite_remove' , params);
   res.status(response.status).json(response);
   
}



/*
exports.list = async (req, res)=> {

   let data =req.body

   let params = [
    {
        name:"IDCustomer",
        type: TYPES.Int,
        value: data.IDCustomer
    }, 
    
    ]
 //    let response = await ssm.execProc('worksite_list',params)

//    response.result.forEach(inv => {
//      if(typeof inv.jsonResult == "string") {
//         inv.jsonResult = JSON.parse(inv.jsonResult);
//      }
//    }); 
try {
    let response = await ssm.execProc('worksite_list', params);
   
    response.result.forEach(   inv => {
        if (typeof inv.geofence === "string" && inv.geofence!="") {
            inv.geofence = JSON.parse(inv.geofence);
            if(Array.isArray(inv.geofence)){
                for(let o of inv.geofence) {
                    o.path = process.env.origin+o.path;
                    let name = o.path.split('/').reverse()[0];
                    o.geometry =await  readGeofenceFile(name);
                }  
            }
        }
    });

    res.status(200).json(response);
} catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
}

res.status(200).json(response)
}
*/
 



