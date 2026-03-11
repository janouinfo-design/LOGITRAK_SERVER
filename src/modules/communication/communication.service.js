const loggermodule = require('#modules/loggermodule.js');
const firebasemodule = require('@omniyat/firebasemodule')
const iomodule = require('#modules/iomodule.js');
const moment = require('moment');
exports.sendChatNotification = async (data)=>{
    try{
        console.log('process.env.appconfig:', process.appconfig)
        let topic = process.appconfig?.firebase_chat_topic || null;
        loggermodule.info("[CHAT NOTIFICATION] sending notification to topic "+topic)
        iomodule.emit('data_message' , {msg: {...data ,creadate: moment().format() }})
        
        if(!topic){
            let message = `no firebase_chat_topic set.
                           Please set this topic in config table 
                           Name: appName , value: {..., "firebase_chat_topic":"{{topicname}}"}`
            throw new Error(message);
        } 
        
        if(data){
            for(let key in data){
                data[key] = data[key].toString();
            }
            firebasemodule.sendMessage({
            data: { 
                data: JSON.stringify(data),
                notifee: JSON.stringify({
                    channelId: 'default',
                    sound: 'default',
                    pressAction: {
                        id: 'default',
                    }
                })
            },
            "android": {
			  "priority": "high"
			},
            /** ACTIVATE THIS IF YOU WANT THE DEFAULT FIREBASE NOTIFICATION BE BE SHOWN ON DEVICE */
            // notification : {
            //     title: `Nouveau message - ${data.src} [${data?.Object || data.srcId}]`,
            //     body: data.message,
            // },
            topic,
            }).then(res => {
                console.log('notification sent res:', res)
                loggermodule.info("[CHAT NOTIFICATION] notification sent to topic "+topic)
            }).catch(err => {
                loggermodule.error("[CHAT NOTIFICATION] error:" + err.message)
            })
        }
    }catch(e){
        loggermodule.error("[CHAT NOTIFICATION] error:" + e.message)
    }
}

