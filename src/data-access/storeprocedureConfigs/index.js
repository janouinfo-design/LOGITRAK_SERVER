const { TYPES } = require("tedious");

module.exports = {
    procedures: {
        'customer_list': {
            id: "customer_list",
            params:  require('./params/customers/customer.get')
        },
        'attachement_points': {
            id: 'User_getPointAttachement',
            params: [
                {
                    name: 'user',
                    default: 0,
                    type: TYPES.Int,
                }
            ]
        },
        
        'save_matrice': {
            id : 'FACT_SaveMatrice',
            params : [
                {
                    name : "id",
                    type: TYPES.Int,
                    
                },
                {
                    name : "code",
                    type: TYPES.NVarChar,
                },
                {
                    name : "desc",
                    type: TYPES.NVarChar,
                },
                {
                    name : "xp",
                    type: TYPES.NVarChar,
                },
                {
                    name : "xu",
                    types : TYPES.NVarChar,
                },
                {
                    name : "yp",
                    types : TYPES.NVarChar,
                },
                {
                    name : "yu",
                    types : TYPES.NVarChar,
                },
            ]
        },
        'matrice_list': {
            id: 'FACT_getListMatrices',
            params: [
                {
                    name: 'ID',
                    types : TYPES.Int
                }
            ]
        },
        'matrice_get':{
            id:'FACT_getMatriceByName',
            params : [
                {
                    name:"code",
                    type: TYPES.NVarChar,
                }
            ]
        },

        'tarif_list' : {
            id : 'FACT_getListTarifs',
            params : [
                {
                    name : 'ID',
                    default: 0,
                }
            ]
        },

        'invoice_pending_list':{
            id : 'FACT_getInvoicePendingBilling',
            params : [
                {
                    name: 'ID',
                    types : TYPES.Int
                }
            ]
        },


        'savebilling': {
            id : 'invoice_save_billing',
            params : [
                {
                    name : "id",
                    type: TYPES.Int,
                },
                {
                    name : "customerId",
                    type: TYPES.Int,
                },
                {
                    name : "invoiceId",
                    type: TYPES.Int,
                },            
            ]
        },
        "SaveNavixy_Geofence" : {
            id : "GeoFence_SaveNavixy" ,
            params : [
                {
                    name: "data",
                    type: TYPES.NVarChar,
                }
            ]
        },
        "Get_Params_Niveau": {
            id : "FACT_getParamsNiveau",
            params : []
        },
        "Get_Params_NiveauSrcData":{
            id : "FACT_getParamsNiveauSrcData",
            params : [
                {
                    name: "IdParam",
                    type: TYPES.NVarChar,
                }
            ]
        },
        "Client_getPrestation_List": {
            id : "Client_getPrestationList",
            params : []
        },
        "Tarif_GetEtat": {
            id : "FACT_TarifGetEtat",
            params : []
        },
        "get_Parametres": {
            id : "FACT_getParametres",
            params : []
        },

        'companySaveSetup': {
            id : 'company_saveSetup',
            params : [
                {
                    name : "language",
                    type: TYPES.NVarChar,
                    
                },
                {
                    name : "timezone",
                    type: TYPES.NVarChar,
                },
                {
                    name : "distanceUnit",
                    type: TYPES.NVarChar,
                },
                {
                    name : "volumeUnit",
                    type: TYPES.NVarChar,
                },
                {
                    name : "temperatureUnit",
                    types : TYPES.NVarChar,
                },
            ]
        },

        "get_byCustomer":{
            id:"tag_getbyCustomer",
            params:[
                {
                    name:"id",
                    type: TYPES.Int
                }
            ]
        },

        "remove_byCustomer":{
            id:"tag_removebyCustomer",
            params : [
                {
                    name:"idCustomer",
                    type: TYPES.Int,
                },
                {
                    name:"idTag",
                    type: TYPES.Int,
                }
            ]
        },

        "get_geofence":{
            id:"geofence_getbyworksite",
            params : [
                {
                    name: "worksiteID",
                    type: TYPES.Int
                }
            ]
        },

        "list_geofence":{
            id:"geofence_list",
            params : [
                {
                    name: "geofenceType",
                    type: TYPES.NVarChar
                }
            ]
        }
        ,
        "get_MatriceItems":{
            id:"FACT_getMatriceItems",
            params: [
                {
                    name:"ID_Matrice",
                    type:TYPES.BigInt
                }
            ]
        },
        "tag_saveByCustomer":{
            id:"relation_add",
            params:[
                {
                    name:"srcId",
                    type:TYPES.BigInt,
                },
                {
                    name:"src",
                    type:TYPES.NVarChar,
                },
                {
                    name:"objId",
                    type:TYPES.NVarChar,
                },
                {
                    name:"obj",
                    type:TYPES.NVarChar,
                },
            ]
        },
        "Add_Dimension":{
            id:"FACT_AddDimension",
            params:[
                {
                    name:"id",
                    type:TYPES.BigInt
                },
                {
                    name:"dim",
                    type:TYPES.NVarChar
                },
                {
                    name:"max",
                    type:TYPES.Float
                }
            ]
        },
        "Update_PrixMatrice":{
            id:'FACT_UpdatePrixMatrice',
            params : [
                {
                    name:"xf",
                    type:TYPES.Float
                },
                {
                    name:"xt",
                    type: TYPES.Float
                },
                {
                    name:"yf",
                    type:TYPES.Float
                },
                {
                    name:"yt",
                    type:TYPES.Float
                },
                {
                    name:"prix",
                    type:TYPES.Float
                },
                {
                    name:"id",
                    type:TYPES.BigInt
                }
            ]
        },
        "save_tarif":{
            id:"FACT_SaveTarif",
            params : [
                {
                    name : "id",
                    type: TYPES.Int,
                },
                {
                    name : "code",
                    type: TYPES.NVarChar,
                },
                {
                    name : "desc",
                    type: TYPES.NVarChar,
                },
                {
                    name : "prestation",
                    type: TYPES.NVarChar,
                },
                {
                    name : "etat",
                    types : TYPES.NVarChar,
                },
                {
                    name : "id_tarif_filter_selection",
                    types : TYPES.Int,
                },
                {
                    name : "valeur_filter_selection",
                    types : TYPES.NVarChar,
                },
                {
                    name : "formule_condition",
                    types : TYPES.NVarChar,
                },
                {
                    name : "formule_calcule",
                    types : TYPES.NVarChar,
                },
            ]
        },
        "get_deposit":{
            id:"deposit_get",
            params: [
                {
                    name : "id",
                    types: TYPES.BigInt,
                    /*default : 0 */
                }

            ]
        }

        }

    }
