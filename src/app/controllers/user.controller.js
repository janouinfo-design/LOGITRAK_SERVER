const { onException, onResult } = require('../../utils/error.utl')
const { generateToken, verifyToken  , comparePassword } = require('../../utils/security.utl')
const { execProc } = require('../../apis/sql-server-request')
const { TYPES } = require('tedious')


exports.login = async (req, res) => {
    console.log('credentiales:', req.body)
    try {
            const {user , password , ip , app} = req.body
      
            if(!user || !password) throw new Error('Email ou mot de pass invalid !!!')

            let refreshToken = ''

            const params = [
                {
                    name:"user",
                    type: TYPES.NVarChar,
                    value: user
                },
                {
                    name:"password",
                    type: TYPES.NVarChar,
                    value: password
                },
                {
                    name:"app",
                    type: TYPES.NVarChar,
                    value: app || ''
                },
                {
                    name:"ip",
                    type: TYPES.NVarChar,
                    value: ip || ''
                },
                {
                    name:"mode",
                    type: TYPES.NVarChar,
                    value:  ''
                },
            ]

            let response = await execProc('User_Authentificate' , params)

            console.log('response proc : ',response);

            response.result = Array.isArray(response.result) ?  response.result: []
            if(!response.result[0] || response.result[0]?.key == 'Erreur authentification')
                throw {message: 'Error auth' , status: 401}
            else {

                response = response.result[0]
                refreshToken = response.key
                response = await execProc('User_checkToken' , [
                    {
                        name:"key",
                        type: TYPES.NVarChar,
                        value: response.key
                    }
                ])
            }

            res.cookie('token', refreshToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true, //process.env.NODE_ENV !== 'production',
                maxAge: 24 * 60 * 60 * 1000
            });

            console.log('result : ', res);
            console.log('result staff: ', response.result?.[0]);
            onResult(res, response.result?.[0])

    } catch (e) {
        onException(e, res, e.status != 401 ? 500 : e.status)
        // res.status(e.status != 401 ? 500 : e.status).json({ error: true, result: e.message })
    }
}

exports.logout = async (req, res) => {
    try {
        const token = (req.cookies || {}).token

        if (!token) return res.sendStatus(203);

        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None' });

        return res.sendStatus(203)

    } catch (e) {
        onException(e, res)
    }
}

exports.checkToken = async (req , res)=> {
    try{
        const {token ,  app , ip} = req.body

    
        const params = [
            {
                name:"key",
                type: TYPES.NVarChar,
                value: token
            },
            // {
            //     name:"app",
            //     type: TYPES.NVarChar,
            //     value: app || ''
            // },
            // {
            //     name:"ip",
            //     type: TYPES.NVarChar,
            //     value: ip || ''
            // },
        ]
    
        let response = await execProc('User_checkToken' , params)
    
        onResult(res, response.result?.[0])
    
    }catch(e){
        onException(e , res)
    }

}

exports.handleRefreshToken = async (req, res) => {
    try {
        let token = (req.cookies || {}).token;

        if (!token) return res.sendStatus(401);

        token = /Bear/.test(token) ? token.split(' ')[1] : token

        console.log('token:', token)

        const verifiedToken = await verifyToken(token, 'refresh')

        if (!verifiedToken.isValid && verifiedToken.result == 'jwt expired') return res.sendStatus(403)
        else if (!verifiedToken.isValid) return res.status(500).json(verifiedToken)

        const accessToken = await generateToken({ userID: verifiedToken.userID }, { expiresIn: '30s', type: 'access' })
        onResult(res, { accessToken })
    } catch (e) {
        onException(e, res)
    }
}

exports.verifyUser = async (req, res) => {
    try {

        const refreshToken = ''
        const accessToken = ''
        res.cookie('token', refreshToken, {
            httpOnly: true,
            secure: true, //process.env.NODE_ENV == 'production',
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000
        })

        onResult(res, { accessToken, user: user.toJSON() })
    } catch (e) {
        onException(e, res)
    }
}

exports.getPointAttachement = async (req , res)=> {
    try{
        let response = await execProc('attachement_points' , { user: req.body.user})
        let result = Array.isArray(response?.result) ? response?.result : [];

        onResult(res , result)
    }catch(e){
       onException(e, res)
    }
}


exports.auth = async (req, res)=>{
    try {
  
      let data = req.body.data || req.body;
      
      let params = [
        {
          name: "username",
          type: TYPES.NVarChar,
          value: data.username || "",
        },
        {
            name: "password",
            type: TYPES.NVarChar,
            value: data.password || "",
          },
          { 
            name:"user",
            type: TYPES.Int,
            value: req?.userInfos?.userID || 0 },
      ]
  
    let response = await ssm.execProc('User_Authentificate_react',params)
    loggermodule.info('End User auth action')
    res.status(response.status).json(response)
  }catch(e){
  loggermodule.error(`Error User auth action' :`+ e.message)
  res.status(500).json({ success:false, res : e.message });
  }
  }