exports.onEvent = (req , res)=>{
    console.log('ioooooo:',global.acrowIO);
    if(global.acrowIO == undefined){
        res.status(200).json({})
        return
    } 

     let data = req.body ;
     let eventName  = data.on
     delete data.on
     global.acrowIO.on(eventName , (payload)=>{
        global.acrowIO.emit(data.on , payload)
        console.log('')
     });

     return res.status(200).json({...data})
}

exports.fireEvent = (req , res)=>{
  console.log('ioooooo:',global.acrowIO);
    if(global.acrowIO == undefined){
        res.status(200).json({})
        return
    }
    
    let data = req.body ;
    let eventName  = data.on
    delete data.on
    global.acrowIO.emit(eventName , data);
}