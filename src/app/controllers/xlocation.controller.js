const { findAddress } = require("../../services/location.service");
const iomodule = require('#modules/iomodule.js')
const { onResult , onException } = require('#utils/error.utl.js')
exports.findAddress = async (req , res)=> {
    try{
        let { lat , lng } = req.body;
        let response = await findAddress({lat,lng});

        res.status(200).json(response)
    }catch(e){
        res.status(500).json({success: false , response: e.message})
    }
}

exports.pushLocation = async( req , res )=> {
    try{
        iomodule.emit('new_location_push' , {
            location: req.body.data,
            data: req.body,
            userInfo: {
               socket: process.socket_id,
               ...(req.body.userInfos || {})
            }
        })
        onResult(res, {success: true , response: 'sent'})
    }catch(e){
        onException(e , res)
    }
}