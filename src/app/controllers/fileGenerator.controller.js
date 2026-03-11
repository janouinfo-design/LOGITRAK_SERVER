const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const fileLib = require('../../libs/files.lib')
const loggermodule = require("#modules/loggermodule.js")

exports.getStatus = async (req, res)=>{
    try {
        let data = req.body;  
        console.log(data)  

        let params = [
          {
            name: "id",
            type: TYPES.BigInt,
            value: data.id,
          },
        ];

        let response = await ssm.execProc("FileGenerators_getStatus", params);
        
        loggermodule.info('End getting status')
        res.status(response.status).json(response);
      }catch(e){
        loggermodule.error(`Error getting status :`+ e.message)
        res.status(500).json({ success:false, res : e.message });
      }

    }



    exports.save = async (req, res)=>{
      try {
          let data = req.body.data || req.body ;  

          let params = [
            {
              name: "templatename",
              type: TYPES.NVarChar,
              value: data.templatename,
            },
            {
              name: "Filetype",
              type: TYPES.NVarChar,
              value: data.Filetype,
            },
            {
              name: "src",
              type: TYPES.NVarChar,
              value: data.src,
            },
            {
              name: "filter",
              type: TYPES.NVarChar,
              value: data.filter || "",
            },
          ];
  
          let response = await ssm.execProc("FileGenerators_save", params);
          
          loggermodule.info('End getting status')
          res.status(response.status).json(response);
        }catch(e){
          loggermodule.error(`Error getting status :`+ e.message)
          res.status(500).json({ success:false, res : e.message });
        }
  
      }


      
    exports.checkFile = async (req, res)=>{
      try {
          let data = req.body.data || req.body ;  

          let params = [
            {
              name: "Filetype",
              type: TYPES.NVarChar,
              value: data.Filetype,
            },
            {
              name: "src",
              type: TYPES.NVarChar,
              value: data.src,
            },
          ];
  
          let response = await ssm.execProc("FileGenerators_checkFile", params);
          
          loggermodule.info('End getting status')
          res.status(response.status).json(response);
        }catch(e){
          loggermodule.error(`Error getting status :`+ e.message)
          res.status(500).json({ success:false, res : e.message });
        }
  
      }