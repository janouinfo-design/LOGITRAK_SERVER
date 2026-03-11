const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')


exports.list = async (req, res)=> {
    let data = req.body;
    console.log("data",data.ID);
   let response = await ssm.execProc('invoice_pending_list', {ID:data.ID}||{ID:0}  )
   
   res.status(response.status).json(response)
    
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
    let response = await ssm.execProc('savebilling',data)
   
    res.status(response.status).json(response)
    
}

