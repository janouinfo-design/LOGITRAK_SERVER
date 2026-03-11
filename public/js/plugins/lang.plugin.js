(($) => {
	let defaults = {
		// srcObject: "ModelFields",
		// parentID: 0,
		currentSettings: {},
	};

	let methods = {
        async init(){
            await methods.translate()
             
            var targetNode = document.querySelector('body');

            var config = { attributes: true, childList: true };

            var callback = function(mutationsList) {
                methods.translate()
            };
            
            var observer = new MutationObserver(callback);
        
            observer.observe(targetNode, config);

            
        },
        async getLangs(){
            let o = await $().PSAction('oAction', 'lang/list' , {})
            if(o.success) {
                defaults.langs = o.result
            }
        },
        updateLocalLang(options , translate = 1){
            options = Array.isArray(options) ? options : [options]

            for(let o of options){
                if(!o?.lang || !o?.code || !o?.text)
                {
                    continue
                }
                if(!defaults.langs)  defaults.langs = {}
                if(!defaults.langs[o.lang]) defaults.langs[o.lang] = {}
                defaults.langs[o.lang][o.code.toLowerCase()] = o.text

                if(translate){
                    $(`[olang='${o.code}']`).html(o.text)
                    $(`.lang-edit-btn[parent='${o.code}']`).attr('pg-data', `'${o.code}' , '${o.text}'`)
                }
            }
        },
        changeLang(lang){
           curLang = lang
           defaults.currentSettings.lang = lang;
        },
        async translate(get = 0 , dom){
            if(!defaults.langs || get) await methods.getLangs()
            if(!defaults.langs) return
            $('[olang]').each(function(){
                 let o = ($(this).attr('olang') || '').replace(/\s/g, '').toLowerCase()
                 $(this).html(defaults.langs[curLang]?.[o] || o)
            })
        },
		start_editing() {
			$.each($("[olang]"), (index, el) => {
				let text = $(el).html() || $(el).attr("olang");
				let code = $(el).attr("olang");

				let ochild = `
                    <button parent='${code}' class="btn btn-info  btn-icon btn-light-warning btn-circle mr-2 lang-edit-btn" 
                        data-toggle="tooltip" data-theme="dark" title="Supprimer" 
                        pg-action="show_lang_dialog" pg-object="Lang" pg-data="'${code}','${text}'">
                        <i class="fas fa-language">&times</i>
                    </button>
                 `;

				$(el).after(ochild);
			});
			$("#start-edit-lang").hide();
			$("#stop-edit-lang").show();
		},

		stop_editing() {
			$(".lang-edit-btn").remove();
			$("#stop-edit-lang").hide();
			$("#start-edit-lang").show();
		},

		show_lang_dialog(code, text) {
			defaults.currentSettings = {
				code,
				text,
			};

			$("#lang-dialog-btn").click();
			$("#lang-dialog-title").html(text + "[" + curLang + "]");
			$("#lang-dialog-body").html(`
			<input type="text" id="lang-input-field" class="form-control">
			<span class="lang_error_text"> </span>
			`);
			$("#lang-input-field").val(text);
		},

		olangToggle: function () {
			let langToggle = true;
			$("#langEdit").click(function () {
				if (langToggle === true) {
					$().Lang("start_editing");
					langToggle = !langToggle;
				} else if (langToggle === false) {
					$().Lang("stop_editing");
					langToggle = !langToggle;
				}
				return;
			});
		},

		addOlangAttribute: function (pageName, id) {
			let _val = "table";
			let _dom = `#lstTab-${pageName}`;
			let table = $("table").attr("id") == id;

			let _heads = $(_dom).find("thead th");
			_heads.each(function (index, column) {
				let columnName = $(column).data("field").trim();
				$(column).attr("olang", `${pageName}.${columnName}`);
			});
		},

		addOlangtoTable: function (id, pageName) {
			let _dom = `#lstTab-${id}`;
			let _heads = $(_dom).find("thead th");
			_heads.each(function (index, column) {
				let columnName = $(column).data("field").trim();
				$(column).attr("olang", `${pageName}.${columnName}`);
			});
		},

		infos() {
			console.log("lang saved");
			$(".alert-notice").removeClass("show");
			window.location.reload();
			return;
		},

		save_lang() {
			defaults.currentSettings.lang = curLang;
			let temp = `
                <div class="alert alert-custom alert-notice alert-light-danger fade container show" role="">
                    <div class="alert-icon"><i class="flaticon-warning"></i></div>
                    <div class="alert-text font-size-h5">Les caractères spécieux ne sont pas autorisés pour les champs à traduire !
                    </div>
                </div>
			`;
			let data = [];

			let code = defaults.currentSettings.code;
			let lang = curLang;
			let text = $("#lang-input-field").val();
			let format = /[-:-@[-`{-~\/!]/;

            console.log('text:', text)
			if (code != undefined && text.length > 3 && !format.test(text)) {
				$(".alert-notice").removeClass("show");
				let obj = { lang, code, text };
				console.log("current settings:", defaults.currentSettings, "lang obj:", obj);
				$().PSAction("oAction", "lang/save", obj, function (result, error) {
					console.log(result, error);
                    if(Array.isArray(result)){
                        if(result[0]?.message == 'saved') 
                          $().Lang('updateLocalLang' , obj)
                    }
                    // translate()
				});
			}

			if (code == undefined || code.length < 3) {
				let _html = parseTemplate(temp, data);
				$("#alert_modal_lang").attr("pg-dialog-body", _html).click();
				$(".alert-text").html("Code trop court, veuillez ressayer!");
				//$(".alert-notice").addClass("show");
				return;
			}

			if (text == undefined || text.length < 3) {
				let _html = parseTemplate(temp, data);
				$("#alert_modal_lang").attr("pg-dialog-body", _html).click();
				$(".alert-text").html("Nom trop court, veuillez ressayer!");
				return;
			}

			if (format.test(text)) {
				let _html = parseTemplate(temp, data);
				$("#alert_modal_lang").attr("pg-dialog-body", _html).click();
				//$(".alert_modal").addClass("show");
				console.log("regex:", format.test(text));
				console.log("olang input has special chars");
			}
			// } else {
			// 	$(".alert-notice").removeClass("show");
			// 	let obj = { lang, code, text };
			// 	console.log("current settings:", defaults.currentSettings, "lang obj:", obj);

			// 	$().PSAction("oAction", "lang/save", obj, function (result, error) {
			// 		console.log(result, error);
			// 	});
			// }
		},
	};



	$.fn.Lang = function (options) {
		var t = [];
		if (methods[options]) {
			return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof options === "object" || !options) {
			return methods.init.apply(this, arguments);
		}
	};

    methods.init()
})(jQuery);
