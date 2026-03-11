const path = require('path')
const fs = require('fs')

exports.readFile = (filename) =>{
   let result = fs.readFileSync(filename) ;
   return result
}

exports.writeFile = (file) => {
    return new Promise((resolve, reject) =>{
        let date = new Date()
        file.extension = file.extension !== undefined ? file.extension : 'jpeg'
        file.path = file.path !== undefined ? file.path : ''
        file.filename = file.filename !== undefined ? file.filename+'.'+file.extension : date.getTime().toString()+'.'+file.extension
        file.filename = path.join(process.cwd()+'/src/storage/'+file.path , file.filename )
        fs.mkdirSync(file.path , {recursive: true})
        let result = fs.writeFile(file.path , file.data )
    
        console.log('result file:', result)
    
        return result
    })
   
}

exports.saveBase64 = (file , index = 0) => {

      return new Promise(function (resolve, reject){
           try{
                if(file.data == undefined)
                 reject(false)
        
                let base64Parts = file.data.split(';base64,');
                let image = undefined , extension = 'png'
             //   console.log('babase64Partsse64:', base64Parts[0])
                if(base64Parts.length > 1)
                    image = base64Parts[1]
                
                extension = base64Parts[0].split('/')[1];
                let buffer = Buffer.from(image , 'base64');

                file.filename = file.filename !== undefined ? file.filename : (new Date()).getTime().toString()+index
                file.path = file.path !== undefined ? file.path : ''

                console.log({extension ,  buffer , image: image.substr(0, 10)});
                let _path = 'src/storage/'+ file.path
                
                fs.mkdirSync(_path, { recursive: true })
                let fullName = _path+'/'+file.filename+'.'+extension
                
                let res = fs.writeFile(fullName, buffer , (err , result)=>{
                    console.log('err:', err , result)
                    resolve(file.path+'/'+file.filename+'.'+extension)
                })

           }catch(e){
               console.log('error:', e.message)
               reject(false)
           }
           
      })
  
}