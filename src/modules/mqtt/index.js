let mqtt = require('mqtt');

let mqttclient = null
let FLESPI_CONFIG = {
    mqtt: {
        clientId:'node_mqtt_' + Math.random().toString(16).substr(2, 8),
        uri: 'wss://mqtt.flespi.io:443',
        channelId:1212124,
        deviceId: 234,
        subscription_uri:'flespi/message/gw/',
    },
    token: 'vrJ3RIa7cJhlxlquParevQiRDT1WtdUDlzHfOxJNMSSRV5KgxgEoSyTbYeOGtCPX',
    channelId: 1212124, 
    channelUri: 'https://ch1212124.flespi.gw:30411',
    subscribeToChannel: true,
    ident: 'ident'
}


/**
 * connect to mqtt client
 */
function initMqttClient(){
    console.log('Initializing MQTT client...')
    mqttclient = mqtt.connect(FLESPI_CONFIG.mqtt.uri, {
        clientId: FLESPI_CONFIG.mqtt.clientId,
        username: 'FlespiToken '+FLESPI_CONFIG.token,
        clean: true
    });
    console.log('MQTT client connected.', mqttclient.connected)
    // mqttclient.on('error', function(err) {
    //     console.error('MQTT connection error: ', err);
    //     mqttclient.end();
    // });
    // auto subscribe to channel specified in config
    if(FLESPI_CONFIG.subscribeToChannel && FLESPI_CONFIG.channelId){
        subscribeToMqttItem(FLESPI_CONFIG.channelId , 'channel')
    }
    console.log('MQTT client initialized.')
    return mqttclient
}

// subscribe to channelId (string or array of strings) and deviceId(string or array of strings) specified in FLESPI_CONFIG?.mqtt
function subscribeToMqttEvents(){
    if(!mqttclient) initClient();
    mqttclient.on('connect', function() {
        let channels =  FLESPI_CONFIG?.mqtt?.channelId;
        let devices = FLESPI_CONFIG?.mqtt?.deviceId

        if(channels && !Array.isArray(channels)){
            channels = [channels]
        }
        if(devices && !Array.isArray(devices)){
            devices = [devices]
        }

        if(!Array.isArray(channels)) channels = []

        channels.forEach( c => {
            mqttclient.subscribe(`${FLESPI_CONFIG.mqtt.subscription_uri}channels/${c}/+`);
        })

        devices.forEach( c => {
            mqttclient.subscribe(`${FLESPI_CONFIG.mqtt.subscription_uri}devices/${c}/+`);
        })
        
    });
}

/**
 * Start listening to messages
 * @param {*} callback pass fonction to execute when messages are beeing received
 */
function startMqttListening(callback){
    mqttclient.on('message', function(topic, message) {
        if(typeof callback == 'function') callback(topic , JSON.parse(message.toString()))
    });
}

/**
 * Subscribe to a specifique channelId or deviceId
 * @param {integer} itemId channel or device id
 * @param {string} itemType values = 'channel' or 'device'
 * @returns 
 */
function subscribeToMqttItem(itemId , itemType){
    if(!['device', 'channel'].includes(itemType)){
        console.error("Item type must be either 'device' or 'channel'")
        return
    }
    mqttclient.subscribe(`${FLESPI_CONFIG.mqtt.subscription_uri}${itemType}s/${itemId}/+`);
}

/**
 * Send new message to channel
 * @param {Array[any]} data 
 * @returns 
 */
function sendMessageToChannel(data){
    return new Promise((rs , rj)=>{
        let uri = FLESPI_CONFIG.channelUri
        let params = prepareMessageParams(data);
        fetch(uri , params)
            .then(r => rs({success: true , response:  r.statusText }))
            .catch(r => rs({success: false , error: r.message}))
    })
}

/**
 * format fetch request params
 * @param {Array[any]} data 
 * @returns 
 */
function prepareMessageParams(data){
    return {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }
}


module.exports = {
    initMqttClient,
    startMqttListening,
    subscribeToMqttItem,
    subscribeToMqttEvents,
    sendMessageToChannel,
    mqttclient
}
