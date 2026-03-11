const { STATIC_PATHS } = require('../configs');
const actions = require('../actions');


function initializeRoutes(app){
   for(const action of actions){
      app[action.method](action.path , ...action.middlewareBefore, action.controller, ...action.middlewareAfter)
   }
}


module.exports =  {
    initializeRoutes
}