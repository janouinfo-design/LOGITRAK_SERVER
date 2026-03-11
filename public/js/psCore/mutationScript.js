$(document).ready(function(){
       // alert()
        var targetNode = document.querySelector('body');

        var config = { attributes: true, childList: true , subtree: true };

       
        var callback = function(mutationsList) {
            console.log('mutationsList:', mutationsList)
            $.fn.setActionFeature()
        };

        var observer = new MutationObserver(callback);

        observer.observe(targetNode, config);

        

      $.fn.setActionFeature = function () {
       
        $("*[pg-action],*[ps-oaction],[ps-dialog]:not([pg-action]):not([ps-oaction])").unbind().click(async function () {
              //btn btn-primary font-weight-bold
                let modal = $('#formModal');
               
                modal.find('#formModalInfoSaver').attr('class','btn btn-primary font-weight-bold')
                let func = ''
                if($(this).attr('pg-action') != undefined){
                    let pgObject = $(this).attr("pg-object") , pgAction = $(this).attr("pg-action") ;
                
                    let _dataTab = $(this).attr("pg-data") || "";
                    _dataTab = _dataTab.split(',')
                    let _params = '';
                    for (let j = 0 ; j < _dataTab.length ; j++)
                        _params += _dataTab[j] + ((j < _dataTab.length - 1) ? ',' : '');
    
                    _params = _params != '' ? ','+_params : ''

                    func = `$().${pgObject}('${pgAction}'${_params})`

                    let pgDialog = $(this).attr('pg-dialog')
                    if(pgDialog){
                          
                        let title = $(this).attr('pg-dialog-title');
                        let body = $(this).attr('pg-dialog-body');
                        let btnClass = $(this).attr('pg-dialog-btn');
                        let btnLabel= $(this).attr('pg-dialog-btn-label');
                        modal.find('#formModalLabel').html(title)

                        modal.find('.modal-body').html(body)

                        modal.find('#formModalInfoSaver').html(btnLabel).addClass(btnClass).off('click').click(function(){
                            setTimeout(func, 1);
                           
                            modal.modal('hide')
                        })
                        modal.modal('show')

                        return
                    }

                }else if($(this).attr('ps-oaction') != undefined){

                    let psAction = $(this).attr("ps-oaction") ;
                    let psData = $(this).attr("ps-objects") || "";
                    let psOncomplet = $(this).attr("ps-oncomplet") 

                    psData = psData.replaceAll('{', '').replaceAll('}', '')
                    psData = psData.split(',')
                    
                    let obj = {}


                    psData.forEach(data => {
                        data = data.replace(/\s/g , '')
                        const fIndex = data.indexOf(':')
                        if(fIndex == -1) return
                        
                        // let val = keyVal.slice(1).join('')
                        obj[data.substr(0,fIndex)] = data.substr(fIndex+1).replace(/[',"]/g, '')
                    })


                    psOncomplet = psOncomplet.trim();
                    let len = psOncomplet.length
                    

                    if(psOncomplet.indexOf('function') == 0 || psOncomplet[len - 1]=='}'){
                        let fsO = psOncomplet.indexOf('{')
                        let lsO = psOncomplet.indexOf('}')
                        psOncomplet = psOncomplet.substring(fsO+1, lsO);
                    }

                    console.log('infooooos:',{psAction, obj ,psOncomplet})
                    let fn = Function('$result','$error',psOncomplet)

                    func = ()=>{
                          $().PSAction('oAction', psAction , obj , fn)
                    }
                   
                  
                   if($(this).attr('ps-dialog') != undefined){
                        
                        let title = $(this).attr('ps-dialog-title');
                        let body = $(this).attr('ps-dialog-body');
                        let btnClass = $(this).attr('ps-dialog-btn');
                        let btnLabel= $(this).attr('ps-dialog-btn-label');
                        
                        modal.find('#formModalLabel').html(title)
                        modal.find('.modal-body').html(body)
                        modal.find('#formModalInfoSaver').html(btnLabel).addClass(btnClass).off('click').click(function(){
                            func()
                            modal.modal('hide')
                        })
                        modal.modal('show')
                        return
                   }
                    
                }else if($(this).attr('ps-oaction') == undefined && $(this).attr('pg-action') == undefined){
                    
                    let title = $(this).attr('ps-dialog-title');
                    let body = $(this).attr('ps-dialog-body');
                    let btnClass = $(this).attr('ps-dialog-btn');
                    let btnLabel= $(this).attr('ps-dialog-btn-label');
                    modal.find('#formModalLabel').html(title)
                    modal.find('.modal-body').html(body)
                    modal.find('#formModalInfoSaver').html(btnLabel).addClass(btnClass)
                    modal.modal('show')
                    return
                }
                console.log(`type of funcc:`, func)
               
                
                setTimeout(func, 1);   
              //  
                return false;	
        }); 
      };
})

