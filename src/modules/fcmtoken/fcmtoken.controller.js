const { fetchFcmToken , saveFcmToken } = require("./fcmtoken.service")
const { onResult , onException} = require('#utils/error.utl.js')
const FcmToken = require('@omniyat/firebasemodule')


exports.list = async (req , res)=>{
    try{
        let list = await fetchFcmToken(req.query)
        if(req.query.token){
            FcmToken.sendMessage({
                data: {type: 'message'},
                notification:{
                    title: 'test',
                    body: 'test 123'
                },
                tokens:[req.query.token]
            }).then(res => console.log('notification:',res))
        }
        
        onResult(res , list?.result)
    }catch(e){
        onException(e , res)
    }
}


exports.save = async (req, res)=>{
    try{
        let data = await saveFcmToken(req.body)
        onResult(res, data)
    }catch(e){
        onException(e, res)
    }
}