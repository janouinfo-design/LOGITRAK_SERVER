const ssm = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')
const hJson = require('hjson');
const loggermodule = require("#modules/loggermodule.js");

exports.list = async (req, res)=> {

   let params = [
    {
        name:"key",
        type: TYPES.NVarChar,
        value: req.body.token ||''
    },
    {
         name:"user",
         type: TYPES.NVarChar,
         value: req.body.user ||''
    },
    {
         name:"point_attachement",
         type: TYPES.NVarChar,
         value: req.body.point_attachement ||''
    },
    {
         name:"BGID",
         type: TYPES.Int,
         value: req.body.BGID ||''
    }
   ]  
  
   let response = await ssm.execProc('Lang_getFile', params)
   if(response.status === 500){
       res.status(response.status).json(response)
   }else{
    loggermodule.info('LANGSSS:'+JSON.stringify(response.result))
    let o = (response.result || []).reduce((c , e)=> {
          try{
            let k = hJson.parse(e.text);
          
            for(let _k in k){
              
              for(let _k2 in k[_k]) {
                  if(typeof k[_k][_k2] != 'string') {
                      for(let o2 in k[_k][_k2]) 
                          k[_k][`${_k2}.${o2}`] = k[_k][_k2][o2]
                          
                      delete k[_k][_k2]
                  }
              }
            }

            let t = {}
            for(let _k in k){
              t[_k] = {}
              for(let _k2 in k[_k]) {
                  t[_k][_k2.toLowerCase()] = k[_k][_k2]
                  if(_k2.endsWith('#')){
                    t[_k][_k2.replace('#','').toLowerCase()] = k[_k][_k2]
                  }
              }
            }
            
            return {...c,...t}
          }catch(e){
            loggermodule.info('Error parsing lang:'+e.message)
            return {}
          }
    }, {})
    res.status(200).json({result: o , error: undefined , status: response.status})
   }      
   
}


exports.mobList = async (req, res) => {
  try{
  let data = req.body;

    let params = [
      {
        name: "lang",
        type: TYPES.NVarChar,
        value: data.lang || "",
      },
      {
        name: "user",
        type: TYPES.Int,
        value: data?.userInfos?.userID  || 1,
      },
    ];

  let response = await ssm.execProc("Lang_mobList", params);

  const transformedRes = response.result

  console.log("Lang_mobList",res)

  const transformedData = transformedRes.reduce((acc, item) => {
    acc[item.Code] = item;
    return acc;
}, {});

let obj = {formatted:transformedData}

console.log("transformed data",obj)


  loggermodule.info('End displaying list')
  res.status(response.status).json(obj);

}catch(e){
  loggermodule.error(`Error displaying list :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
}
};






exports.get = async (req, res)=> {
   let companyId = req.body.companyId || -1
   
   let params = []

   let response = await ssm.execProc('Lang_getFile', params)
         
   res.status(200).json(response)
 
}

exports.save = async (req, res)=>{
    let data = req.body ; 
    console.log('boddy:', data)
    let params = [
         {
            name : "code",
            type: TYPES.NVarChar,
            value: data.code
        },
        {
            name : "lang",
            type: TYPES.NVarChar,
            value: data.lang
        },
        {
            name : "text",
            type: TYPES.NVarChar,
            value: data.text
        },
        {
            name : "user",
            type: TYPES.Int,
            value: data?.userInfos?.userID || 0
        }
        /*{
            name : "srcObject",
            type: TYPES.NVarChar,
            value: data.srcObject
        },*/
    
    ]

    let response = await ssm.execProc('Lang_save',params)
    console.log('response:', response)
    if(response.status === 500){
        res.status(response.status).json(response)
    }else{
    //  let langParse =  parseLang(response?.result || [])
     res.status(200).json(response)
    }  
    //res.status(200).json(response)
}

            //let dt = [] ;
 let parseLang =    (odata)=>{
     console.log(odata)
    let langs = {

    }
    /*let lngTypes = await ssm.execProc('get_lang_types')
    let _lngTypes = [];
    lngTypes.forEach( lng => _lngTypes.push(lng.lng));
    console.log('typess:',_lngTypes)*/
    let lngTypes = ["fr", "en", "de"]
    lngTypes.forEach( type => {
            let olangs = {

            }
            let data = odata.filter( dt => dt.lng === type);
            data.forEach( odt =>{
                 olangs[odt.Code || odt.code] = odt.text
            })
            langs[type] = olangs;

    })
    console.log(langs)
    return langs

 }