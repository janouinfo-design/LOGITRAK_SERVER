const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')


exports.list = async (req, res)=> {
    let data = req.body;
    let params = [
         
        {
            name:"custumerid",
            type: TYPES.Int,
            value: data.custumerid || "0"
        }
    ]
     
   let response = await ssm.execProc('Invoice_filter' , params)
   
   res.status(response.status).json(response)
    
}



exports.filter = async (req, res)=> {
    let data = req.body.data || req.body;

    let params = [
        {
            name:"begindate",
            type: TYPES.Date,
            value: data.begindate || null
        },
        {
            name:"enddate",
            type: TYPES.Date,
            value: data.enddate || null
        },
        {
            name:"custumerid",
            type: TYPES.Int,
            value: data.custumerid || 0
        },
        { 
            name:"user",
            type: TYPES.Int,
            value: req?.userInfos?.userID || 0 },
    ]
     
   let response = await ssm.execProc('Invoice_filter' , params);
   res.status(response.status).json(response);
   
}


exports.get = async (req, res)=> {
   let data = req.body

   let params = [
       {
           name:"id",
           type: TYPES.Int,
           value: data.id || 0
       },
   ]

   let response = await ssm.execProc('Invoice_get', params)

         
   res.status(200).json(response)
 
}


exports.save = async (req, res)=>{
    let data = req.body ; 
    console.log('boddy:', data)
    if(data.id === undefined  ) {
       res.status(401).json({error: "id can't be null !!!"})
       return
    }
    let params = [
        {
            name : "id",
            type: TYPES.Int,
            value: data.id
        },
        {
            name : "type",
            type: TYPES.NVarChar,
            value: data.type || "Invoice"
        },
        {
            name : "info",
            type: TYPES.NVarChar,
            value: data.info || ""
        },
        
         
    ]

    let response = await ssm.execProc('Order_save',params)
   
    res.status(response.status).json(response)
    
}


exports.remove = async (req, res)=> {
    let data = req.body
 
    let params = [
        {
            name:"id",
            type: TYPES.Int,
            value: data.id || 0
        },
    ]
 
    let response = await ssm.execProc('Invoice_remove', params)
          
    res.status(200).json(response)
  
}

