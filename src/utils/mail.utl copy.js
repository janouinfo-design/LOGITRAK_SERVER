const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const { 
        GOOGLE_USER , 
        GOOGLE_PASSWORD , 
        GOOGLE_CLIENT_ID , 
        GOOGLE_CLIENT_SECRET , 
        GOOGLE_REDIRECT_URL , 
        GOOGLE_REFRESH_TOKEN ,
        APP_CONTACT_EMAIL
     } = require('../configs/index.cfg')
console.log(GOOGLE_USER)
const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID , GOOGLE_CLIENT_SECRET , GOOGLE_REDIRECT_URL)
oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })

exports.sendMail = async (body , options = {})=>{
          try{
                const accessToken = oauth2Client.getAccessToken() 
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    // port:  857,
                    auth: {
                        type: "OAuth2",
                        user: GOOGLE_USER,
                        clientId: GOOGLE_CLIENT_ID,
                        clientSecret: GOOGLE_CLIENT_SECRET,
                        refreshToken: GOOGLE_REFRESH_TOKEN,
                        accessToken
                    }
                })

                let params = {
                    from: `Your best <${GOOGLE_USER}>`,
                    to: options?.to || APP_CONTACT_EMAIL,
                    object: options?.object || "Message contact VEM",
                    // cc: "dodjiakakpo01@gmail.com,da@omniyat.org",
                    text: body,
                    html: `<h2>${body}</h2>`
                }

                let result = await transporter.sendMail(params)
                console.log('[INFO]: mail sent successfully ', result)
                return {error: false , result}
          }      
          catch(e){
            console.log('[INFO]: error sending mail', e.message)

             return {error: true , result: e.message}
          }
}