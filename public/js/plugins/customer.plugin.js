(($)=> {

    const defaults = {

    }

    const methods = {
         list(){
             $().PSAction('oAction' , 'custoer/list' , {} , methods.draw)
         },
         draw(res , err){
             console.log('result:', res , err)
         }
    }

    $.fn.Customer = function (options) {

        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Customer : method ' + options + ' does not exist ');
        }
    };


})(jQuery)