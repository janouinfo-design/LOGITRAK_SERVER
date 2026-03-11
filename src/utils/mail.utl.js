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
console.log(APP_CONTACT_EMAIL)
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
                    from: `VEM <${options.from || GOOGLE_USER}>`,
                    to: options?.to || APP_CONTACT_EMAIL,
					
                    subject: options?.subject || "Message contact VEM",
                    // cc: "dodjiakakpo01@gmail.com,da@omniyat.org",
                    text: options?.text || body,
                    html: `<body>${body}</body>`
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


exports.sendMessageByMail = async (messageObj)=>{
      let temp = `
                 <style>
    
                    .w-full {
                    /* width: 100% */
                    }
                    .text-right {
                      text-align: left;
                    }
                
                    .thead {
                        padding-right: 3rem;width: 100px;color: gray;text-align: left;
                    }
                    .info-container {
                        display: flex;
                       
                    }

                    .info {
                       max-width: 300px;
                    }

                    
            </style>


            <div class="info-container" style="display: flex ;  margin: 1rem 0;">
                <div class="thead" style=" padding-right: 3rem;width: 100px;color: gray;text-align: left;">
                    <span>Envoyé par:</span> 
                </div>
                <div class="info" style="max-width: 300px;">
                    <strong>${messageObj.fullname || 'Anonyme'}</strong>
                </div>
            </div>
            <div class="info-container" style="display: flex ;  margin: 1rem 0;">
                <div  class="thead" style=" padding-right: 3rem;width: 100px;color: gray;text-align: left;">
                    <span>Message:</span>
                </div>
                <div class="info" style="max-width: 300px;">${messageObj.message}</div>
            </div>
            <div class="info-container" style="display: flex ;  margin: 1rem 0;">
                <div class="thead" style=" padding-right: 3rem;width: 100px;color: gray;text-align: left;">
                    <span>Contact:</span>
                </div>
                <div class="info" style="max-width: 300px;">
                    ${messageObj.email} / ${messageObj.phone}
                </div>
            </div>
      `

      text = `
         ${messageObj.message} \n

         ${messageObj.fullname || 'Anonyme'} (${messageObj.email} / ${messageObj.phone})
      `

      messageObj.subject = messageObj.subject || "Message contact VEM "+messageObj.fullname
      messageObj.text = text
      await this.sendMail(temp , messageObj)
}