const express = require('express')

const app = express()
const path = require('path')
const Hjson = require('hjson')
const url = require('url')
const { initializeRoutes } = require('./initialize')
const statusMonitor = require('express-status-monitor')
const { executeNavixy } = require('#modules/navixy/navixy.service.js')
const FBModule = require('@omniyat/firebasemodule')
function initialize(app){

    // app.use(statusMonitor({
    //     path: '/status-monitor',
    // }))
    app.use(express.urlencoded({extended:true , limit: "50mb", parameterLimit: 50000 }));
    app.use(express.json({extended:true ,  limit: "50mb", parameterLimit: 50000}))
    app.use('/storage',express.static(path.join(process.cwd(),'src/storage')))
    app.use('/applogs',express.static(path.join(process.cwd(),'logs')))
    app.use('/client',express.static(path.join(process.cwd(),'public')))
    app.use((req , res , next)=>{
        try{
            process.socket_id = req.headers['x-socket']
            process.env.origin = req.protocol + '://' + req.get('host') + '/'
            let method = req.method.toUpperCase()
            if(method === 'GET'){
                let data = req.query?.data || ''
                if(typeof data == 'string') data = Hjson.parse(data);
                if(typeof data == "string") data = {}
                if(req.query){
                    req.body = {
                        ...data ,
                        data,
                        auth_key: req.query.auth_key,
                        userInfos: typeof req.query?.userInfos == 'string' ? Hjson.parse(req.query?.userInfos || '') : req.query?.userInfos
                    }
                    req.data = data
                }
            }

            req.userInfos = req.body.userInfos
            // acrowApp(req, res , next)
            next()
        }catch(err){
            res.status(500).json({error: err.message})
        }
    })
    // initialisation des routes
    initializeRoutes(app)
    app.use('**' , async   (req, res)=> {
        let urlParsed = url.parse(req.baseUrl)
        let pathname = urlParsed.pathname || ''
        let data = req.body
        delete data.data;
        delete data.auth_key
        delete data.userInfos
        if(pathname.includes('/xnavixy/') && !pathname.includes('xnavixy/execute')){
           let response = await executeNavixy(pathname.replace('/xnavixy/', '') , data)
           res.json(response)
        }else{
            res.json({
               result: null,
               error: [{res: `action ${req.baseUrl.slice(1)} do not exist`}],
               status: 404
            })
        }
    })
}

FBModule.init({
     credential: path.join(process.cwd(), '.local/firebase-key.json'),
})

module.exports = initialize



