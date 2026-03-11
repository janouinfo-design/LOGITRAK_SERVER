const { base64Uploder } = require('../../utils/file.utl')
exports.upload = async (req , res)=> {
    try{
        let finalePath = null
        console.log('body upload:', req.body)
        if(req.body.base64){
             let image = await base64Uploder(req.body.base64 , {
                fpath: req.query.path,
                filename: req.query.name
             })
             console.log('image:', image)
             if(image.success){
                finalePath = image.filename
             }
        }else if(req.file){
            finalePath = req.file.filename
        }
        res.json({success: true , result: finalePath})
    }catch(e){
        res.json({success: false , result: e.message})
    } 
}