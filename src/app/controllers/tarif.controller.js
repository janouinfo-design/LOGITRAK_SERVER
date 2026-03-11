const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')


exports.list = async (req, res)=> {
    let data = req.body;
      
   let response = await ssm.execProc('tarif_list' , data)
   
   res.status(response.status).json(response)
    
}


exports.get = async (req, res)=> {
   let data = req.body

   let params = [
       {
           name:"code",
           type: TYPES.NVarChar,
           value: data.id || ""
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

   let response = await ssm.execProc('FACT_getTarifByName', params)

         
   res.status(200).json(response)
 
}


exports.save = async (req, res)=>{
    let data = req.body ; 
    console.log('boddy:', data)
    // if(data.id === undefined  ) {
    //    res.status(401).json({error: "id can't be null !!!"})
    //    return
    // }

    let response = await ssm.execProc('save_tarif',data)
   
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
 
    let response = await ssm.execProc('Invoice_remove', params)
          
    res.status(200).json(response)
  
}

exports.getParamsNiveau = async(req , res) => {
    let data=req.body
    let response = await ssm.execProc('Get_Params_Niveau' , data)
    res.status(response.status).json(response)
}

exports.GetParamsNiveauSrcData  = async(req , res) => {
    let data=req.query // parameter
    console.log("data",data)
    let response = await ssm.execProc('Get_Params_NiveauSrcData' , data)
    res.status(response.status).json(response)
}

exports.ClientGetPrestationList = async (req , res) => {
    let data = req.body
    let response = await ssm.execProc('Client_getPrestation_List' , data)
    res.status(response.status).json(response)
}

exports.TarifGetEtat = async (req , res) => {
    let data = req.body
    let response = await ssm.execProc('Tarif_GetEtat' , data)
    res.status(response.status).json(response)
}

exports.getParametres = async (req , res) => {
    let data = req.body
    let response = await ssm.execProc('get_Parametres' , data)
    res.status(response.status).json(response)
}