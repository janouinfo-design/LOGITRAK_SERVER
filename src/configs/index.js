require('dotenv').config()
const path = require('path')

let configs = {
    env: {
        DEV_MODE: process.env.NODE_ENV,
        PORT: process.env.PORT,
        HTTPS_PORT: process.env.HTTPS_PORT,
        SERVER_PORT: process.env.SERVER_PORT ,
        SERVER_NAME: process.env.SERVER_NAME ,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_DEFAULT_DB: process.env.DB_DEFAULT_DB,
        SECRET_KEY: process.env.SECRET_KEY,
        DISABLE_GATEWAY: process.env.DISABLE_GATEWAY,
        CUSTOMER_PSEUDO: process.env.CUSTOMER_PSEUDO,
        PROXY_APPNAME: process.env.PROXY_APPNAME
    },
    STATIC_PATHS: [
        path.resolve(process.cwd(), 'src/storage')
    ],
    xLocation : {
         geocoding: {
            uri: 'https://maps.googleapis.com/maps/api/geocode/json'
         },
         apikey: process.env.LOCATION_SERVICE_API_KEY,
         provider: process.env.LOCATION_API_PROVIDER,
         allow_geocode: process.env.LOCATION_ALLOW_GEOCODE
    },
    xNavixy: {
        api: {
            baseUrl: process.env.NAVIXY_API_BASE,
        },
        user: {
            login: process.env.NAVIXY_API_LOGIN,
            password: process.env.NAVIXY_API_PASSWORD
        }
    },
    xFlespi: {
        uri: process.env.FLESPI_CHANEL_URI,
        endPoints: {
            tags_histories: process.env.FLESPI_MESSAGES_URI,
            geofences: process.env.FLESPI_GEOFENCE_URI
        },
        token: process.env.FLESPI_TOKEN
    },
    origins: {
        acrow: [
            "localhost:51000",
            "http://localhost:3011",
            'http://127.0.0.1:5500',
            "http://89.145.163.15:82",
            "http://89.145.163.15:83",
            "http://localhost:83",
            "https://localhost:83",
        ]
    },
    directories: {
        geofencing: path.resolve(process.cwd(), 'src/storage/geometries'),
        geofencing_local: 'storage/geometries',
        storage: process.env.STORAGE_DIRECTORY
        //path.resolve(process.cwd(), 'src/storage')
    },
    configs: {
       store_procedure: require('../data-access/storeprocedureConfigs/index') 
    },
    xMicroService: {
        uri: process.env.MICROSERVICE_URI
    },
    application: {
        paths: {
            routes: path.resolve(process.cwd(), 'src/app/routes'),
            controllers: path.resolve(process.cwd(), 'src/app/controllers'),
        }
    }
    
}

module.exports = configs