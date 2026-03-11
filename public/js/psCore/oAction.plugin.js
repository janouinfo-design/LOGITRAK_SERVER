(function ($) {	
	var defaults = { 
		 default_level: 0,
         baseUrl: "http://localhost:31000/",
         baseUrl0: "https://89.145.163.15:81/",
		 configs: {
			 auth_key: 123,
             app: 'PSWEB'
		 }
    };
	
    var methods = {
		async oAction(action , data = {}, oncomplet = ()=>{}){
            return new Promise((r,e)=> {
                try{
                    data = data || {};
                    // data.auth_key = defaults.configs.key
                    console.log('data:', data)
                    $.ajax({
                        url: defaults.baseUrl+action,
                        data: {...data , ...defaults.configs},
                        headers :{
                            //Authorization: 'bearer ',
                        }, 
                        method: "POST",
                        dataType: 'json',
                        async: true,
                    }).done( res =>{
                        //   console.log('oaction 2 res:', res)
                          if(oncomplet && typeof oncomplet == 'function'){
                                oncomplet(res?.result , res?.error);
                          }
                          r({...res , success: true})
        
                    }).fail( err =>{
                        
                        if(oncomplet && typeof oncomplet == 'function'){
                                oncomplet(undefined , {message: err.message , status: err.status || 0});
                        }

                        r({result:err.message , success: false})
                        
                    })
                }
                catch(ex){
                    if(oncomplet && typeof oncomplet == 'function'){
                        oncomplet(null , [{error: ex.message}]);
                    }
                    r({success: false , result: ex.message})
                }
            })
			
        }

    };
	
    $.fn.PSAction = function( options ) {  
		var t = [];
		if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || ! options) {
            return methods.init.apply(this, arguments);
        }
    };
}( jQuery ));


/*$().PSAction2('oAction', 'vehicule/get',  {id: 4521} , (result , error) =>{
	
})*/