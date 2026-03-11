const multer = require('multer');
const fs =  require('fs')


const storage_dir = require('../configs').directories.storage


const diskStorage  = multer.diskStorage({
    destination(req , file , cb){
         console.log('request:', file , req.query)
         cb(null, storage_dir)
    },
    filename(req , file , cb){
        const ext = file.originalname.split('.').reverse()[0]
        //file.mimetype.split('/')[1] || 'png'
        let fname = (req.query.path || 'default')+'/'+(req.query.name || uuid())+'.'+ext
        fs.mkdirSync(storage_dir+'/'+(req.query.path || 'default')+'/' , {recursive: true})
        cb(null , fname)
    }
})

module.exports = multer({storage: diskStorage})