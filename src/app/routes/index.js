const routes = {
    addressRouter: require('./address.router'),
    authRouter: require('./auth.router'),
    catalogRouter: require('./catalog.router'),
    companyRouter: require('./company.router'),
    customerRouter: require('./customer.router'),
    depositRouter: require('./deposit.router'),
    fileRouter: require('./file.router'),
    geofencingRouter: require('./geofencing.router'),
    langRouter: require('./lang.router'),
    realtimeRouter: require('./realtime.router'),
    statusRouter: require('./status.router'),
    typeRouter: require('./types.router'),
    userRouter: require('./user.router'),
    matrixRouter: require('./matrix.router'),
    tarifRouter: require('./tarif.router'),
    invoicePendingBilling : require('./invoicePendingBilling.router')
 }

 module.exports = {
    routes,
    initRoutes(app){
        if(!app) return
        for(const route in routes){
            app.use(route.replace('Route'))
        }
    }
}
