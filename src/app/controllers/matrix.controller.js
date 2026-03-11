const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')


exports.list = async (req, res)=> {
    let data = req.body;
    // let params = [
         
    //     {
    //         name:"ID",
    //         type: TYPES.Int,
    //         value: data.id || ""
    //     }
    // ]
      
   let response = await ssm.execProc('matrice_list',data.id || "")
   
   res.status(response.status).json(response)
}


exports.get = async (req, res)=> {
   let data = req.query

//    let params = [
//        {
//            name:"code",
//            type: TYPES.NVarChar,
//            value: data.code || ""
//        },
//    ]


   let response = await ssm.execProc('matrice_get',data)
   console.log("req",req.query)
         
   res.status(200).json(response)
 
}


exports.save = async (req, res)=>{
    let data = req.body ; 
    // let userInfo = req.body.userInfo;
    // data.user = userInfo.user;
    // data.point_attachement = userInfo.point_attachement;
    console.log('boddy:', data)
    if(data.id === undefined  ) {
       res.status(401).json({error: "id can't be null !!!"})
       return
    }
    let response = await ssm.execProc('save_matrice',data)
   
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

exports.getMatriceItems = async(req,res) => {
    let data = req.body 

    let response = await ssm.execProc('get_MatriceItems',data)
    res.status(response.status).json(response)
}

exports.AddDimension = async (req,res) => {
    let data = req.body

    let response = await ssm.execProc('Add_Dimension',data)
    res.status(response.status).json(response)
}

exports.UpdatePrixMatrice = async (req,res) => {
    let data = req.body 
    let response = await ssm.execProc('Update_PrixMatrice',data)
    res.status(response.status).json(response)
}