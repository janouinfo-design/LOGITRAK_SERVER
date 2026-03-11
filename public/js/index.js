let appGlobalInfo = {}
function parseTemplate(temp , data){
   return Mustache.render(temp , data)
}