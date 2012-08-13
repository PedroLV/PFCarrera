/* Depends:
*	custom.css
*   jQuery JavaScript Library v1.6.2
*   jQuerty-templates
*   NameSpaces
*   cscript "$(ProjectDir)DeployFiles.wsf" "$(ProjectDir)"
*/
Designer.oData.Client = function (baseURL) {
    var _instance = this;
    var _baseURL = baseURL;



    this.GetList = function (query, onSuccess, onFail, sync) {
        //hay que registrarse en el dominio remoto.
        try {
            var resultado = null;
            ShowLoadingPanel();

            var queryString = null;
            //if (query.toString() == "[object Object]") {
            //queryString = query.BuildQuery(_baseURL);
            //} else {
            queryString = _baseURL + query;
            //}

            resultado = doServerQuery(queryString, onSuccess, onFail, sync);

        }
        catch (ex) {
            RaiseError(onFail, { name: "Error", message: ex.message, description: 'Ocurrió un error que impidió lanzar la consulta al servidor.' });
            HideLoadingPanel(true);
        }

        return resultado;
    }


    this.Update = function (objectJSON, entityName, onSuccess, onFail) {
        var resultado = null;
        ShowLoadingPanel();
        $.ajax({
            type: "POST",
            async: onSuccess != null,
            contentType: "application/json; charset=utf-8",
            url: _baseURL + entityName,
            data: JSON.stringify(objectJSON),
            dataType: "json",
            success: function (result) {
                resultado = result["d"];
                if (onSuccess) { onSuccess(resultado); }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                var errInfo = { name: "ERROR updateItem " + ajaxOptions, message: thrownError, description: ajaxOptions }; //
                try {
                    var respuesta = $.parseJSON(xhr.responseText);
                    if (respuesta.error.innererror) {
                        errInfo.description = respuesta.error.message.value;
                        errInfo.message = respuesta.error.innererror.message;
                    } else {
                        errInfo.message = respuesta.error.message.value;
                    }
                    //{ name: "ERROR updateItem " + respuesta.code, message: respuesta.error.message.value, description: ajaxOptions }
                } catch (e) {
                    errInfo.description = "Error recibiendo mensaje del servidor." + xhr.responseText != null ? xhr.responseText : '';
                }

                RaiseError(onFail, errInfo);
                HideLoadingPanel(true);
            },
            complete: function (xhr, args, e) {
                HideLoadingPanel();
            }
        });

        return resultado;
    }

    function doServerQuery(queryString, onSuccess, onFail, sync) {
        var resultado = null;

        if (sync === true) {
            $.ajaxSetup({ async: false });
        } else {
            $.ajaxSetup({ async: true });
        }

        var jqxhr = $.getJSON(queryString,
                function (json, e) {
                    if (json.d != null) {
                        resultado = json.d;
                    }
                    if (onSuccess) {
                        onSuccess(resultado);
                    }
                })
                .success(function (xhr) {

                })
                .error(function (xhr, ajaxOptions, thrownError) {
                    RaiseError(onFail, { name: ajaxOptions, message: thrownError, description: xhr.responseText });
                })
                .complete(function (xhr, args, e) {
                    HideLoadingPanel();
                });

        return resultado;
    }

    this.GlobalErrorHandler = null;

    function RaiseError(handler, error) {
        if (handler != null) {
            handler(error);
        }
        else if (_instance.GlobalErrorHandler != null) {
            _instance.GlobalErrorHandler(error);
        } else {
            alert("error: " + error.name + " - " + error.message);
        }
    }


    function ShowLoadingPanel() {
        if (Designer.oData.LoadingPanel) {
            if (Designer.oData.LoadingPanel.Show) {
                Designer.oData.LoadingPanel.Show();
            }
        }
    }

    function HideLoadingPanel(forced) {
        if (Designer.oData.LoadingPanel) {
            Designer.oData.LoadingPanel.Hide(forced);
        }
    }
}

Designer.oData.EnableJSONP = false; //por defecto
Designer.oData.CrossDomain = false;
Designer.oData.SecurityToken = null;
Designer.oData.LoadingPanel = null;

Designer.oData.Base64Util = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Designer.oData.Base64Util._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Designer.oData.Base64Util._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}