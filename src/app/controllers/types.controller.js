const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const fileLib = require('../../libs/files.lib')
const loggermodule = require("#modules/loggermodule.js")

exports.list = async (req , res)=>{
try {
    //let src = req.body.src
    let data = req.body;

    let params = [
        { 
        name:"src",
        type: TYPES.NVarChar,
        value: data.src || ""},
        { 
        name:"LocationObject",
        type: TYPES.NVarChar,
        value: data.LocationObject || ""},
        { 
        name:"LocationID",
        type: TYPES.Int,
        value: data.LocationID || 0},
        { 
        name:"lang",
        type: TYPES.NVarChar,
        value: data.lang || "fr"},
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

    let response  = await ssm.execProc("types_list", params) ;
    loggermodule.info('End displaying list')
    res.status(response.status).json(response)
}catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
}

exports.get = async (req, res) =>{
try {
    let src = req.body.src


    console.log('src:', src)
    let params = [{ 
        name:"src",
        type: TYPES.NVarChar,
        value: src
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
      },]

    let response  = await ssm.execProc("types_list", params);

    loggermodule.info('End displaying list')
    res.status(response.status).json(response)
}catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
}

exports.save = async (req, res) =>{
try {

    let data = req.body ;
    // console.log('data:', data)
    let path = '';

    if(data.logo != '' && data.logo.indexOf('base64') != -1){
        path = await fileLib.saveBase64({data: data.logo , path: "company"});
        path = req.protocol+'://'+req.hostname+':4600/docs/'+path
    }

    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: 0
        },
        {
            name:"label",
            type: TYPES.NVarChar,
            value: data.label
        },
        {
            name:"code",
            type: TYPES.NVarChar,
            value: data.code
        },
        {
            name:"logo",
            type: TYPES.NVarChar,
            value: path
        },
        {
            name:"currencyId",
            type: TYPES.Int,
            value: data.currencyId
        },
        {
            name:"timezoneId",
            type: TYPES.Int,
            value: data.timezone
        },
        {
            name:"startHour",
            type: TYPES.Time,
            value:  null
        },
        {
            name:"endHour",
            type: TYPES.Time,
            value: null
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

    let response  = await ssm.execProc("company_save" , params , "I");

    loggermodule.info('End displaying list')
    res.status(response.status).json(response)
}catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
}



exports.saveItems = async (req,res) => {
try {
    let data = req.body ;

    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id
        },
        {
            name:"typeID",
            type: TYPES.Int,
            value: data.typeID
        },
        {
            name:"label",
            type: TYPES.NVarChar,
            value: data.label
        },
        {
            name:"name",
            type: TYPES.NVarChar,
            value: data.name
        },
        {
            name:"icon",
            type: TYPES.NVarChar,
            value: data.icon
        },
        {
            name:"color",
            type: TYPES.NVarChar,
            value: data.color
        },
        {
            name:"backgroundColor",
            type: TYPES.NVarChar,
            value:  data.backgroundColor
        },
        {
            name:"value",
            type: TYPES.NVarChar,
            value: data.value
        },
        {
            name:"depreciation",
            type: TYPES.NVarChar,
            value: data.depreciation
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

    let response  = await ssm.execProc("typesitems_save" , params);

    loggermodule.info('End displaying list')
    res.status(response.status).json(response)
}catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
 
}


exports.saveFamille = async (req,res) => {
try {
    let data = req.body ;

    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id || 0
        },
        {
            name:"typeId",
            type: TYPES.Int,
            value: data.typeId || 0
        },
        {
            name:"label",
            type: TYPES.NVarChar,
            value: data.label || ""
        },
        {
            name:"name",
            type: TYPES.NVarChar,
            value: data.name || ""
        },
        {
            name:"icon",
            type: TYPES.NVarChar,
            value: data.icon || ""
        },
        {
            name:"iconreact",
            type: TYPES.NVarChar,
            value: data.iconreact || ""
        },
        {
            name:"color",
            type: TYPES.NVarChar,
            value: data.color || ""
        },
        {
            name:"backgroundColor",
            type: TYPES.NVarChar,
            value:  data.backgroundColor || ""
        },
        {
            name:"value",
            type: TYPES.NVarChar,
            value: data.value || ""
        },
        {
            name:"depreciation",
            type: TYPES.NVarChar,
            value: data.depreciation || ""
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

    let response  = await ssm.execProc("typeitems_saveFamille" , params);

    loggermodule.info('End displaying list')
    res.status(response.status).json(response)
}catch(e){
    loggermodule.error(`Error displaying list :`+ e.message)
    res.status(500).json({ success:false, res : e.message });
  }
 
}

exports.trcStatusList = async (req , res)=>{
    try {
        //let src = req.body.src
        let data = req.body;
    
        console.log('here')
    
        let params = [
            { 
            name:"id",
            type: TYPES.Int,
            value: data.id || 0},
            { 
            name:"src",
            type: TYPES.NVarChar,
            value: data.src || ""},
            { 
                name:"lang",
                type: TYPES.NVarChar,
                value: data.lang || "fr"
            },
            // { 
            //     name:"enginStatus",
            //     type: TYPES.Int,
            //     value: data.enginStatus || 0
            // },
            {
                name: "point_attachement",
                type: TYPES.Int,
                value: req?.userInfos?.attachement || 0,
              },
              {
                name: "user",
                type: TYPES.Int,
                value: req?.userInfos?.userID || 0,
              }

        
        ]
    
        let response  = await ssm.execProc("trcStatus_List", params) ;
        loggermodule.info('End displaying list')
        res.status(response.status).json(response)
    }catch(e){
        loggermodule.error(`Error displaying list :`+ e.message)
        res.status(500).json({ success:false, res : e.message });
      }
    }



    
exports.typeItemsList = async (req , res)=>{
    try {
        //let src = req.body.src
        let data = req.body.data;
        
        console.log('body req : ',data);
        
        let params = [
            { 
            name:"src",
            type: TYPES.NVarChar,
            value: data.src || ""},
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
    
        let response  = await ssm.execProc("TypeItems_List", params) ;
        loggermodule.info('End displaying list')
        res.status(response.status).json(response)
    }catch(e){
        loggermodule.error(`Error displaying list :`+ e.message)
        res.status(500).json({ success:false, res : e.message });
      }
    }



    exports.iconslist = async (req , res)=>{
        try {
            let data = req.body.data;
                        
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
        
            let response  = await ssm.execProc("icons_List", params) ;
            loggermodule.info('End displaying icons list')
            res.status(response.status).json(response)
        }catch(e){
            loggermodule.error(`Error displaying icons list :`+ e.message)
            res.status(500).json({ success:false, res : e.message });
          }
        }
    


        exports.remove = async (req , res)=>{
            try {
                let data = req.body.data || req.body;
                            
                let params = [
                    { 
                        name:"id",
                        type: TYPES.Int,
                        value: data.id || 0},
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
            
                let response  = await ssm.execProc("types_remove", params) ;
                loggermodule.info('End remove types action')
                res.status(response.status).json(response)
            }catch(e){
                loggermodule.error(`Error remove types action :`+ e.message)
                res.status(500).json({ success:false, res : e.message });
              }
            }