(function ($) {

    var defaults = {
        master : {
            'master1' : 'pages/shared/master1.html',
            'master2' : 'pages/shared/master2.html'
        },
        history: [],
        loginPage: 'pages/user/login.html'
    };
    var methods = {
        navigateTo: async function (path, r_datas, func ){
            
            if(r_datas == undefined)  r_datas = {};

            path = path.indexOf(".html") != -1 ? path :  path+'/index.html'
            console.log('navigation:', path)
            if(path.trim() !== (defaults.loginPage || '').trim())
                defaults.history.push({path, data: r_datas , func})

           if(defaults.loginPage != undefined && path.trim() == defaults.loginPage.trim() ) defaults.history = []

           // $().Layout('showAside', 0)
            let container =  $('#main');
            $.ajax({
                url: path,
            }).done(function(data) {
                let content = data;
                content = Mustache.render(content, r_datas);
                container.html(content);
                //	console.log(content)
                
               

                setTimeout(function(){
                    if(func != undefined){
                        func();
                    }
                    $.fn.setActionFeature();
                }, 500);

                let pageName = path.split('pages/')[1].replace('.html', '')

                appGlobalInfo.currentRoute = pageName;
                appGlobalInfo.isInDetail = appGlobalInfo.currentRoute == "request_access/detail"
                appGlobalInfo.isInRapport = appGlobalInfo.currentRoute.indexOf('rapport/') != -1
                appGlobalInfo.isInIncidentEdit = appGlobalInfo.currentRoute == "incident/edit"
              //  appGlobalInfo.isInPaDhocket = appGlobalInfo.currentRoute == "incident/edit"
                console.log('currentRoute:', pageName)

                if(appGlobalInfo.app == "access") {
                    if(appGlobalInfo.isInDetail 
                        || appGlobalInfo.currentRoute == "request_access/index"
                        || appGlobalInfo.currentRoute == "request_access/edit")
                     $('#request-detail-nav').hide()
                    else
                     $('#request-detail-nav').show()
                }
            }).fail(function() {
                alert( "error" );
            });

        },
        push(func){
            
            if(typeof func == "function")
               defaults.history.push(func)
        },
        previous(){
            if(!(defaults.history instanceof Array )) return

            if(defaults.history.length < 2) return

            if(appGlobalInfo.currentRoute.indexOf('rapport/') != -1){
                
                defaults.history.forEach( (route , index)  => {
                    if(route.path.indexOf('ticket_validation/') != -1 || route.path.indexOf('image/') != -1 ||  route.path.indexOf('fttx/validation') !=-1 ||  route.path.indexOf('inventaire/edit') !=-1 ) 
                        defaults.history.splice(index, 1)
                });
            }
            
            console.log('routeTo:', defaults.history)
            let routeTo = defaults.history.pop()
            routeTo = defaults.history.pop()
            console.log('routeTo:', routeTo)

            if(routeTo) {
                if(typeof routeTo == 'function') routeTo()
                else methods.navigateTo(routeTo.path , routeTo.data , routeTo.func)
            }

        },
   
    };

    $.fn.Routes = function (options) {

        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Customer : method ' + options + ' does not exist ');
        }
    };

} (jQuery));
