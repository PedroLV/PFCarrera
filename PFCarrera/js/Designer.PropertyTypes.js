
Designer.PropertyTypes.BasePropertyType = function () {

    this.$Input = null;
    this.cssStyle = null; //key de style.

    this.GetDefaultValue = function () { return null; }
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<input type=\"text\" maxlength=\"550\" class=\"_propertyType pinput\"";
        if (this.ReadOnly) {
            r += " readonly=\"readonly\" ";
        }
        r += " value=\"";

        if (exp != null) {
            r += this.TextToDisplay(exp);
        }

        r += "\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);
        if (!this.ReadOnly) {
            $editor.bind('focusout', fun == null ? Designer.Model.ControlManager.onPropertyUpdating : fun);

            $editor.bind('keydown', function (event) {
                if (event.keyCode == '13') {
                    event.preventDefault();
                    this.blur();
                }
            });
        }
        this.$Input = $editor;
        return $editor;
    }
    /*SetValue sirve para establece el valor de editor desde fuera del editor. */
    this.SetValue = function (newValue) {
        if (this.$Input != null) {
            var valor = this.TextToDisplay(newValue);
            this.$Input.val(valor);
            this.$Input.attr("title", valor);
        }
        if (this.Properties != null && this.Properties.length > 0) {
            jQuery.each(this.Properties, function (i, prop) {
                prop.PropertyType.SetValue(newValue[prop.Name]);
            });
        }
    }
    this.ReadOnly = false; //indica si el editor es readOnly para las propiedades que tienen desplegables
    this.HasHtmlContent = false;
    this.RenderTarget = null;
    this.HtmlContent = null;    /* Valor que contiene el HTML a insertar en el diseñador.*/
    this.TextToDisplayFormat = null;
    this.Parent = null; //es el padre en la cadena de uniones Descriptor --> propiedad --> type --> propiedades -- type ...

    this.Properties = null; //propiedades del editor
    //Inicializa las propiedades.
    this.InitProperties = function () { }; 
    /* Determina si esta propiedad puede ser establecida o leída cuando hay varios controles seleccionados.  */
    this.AllowMultiSelect = true;
    /* Este método valida que el valor del editor es coherente con el tipo de editor. Normalmente será una expresion regular */
    this.Validate = function (exp) { return true; }
    /*valor que muestra en el editor
    El valor que muestra un editor puede venir determiando por este editor, o bien por los editores de las propiedades que contiene.
    */
    this.TextToDisplay = function (exp) {
        if (this.TextToDisplayFormat != null) {
            TextToDisplayFormat.format((this.Properties != null && this.Properties.length > 0) ? this.Properties : exp.toString());
        }
        else if (this.Properties == null || this.Properties.length == 0) {
            return exp;
        } else {
            var str = null;
            jQuery.each(this.Properties, function (i, prop) {
                if (str == null) {
                    str = prop.PropertyType.TextToDisplay(exp[prop.Name]); //
                } else {
                    str += ";" + prop.PropertyType.TextToDisplay(exp[prop.Name]);
                }
            });
            return str;
        }
    }
    this.CssStyleDisplay = function (exp) {

        if (this.cssStyle != null && (this.Properties == null || this.Properties.length == 0)) {
            return this.cssStyle + ":" + this.TextToDisplay(exp) + ";";
        } else {
            var str = '';
            if (this.Properties != null) {
                jQuery.each(this.Properties, function (i, prop) {

                    str += prop.PropertyType.CssStyleDisplay(exp[prop.Name]);

                });
            }
            return str;
        }
    } //cadena CSS key:valor;

    this.HasCss = function () {
        var updateCss = true;
        updateCss = this.cssStyle != null;
        if (this.Properties == null || this.Properties.length == 0) {

        } else {
            for (var i = 0; i < this.Properties.length; i++) {
                if (!updateCss) {
                    updateCss = updateCss || this.Properties[i].PropertyType.HasCss();
                }
            }
        }
        return updateCss;
    }
    this.CheckHtmlContent = function () {
        var r = true;
        r = this.HasHtmlContent.toString().toLowerCase() == "true";
        if (this.Properties != null && this.Properties.length > 0) {
            for (var i = 0; i < this.Properties.length; i++) {
                if (!r) {
                    r = r || this.Properties[i].PropertyType.CheckHtmlContent();
                }
            }
        }
        return r;
    }
    /*Obtiene la propiedad que controla el origen de datos para propiedades bindadas contra un control de datos */
    this.GetValidSource = function () { if (this.Parent && this.Parent.GetValidSource) { return this.Parent.GetValidSource(); } else { return null; } };
    /* Devuelve el control propietario de una propiedad o un tipo de propiedad.  */
    this.GetControlOwner = function () {
        return this.Parent.GetControlOwner();
    }

    this.Description = ""; //descripción de ayuda de la propiedad.
    this.ID = 1; //Identificador unico de un editor
}

Designer.PropertyTypes.NumericValue = function (defaultValue, cssName) {
    var _defaultValue = 0;
    if (defaultValue != null) {
        _defaultValue = parseInt(defaultValue);
    }

    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return _defaultValue; }


    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return exp; }
    this.Properties = null;
    /* valida que el dato introducido sea un número */
    this.Validate = function (exp) { return (exp - 0) == exp && exp.length > 0; }
    this.Description = "Esta propiedad admite valores numéricos."
    this.ID = 2; //Identificador unico de un editor
}


Designer.PropertyTypes.NumericValue.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.SizeValue = function (defaultValue, cssName) {
    var _defaultValue = "0px";
    if (defaultValue != null) {
        _defaultValue = parseInt(defaultValue);
    }
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }


    this.ReadOnly = false; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { if ((exp - 0) == exp && exp.length > 0) { return exp + "px" } else { return exp; } }
    this.CssStyleDisplay = function (exp) {
        if (this.cssStyle != null) {
            var m = exp == 0 ? ["0"] : exp.match(/^\d+/);
            if (m != null && m[0] != "0") {
                return this.cssStyle + ":" + this.TextToDisplay(exp) + ";";
            } else {
                return this.cssStyle + ":;"; //eliminar valor.
            }
        } else {
            return '';
        }
    }
    this.Properties = null;
    /* valida que el dato introducido sea un número */
    this.Validate = function (exp) {
        //var r = exp.match(/-{0,1}\d\s?(px|%|in|cm|mm|em|pt)?$/);
        var r = exp.match(/^\d+\s?(px|%|in|cm|mm|em|pt)?$/);

        //        if (r) {
        //            (exp - 0) == exp && exp.length > 0;
        //        }
        return r;
    }
    this.Description = "Esta propiedad admite valores en px."
    this.ID = 3;
}

Designer.PropertyTypes.SizeValue.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.BoolValue = function (defaultValue, cssName) {
    var _defaultValue = false;
    if (defaultValue != null) {
        _defaultValue = (defaultValue === 'true');
    }
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return _defaultValue; }

    //@Override
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<input  type=\"checkbox\" class=\"_propertyType pinput\" style=\"width:30px\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);
        if (!this.ReadOnly) {
            $editor.bind('change', function (event) {
                var $target = $(event.target);
                $target.val($target.is(':checked'));

                if (fun == null)
                    Designer.Model.ControlManager.onPropertyUpdating(event);
                else {
                    fun(event);
                }

            });

            //            $editor.bind('keydown', function (event) {
            //                if (event.keyCode == '13') {
            //                    event.preventDefault();
            //                    this.blur();
            //                }
            //            });

        }

        //relleno el combo con los valores pasados como parámetro.

        if (exp == 'true') { $editor.attr('checked', exp); }

        this.$Input = $editor;

        return $editor;
    }

    this.ReadOnly = false; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return exp; }
    this.Properties = null;
    this.ID = 4;
}

Designer.PropertyTypes.BoolValue.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.StringValue = function (defaultValue, cssName) {
    var _defaultValue = "";
    if (defaultValue != null) {
        _defaultValue = defaultValue;
    }
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return _defaultValue; }

    this.ReadOnly = false; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return exp; }
    this.Properties = null;
    this.ID = 5;
}

Designer.PropertyTypes.StringValue.prototype = new Designer.PropertyTypes.BasePropertyType();



Designer.PropertyTypes.Size = function (defaultValue) {
    var _defaultValue = null;
    if (defaultValue != null) {
        if (typeof defaultValue == 'string') {
            var arrSize = defaultValue.split(",");
            _defaultValue = new Designer.Size(parseInt(arrSize[0]), parseInt(arrSize[1]));
        } else {
            _defaultValue = defaultValue;
        }
    }
    else {
        _defaultValue = new Designer.Size(100, 150); //Designer.Size valor por defecto;
    }

    this.GetDefaultValue = function () { return new Designer.Size(100, 150); }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return this.Properties[0].PropertyType.TextToDisplay(exp.Width) + ";" + this.Properties[1].PropertyType.TextToDisplay(exp.Height); }
    /*SetValue sirve para establece el valor de editor desde fuera del editor. */
    this.SetValue = function (newValue) {

        this.$Input.val(this.TextToDisplay(newValue));
        //establezco los valoes de las propiedades secundarias
        this.Properties[0].PropertyType.SetValue(newValue.Width);
        this.Properties[1].PropertyType.SetValue(newValue.Height);
    }
    this.InitProperties = function () {
        this.Properties = new Array(
            new Designer.ControlProperty(this, "Width", new Designer.PropertyTypes.SizeValue(_defaultValue.Width), null),
            new Designer.ControlProperty(this, "Height", new Designer.PropertyTypes.SizeValue(_defaultValue.Height), null)
            ); // condensed array
    }

    this.ID = 6;
}

Designer.PropertyTypes.Size.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.Position = function (defaultValue) {

    var _defaultValue = null;
    if (defaultValue != null) {
        _defaultValue = defaultValue;
    }
    else {
        _defaultValue = new Designer.Position(0, 0); //Designer.Position valor por defecto;
    }

    this.GetDefaultValue = function () { return new Designer.Position(0, 0); }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return exp.Top + ";" + exp.Left; }
    this.InitProperties = function () {
        this.Properties = new Array(
            new Designer.ControlProperty(this, "Top", new Designer.PropertyTypes.NumericValue(_defaultValue.Top), null),
            new Designer.ControlProperty(this, "Left", new Designer.PropertyTypes.NumericValue(_defaultValue.Left), null)
            ); // condensed array
    }
    this.ID = 7;
}

Designer.PropertyTypes.Position.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.Borders = function (defaultValue) {

    var _defaultValue = null;
    if (defaultValue != null) {
        //_defaultValue = defaultValue;
    }
    else {
        _defaultValue = new Designer.Borders(); //Designer.Position valor por defecto;
    }

    this.GetDefaultValue = function () { return new Designer.Borders(); }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.InitProperties = function () {
        this.Properties = new Array(
            new Designer.ControlProperty(this, "Top", new Designer.PropertyTypes.Border(_defaultValue.Top, 'border-top'), null),
            new Designer.ControlProperty(this, "Right", new Designer.PropertyTypes.Border(_defaultValue.Right, 'border-right'), null),
            new Designer.ControlProperty(this, "Bottom", new Designer.PropertyTypes.Border(_defaultValue.Bottom, 'border-bottom'), null),
            new Designer.ControlProperty(this, "Left", new Designer.PropertyTypes.Border(_defaultValue.Left, 'border-left'), null)
            ); // condensed array
    }

    
    this.ID = 8;
}

Designer.PropertyTypes.Borders.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.Border = function (defaultValue, cssName) {
    if (defaultValue != null) {
        if (typeof defaultValue == 'string') {
            var arrdefault = defaultValue.split(" ");
            _defaultValue = new Designer.Border(parseInt(arrdefault[0]), arrdefault[1], arrdefault[2]);
        } else {
            _defaultValue = defaultValue;
        }
    }
    else {
        _defaultValue = new Designer.Border(0, 'none', '#ffffff');
    }

    this.GetDefaultValue = function () { return new Designer.Border(0, 'none', '#ffffff'); }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    this.cssStyle = null; //indica el attributo css al que hace referencia esta propiedad
    if (cssName) {
        this.cssStyle = cssName;
    }

    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return this.Properties[0].PropertyType.TextToDisplay(exp.Width) + ' ' + this.Properties[1].PropertyType.TextToDisplay(exp.Style) + ' ' + this.Properties[2].PropertyType.TextToDisplay(exp.Color); }
    this.CssStyleDisplay = function (exp) {

        if (this.cssStyle != null) {
            return this.cssStyle + ":" + this.TextToDisplay(exp) + ";";

        } else {
            return '';
        }
    }
    this.InitProperties = function () {
        this.Properties = new Array(
            new Designer.ControlProperty(this, "Width", new Designer.PropertyTypes.SizeValue(_defaultValue.Width), null),
            new Designer.ControlProperty(this, "Style", new Designer.PropertyTypes.ListValue('none', ['inset', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'ridge', 'groove', 'outset']), null, null),
            new Designer.ControlProperty(this, "Color", new Designer.PropertyTypes.ColorType(_defaultValue.Color), null)
            ); // condensed array
    }
    this.ID = 9;
}

Designer.PropertyTypes.Border.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.Paddings = function (defaultValue) {
    var _defaultValue = new Designer.Paddings(0, 0, 0, 0);
    if (defaultValue != null) {
        if (typeof defaultValue == 'string') {
            var arrdefault = defaultValue.split(",");
            _defaultValue = new Designer.Paddings(parseInt(arrdefault[0]), parseInt(arrdefault[1]), parseInt(arrdefault[2]), parseInt(arrdefault[3]));
        } else {
            //_defaultValue = defaultValue;
        }
    }


    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables


    this.GetDefaultValue = function () {
        return new Designer.Paddings(0, 0, 0, 0);
    }
    this.InitProperties = function () {
        this.Properties = new Array(
            new Designer.ControlProperty(this, "Top", new Designer.PropertyTypes.SizeValue(_defaultValue.Top, 'padding-top'), null),
            new Designer.ControlProperty(this, "Right", new Designer.PropertyTypes.SizeValue(_defaultValue.Right, 'padding-right'), null),
            new Designer.ControlProperty(this, "Bottom", new Designer.PropertyTypes.SizeValue(_defaultValue.Bottom, 'padding-bottom'), null),
            new Designer.ControlProperty(this, "Left", new Designer.PropertyTypes.SizeValue(_defaultValue.Left, 'padding-left'), null)
            );
    }
    this.ID = 10;
}
Designer.PropertyTypes.Paddings.prototype = new Designer.PropertyTypes.BasePropertyType();




Designer.PropertyTypes.ImageList = function () {

    var _defaultValue = new Array();

    this.GetDefaultValue = function () { return _defaultValue; }

    this.Count = function (valor) { return valor.length; };
    /* Devuelve el texto que se mostrara en la propiedad */
    this.TextToDisplay = function (valor) {
        var srt = null;
        if (valor != null && valor.length > 0) {

            jQuery.each(valor, function (i, c) {
                if (str == null) {
                    str = c;
                } else {
                    str += ";" + c;
                }

            });
        }
        return srt;
    }

    /* Serializa la propiedad para que pueda ser persistente en algún tipo de memoria persistente */
    this.Serializate = function (valor) {

    }

    /* DesSerializa el contenido de la variable data, en el objeto valor */
    this.Deserializate = function (data, valor) {

    }

    this.ID = 11;
}

Designer.PropertyTypes.ImageList.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.Image = function () {
    var _defaultValue = null; //TODO

    this.GetDefaultValue = function () { return _defaultValue; }
    this.TextToDisplay = function (exp) { return exp.GetValue(); }

    this.ID = 12;
}

Designer.PropertyTypes.Image.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.ArrayValue = function (baseEditor, cssName) {
    this.BaseEditor = baseEditor; //sera el property Editor que se utiliza para validar y editar los valores del array.
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return new Array(); }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) {
        var r = new String();
        if (exp != null) {
            for (var i = 0; i < exp.length; i++) {
                if (i == 0) {
                    r += this.BaseEditor.TextToDisplay(exp[i]);
                } else {
                    r += ";" + this.BaseEditor.TextToDisplay(exp[i]);
                }
            }
        }
        return r;
    }
    this.Properties = null;
    this.ID = 13; //do not change this value.

    //@Override
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<input type=\"text\" maxlength=\"550\" class=\"_propertyType pinput\" readonly=\"readonly\"  value=\"";


        if (exp != null) {
            r += this.TextToDisplay(exp);
        }

        r += "\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);

        this.$Input = $editor;

        var innerContainer = $('<table cellspacing="0" cellpadding="0" width="100%" border="0"><tr><td style="width:95%;border:0 none #ffffff;padding:0px"></td><td style="width:16px;border:0 none #ffffff;padding:0px"> </td></tr></table>');
        innerContainer.find("td:first").append($editor);
        var btt = $('<img src="images/gear.png" class="pbutton" alt="plus" vindex="' + vIndex + '" pname="' + xPath + '" peditor="' + pEditor + '"/>');

        btt.bind('click', dispFun == null ? Designer.Model.ControlManager.onPropertyShowEditor : dispFun);

        innerContainer.find("tr:first").find("td:nth-child(2)").append(btt); //en la segunda fila añado el boton

        return innerContainer;
    }

    this.Site = new Designer.UI.ArrayListEditor(baseEditor);
}

Designer.PropertyTypes.ArrayValue.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.ColorType = function (defaultValue, cssName) {
    var _defaultValue = "#000000";
    if (defaultValue != null) {
        _defaultValue = defaultValue;
    }
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return _defaultValue; }

    this.ReadOnly = false; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return exp; }
    this.Properties = null;
    this.Validate = function (exp) {
        var r = exp.match(/^#?(([a-fA-F0-9]){3}){1,2}$/);

        return r;
    }
    this.Description = "Esta propiedad sólo admite colores en formato hex."
    this.ID = 14;

    //@Override
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<input type=\"text\" maxlength=\"550\" class=\"_propertyType pinput\"  value=\"";


        if (exp != null) {
            r += this.TextToDisplay(exp);
        }

        r += "\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);
        if (!this.ReadOnly) {
            $editor.bind('focusout', fun == null ? Designer.Model.ControlManager.onPropertyUpdating : fun);

            $editor.bind('keydown', function (event) {
                if (event.keyCode == '13') {
                    event.preventDefault();
                    this.blur();
                }
            });
        }

        this.$Input = $editor;

        var innerContainer = $('<table cellspacing="0" cellpadding="0" width="100%" border="0"><tr><td style="width:95%;border:0 none #ffffff;padding:0px"></td><td style="width:16px;border:0 none #ffffff;padding:0px"> </td></tr></table>');
        innerContainer.find("td:first").append($editor);
        var btt = $('<img src="images/colors-real-32.png" class="pbutton" alt="plus" vindex="' + vIndex + '" pname="' + xPath + '" peditor="' + pEditor + '"/>');

        btt.bind('click', dispFun == null ? Designer.Model.ControlManager.onPropertyShowEditor : dispFun);

        innerContainer.find("tr:first").find("td:nth-child(2)").append(btt); //en la segunda fila añado el boton

        return innerContainer;
    }

    this.Site = new Designer.UI.ColorEditor();
}
Designer.PropertyTypes.ColorType.prototype = new Designer.PropertyTypes.BasePropertyType();
/* Modela un editor de tipo combo. Se le pasan los valores a mostrar, los valores reales. Si no se le pasan valores, se tomara como valor el texto a mostrar */
Designer.PropertyTypes.ListValue = function (defaultValue, valuesToDisplay, values, cssName) {
    var _instance = this;
    this.ValuesToDisplay = valuesToDisplay;

    var _values = values;

    var _defaultValue = "";
    if (defaultValue != null) {
        _defaultValue = defaultValue;
    }
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return _defaultValue; }

    this.ReadOnly = false; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return exp; }
    this.Properties = null;
    this.ID = 15;

    //@Override
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<select title=\"lista de valores\" class=\"_propertyType pinput\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);
        if (!this.ReadOnly) {
            $editor.bind('change', fun == null ? Designer.Model.ControlManager.onPropertyUpdating : fun);

            $editor.bind('keydown', function (event) {
                if (event.keyCode == '13') {
                    event.preventDefault();
                    this.blur();
                }
            });

        }
        if (_instance.ValuesToDisplay != null && _instance.ValuesToDisplay.length > 0) {
            //relleno el combo con los valores pasados como parámetro.
            for (var i = 0; i < _instance.ValuesToDisplay.length; i++) {
                $editor.append($('<option></option>').val(_values != null ? _values[i] : _instance.ValuesToDisplay[i]).html(_instance.ValuesToDisplay[i]));
            }
            $editor.val(exp);
        } else {
            $editor.append($('<option></option>').val('').html(''));
        }
        this.$Input = $editor;

        return $editor;
    }


}
Designer.PropertyTypes.ListValue.prototype = new Designer.PropertyTypes.BasePropertyType();


Designer.PropertyTypes.Font = function (defaultValue) {

    //    if (defaultValue != null) {
    //        if (typeof defaultValue == 'string') { //TODO analizar que pasa cuando se lee un valor en el XML
    //            var arrdefault = defaultValue.split(",");
    //            _defaultValue = new Designer.Paddings(parseInt(arrdefault[0]), parseInt(arrdefault[1]), parseInt(arrdefault[2]), parseInt(arrdefault[3]));
    //        } 
    //    }

    //font-style font-variant font-weight font-size font-family
    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return this.Properties[2].PropertyType.TextToDisplay(exp.FontStyle) + ' ' + this.Properties[3].PropertyType.TextToDisplay(exp.FontWeight) + ' ' + this.Properties[1].PropertyType.TextToDisplay(exp.FontSize) + ' ' + this.Properties[0].PropertyType.TextToDisplay(exp.FontFamily); }


    this.GetDefaultValue = function () {
        return new Designer.FontSetting("", "0", "normal");
    }
    this.InitProperties = function () {
        this.Properties = new Array(
            new Designer.ControlProperty(this, "FontFamily", new Designer.PropertyTypes.FontFamilyType("", 'font-family'), null),
            new Designer.ControlProperty(this, "FontSize", new Designer.PropertyTypes.SizeValue(0, 'font-size'), null),
            new Designer.ControlProperty(this, "FontStyle", new Designer.PropertyTypes.ListValue('normal', ['normal', 'italic', 'oblique', 'inherit'], null, 'font-style'), null),
            new Designer.ControlProperty(this, "FontWeight", new Designer.PropertyTypes.ListValue('normal', ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'inherit'], null, 'font-weight'), null)
            );
    }
    this.ID = 17;
}
Designer.PropertyTypes.Font.prototype = new Designer.PropertyTypes.BasePropertyType();


Designer.PropertyTypes.FontFamilyType = function (defaultValue, cssName) {


    this.ReadOnly = false; //indica si el editor es readOnly para las propiedades que tienen desplegables
    if (cssName) {
        this.cssStyle = cssName;
    }
    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return exp; }


    this.GetDefaultValue = function () {
        return new String();
    }
    //@Override
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<input type=\"text\"  class=\"_propertyType pinput\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);
        if (!this.ReadOnly) {
            $editor.bind('change', fun == null ? Designer.Model.ControlManager.onPropertyUpdating : fun);

        }
        $editor.val(exp);
        this.$Input = $editor;
        $editor.fontSelector();
        return $editor;
    }

    this.Properties = null;
    this.ID = 18;
}
Designer.PropertyTypes.FontFamilyType.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.UserType = function (defaultValue, cssName) {
    var _defaultValue = null;
    if (defaultValue != null) {
        _defaultValue = defaultValue;
    }
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return _defaultValue; }

    this.ReadOnly = true; //Un editor custom siempre es readOnly

    this.Properties = null;
    this.ID = 19;
}
Designer.PropertyTypes.UserType.prototype = new Designer.PropertyTypes.BasePropertyType();



Designer.PropertyTypes.RichText = function (defaultValue, cssName) {
    var _defaultValue = new String();
    if (defaultValue != null) {
        _defaultValue = defaultValue;
    }
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return _defaultValue; }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    // el texto que muestra en el editor 
    this.TextToDisplay = function (exp) {
        if (exp != null && exp != '') {
            var s = $(exp).text();


            return s != '' ? s : exp;
            // $(exp).text();
        } else { return ''; }
    }
    this.Properties = null;

    this.Description = "Esta propiedad sólo admite valores HTML."
    this.ID = 20;

    //@Override
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<input type=\"text\" maxlength=\"550\" class=\"_propertyType pinput\" readonly=\"readonly\"  value=\"";


        if (exp != null) {
            r += this.TextToDisplay(exp);
        }

        r += "\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);

        this.$Input = $editor;

        var innerContainer = $('<table cellspacing="0" cellpadding="0" width="100%" border="0"><tr><td style="width:95%;border:0 none #ffffff;padding:0px"></td><td style="width:16px;border:0 none #ffffff;padding:0px"> </td></tr></table>');
        innerContainer.find("td:first").append($editor);
        var btt = $('<img src="images/font_24.png" class="pbutton" alt="plus" vindex="' + vIndex + '" pname="' + xPath + '" peditor="' + pEditor + '"/>');

        btt.bind('click', dispFun == null ? Designer.Model.ControlManager.onPropertyShowEditor : dispFun);

        innerContainer.find("tr:first").find("td:nth-child(2)").append(btt); //en la segunda fila añado el boton

        return innerContainer;
    }

    this.Site = new Designer.UI.RichTextEditor();
}
Designer.PropertyTypes.RichText.prototype = new Designer.PropertyTypes.BasePropertyType();


Designer.PropertyTypes.DataSourceType = function (defaultValue, cssName) {
    var _internal = null;
    if (defaultValue != null) {
        if (typeof defaultValue == 'string' || defaultValue.jquery) {
            var arrdefault = defaultValue.jquery ? defaultValue.text().split(";") : defaultValue.split(";");
            _internal = { Source: arrdefault.length > 0 ? arrdefault[0] : "", Member: arrdefault.length > 1 ? arrdefault[1] : "", Target: arrdefault.length > 2 ? arrdefault[2] : "", AllowedTypes: arrdefault.length > 3 ? arrdefault[3] : "" };
        } else {
            _internal = { Source: "", Member: "", Target: "", AllowedTypes: "" };
        }
    }
    else {
        _defaultValue = { Source: "", Member: "", Target: "", AllowedTypes: "" };
    }

    this.GetDefaultValue = function () {
        return { Source: _internal.Source, Member: _internal.Member, Target: _internal.Target, AllowedTypes: _internal.AllowedTypes };
    }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    this.cssStyle = null; //indica el attributo css al que hace referencia esta propiedad
    /* Determina si esta propiedad puede ser establecida o leída cuando hay varios controles seleccionados.  */
    this.AllowMultiSelect = false; //no se puede gestionar con varios controles seleccionados  a la vez.

    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return this.Properties[1].PropertyType.TextToDisplay(exp.Width); }
    var listaDataSources = new Designer.PropertyTypes.ListValue('', Designer.Model.ControlManager.GetAvariableSources('dataSource'));
    listaDataSources.IsValidSource = true;
    listaDataSources.UpdateValues = function () {
        listaDataSources.ValuesToDisplay = Designer.Model.ControlManager.GetAvariableSources('dataSource');

    };
    this.InitProperties = function () {
        var sourceProperty = new Designer.ControlProperty(this, "Source", listaDataSources, null, { onBeforeRender: listaDataSources.UpdateValues });
        sourceProperty.onChange = Designer.Model.ControlManager.SetIDDependency; //TODO que cuando cambie, borre el Member.
        //Propiedad que se linka al origen de datos.
        var targetProperty = new Designer.ControlProperty(this, "Target", new Designer.PropertyTypes.StringValue(), null, null);
        targetProperty.Visible = false;
        //Tipo de nodo que es posible linkar
        var allowedTypesProperty = new Designer.ControlProperty(this, "AllowedTypes", new Designer.PropertyTypes.StringValue(), null, null);
        allowedTypesProperty.Visible = false;
        //Miembro del origen de datos que se linka
        var memberProperty = new Designer.ControlProperty(this, "Member", new Designer.PropertyTypes.DataMemberType(), null, null)
        memberProperty.onChange = function (sender, args) {
            if (args.propValue.Member != '') {
                var Arr_dataSource = Designer.Model.ControlManager.getControls(function (c) { return c.ID == args.propValue.Source; });
                if (Arr_dataSource == null || Arr_dataSource.length == 0 || Arr_dataSource.length > 1) {
                    Designer.Model.EventManager.HandleMessage(("Error, no se encontró el control {0} origen de datos para poder establecer el relleno de muestra para la propiedad {1}.").format(args.propValue.Source, args.propValue.Target), null, Enum.MessageType.Error);
                    args.cancel = true;
                    return false;
                }
                var dataSourceControl = Arr_dataSource[0];
                if (dataSourceControl.Cache == null) {
                    Designer.Model.EventManager.HandleMessage(("Error, el control {0} no está inicializado correctamente.").format(args.propValue.Source), null, Enum.MessageType.Error);
                    args.cancel = true;
                    return false;
                }

                var elementType = dataSourceControl.Cache[0].FindType(args.propValue.Member);
                if (elementType == null) {
                    Designer.Model.EventManager.HandleMessage(("Error, no se encontró el tipo de nodo para el xPath {0}.").format(args.propValue.Member), null, Enum.MessageType.Error);
                    args.cancel = true;
                    return false;
                } else {
                    var allow = true;
                    //comprobación allowedTypes tipos permitidos.
                    if (args.propValue.AllowedTypes && args.propValue.AllowedTypes != '') {
                        if (args.propValue.AllowedTypes.indexOf('Collection') >= 0) {
                            if (!elementType.IsCollection) {
                                allow = false;
                            }
                        }
                        if (args.propValue.AllowedTypes.indexOf('ComplexType') >= 0) {
                            if (!elementType.Type.IsComlexType) {
                                allow = false;
                            } else {
                                allow = true;
                            }
                        }
                    }
                    if (!allow) {
                        Designer.Model.EventManager.HandleMessage(("Error, el nodo seleccionado no es válido. Sólo se permiten nodos de tipo: {0}.").format(args.propValue.AllowedTypes), null, Enum.MessageType.Error);
                        args.cancel = true;
                        return false;
                    }

                }

                if (args.propValue.Target != null && args.propValue.Target != '') {
                    sender.SetPropertyValue(args.propValue.Target, args.propValue.Target, elementType.Type.SampleValue, null);
                }

            }

        };


        //function (propName, member, memberValue, context)
        this.Properties = new Array(
            sourceProperty
            , memberProperty
            , targetProperty//
            , allowedTypesProperty
            ); // condensed array
    }



    /*Override. Devuelve la propiedad source porque la propiedad source contiene la referencia al origen de datos. */
    this.GetValidSource = function () { return this.Properties[0]; };

    this.ID = 21;
}
Designer.PropertyTypes.DataSourceType.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.DataMemberType = function (defaultValue, cssName) {
    var _defaultValue = new String();
    if (defaultValue != null) {
        _defaultValue = defaultValue;
    }
    this.cssStyle = null;
    if (cssName) {
        this.cssStyle = cssName;
    }
    this.GetDefaultValue = function () { return _defaultValue; }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    // el texto que muestra en el editor 
    this.TextToDisplay = function (exp) {
        if (exp != null && exp != '') {
            var s = $(exp).text();


            return s != '' ? s : exp;
            // $(exp).text();
        } else { return ''; }
    }
    this.Properties = null;

    this.Description = "Esta propiedad sólo admite valores HTML."
    this.ID = 22;

    //@Override Tiene que mostrar el arbol que genera el XSD
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<input type=\"text\" maxlength=\"550\" class=\"_propertyType pinput\" readonly=\"readonly\"  value=\"";


        if (exp != null) {
            r += this.TextToDisplay(exp);
        }

        r += "\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);

        this.$Input = $editor;

        var innerContainer = $('<table cellspacing="0" cellpadding="0" width="100%" border="0"><tr><td style="width:95%;border:0 none #ffffff;padding:0px"></td><td style="width:16px;border:0 none #ffffff;padding:0px"> </td></tr></table>');
        innerContainer.find("td:first").append($editor);
        var btt = $('<img src="images/selection2_24.png" class="pbutton" alt="plus" vindex="' + vIndex + '" pname="' + xPath + '" peditor="' + pEditor + '"/>');

        btt.bind('click', dispFun == null ? Designer.Model.ControlManager.onPropertyShowEditor : dispFun);

        innerContainer.find("tr:first").find("td:nth-child(2)").append(btt); //en la segunda fila añado el boton

        return innerContainer;
    }

    this.Site = new Designer.UI.DataMemeberTreeEditor(this);
}
Designer.PropertyTypes.DataMemberType.prototype = new Designer.PropertyTypes.BasePropertyType();


Designer.PropertyTypes.FileSourceValue = function (defaultValue) {



    if (defaultValue != null) {
        if (defaultValue.jquery) {
            _defaultValue = new Designer.Resource('', defaultValue.text());
        }
        else if (typeof defaultValue == 'string') {
            var arrdefault = defaultValue.split(";");
            if (arrdefault.length > 1) {
                _defaultValue = new Designer.Resource(arrdefault[0], arrdefault[1]);
            } else {
                _defaultValue = new Designer.Resource('', arrdefault[0]);
            }
        } else {
            _defaultValue = defaultValue;
        }
    }
    else {
        throw "Error en la inicialización de la propiedad tipo Designer.PropertyTypes.FileSourceValue";
    }
    var _resourceType = _defaultValue.ResourceType;


    this.GetDefaultValue = function () {
        return new Designer.Resource('', _resourceType);
    }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    this.cssStyle = null; //indica el attributo css al que hace referencia esta propiedad


    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return exp.ResourceURL; }

    //@Override
    this.GetEditorToDisplay = function (exp, vIndex, xPath, pEditor, fun, dispFun) {
        var r = new String();

        r += "<input type=\"text\" maxlength=\"550\" class=\"_propertyType pinput\" readonly=\"readonly\"  value=\"";


        if (exp != null) {
            r += this.TextToDisplay(exp);
        }

        r += "\" vindex=\"" + vIndex + "\" pname=\"" + xPath + "\" peditor=\"" + pEditor + "\"/>";

        var $editor = $(r);

        this.$Input = $editor;

        var innerContainer = $('<table cellspacing="0" cellpadding="0" width="100%" border="0"><tr><td style="width:95%;border:0 none #ffffff;padding:0px"></td><td style="width:16px;border:0 none #ffffff;padding:0px"> </td></tr></table>');
        innerContainer.find("td:first").append($editor);
        var btt = $('<img src="images/folder_network_24.png" class="pbutton" alt="plus" vindex="' + vIndex + '" pname="' + xPath + '" peditor="' + pEditor + '"/>');

        btt.bind('click', dispFun == null ? Designer.Model.ControlManager.onPropertyShowEditor : dispFun);

        innerContainer.find("tr:first").find("td:nth-child(2)").append(btt); //en la segunda fila añado el boton

        return innerContainer;
    }

    this.Site = new Designer.UI.FileChooser();

    this.Properties = null;

    this.ID = 23;
}
Designer.PropertyTypes.FileSourceValue.prototype = new Designer.PropertyTypes.BasePropertyType();

Designer.PropertyTypes.ControlSourceType = function (defaultValue, cssName) {
    var _internal = null;
    if (defaultValue != null) {
        if (typeof defaultValue == 'string' || defaultValue.jquery) {
            var arrdefault = defaultValue.jquery ? defaultValue.text().split(";") : defaultValue.split(";");
            _internal = { Source: arrdefault.length > 0 ? arrdefault[0] : ""};
        } else {
            _internal = { Source: ""};
        }
    }
    else {
        _defaultValue = { Source: ""};
    }

    this.GetDefaultValue = function () {
        return { Source: _internal.Source };
    }

    this.ReadOnly = true; //indica si el editor es readOnly para las propiedades que tienen desplegables
    this.cssStyle = null; //indica el attributo css al que hace referencia esta propiedad
    /* Determina si esta propiedad puede ser establecida o leída cuando hay varios controles seleccionados.  */
    this.AllowMultiSelect = false; //no se puede gestionar con varios controles seleccionados  a la vez.

    /* el texto que muestra en el editor */
    this.TextToDisplay = function (exp) { return this.Properties[1].PropertyType.TextToDisplay(exp.Width); }
    var listaDataSources = new Designer.PropertyTypes.ListValue('', Designer.Model.ControlManager.GetAvariableSources('jquery'));
    listaDataSources.IsValidSource = true;
    listaDataSources.UpdateValues = function () {
        listaDataSources.ValuesToDisplay = Designer.Model.ControlManager.GetAvariableSources('jquery');
    };
    this.InitProperties = function () {
        var sourceProperty = new Designer.ControlProperty(this, "Source", listaDataSources, null, { onBeforeRender: listaDataSources.UpdateValues });
        sourceProperty.onChange = Designer.Model.ControlManager.SetIDDependency; //TODO que cuando cambie, borre el Member.
        //Propiedad que se linka al origen de datos.
        var targetProperty = new Designer.ControlProperty(this, "Target", new Designer.PropertyTypes.StringValue(), null, null);
        targetProperty.Visible = false;
        //Tipo de nodo que es posible linkar
        var allowedTypesProperty = new Designer.ControlProperty(this, "AllowedTypes", new Designer.PropertyTypes.StringValue(), null, null);
        allowedTypesProperty.Visible = false;
        //Miembro del origen de datos que se linka
        var memberProperty = new Designer.ControlProperty(this, "Member", new Designer.PropertyTypes.DataMemberType(), null, null)
        memberProperty.onChange = function (sender, args) {
            if (args.propValue.Member != '') {
                var Arr_dataSource = Designer.Model.ControlManager.getControls(function (c) { return c.ID == args.propValue.Source; });
                if (Arr_dataSource == null || Arr_dataSource.length == 0 || Arr_dataSource.length > 1) {
                    Designer.Model.EventManager.HandleMessage(("Error, no se encontró el control {0} origen de datos para poder establecer el relleno de muestra para la propiedad {1}.").format(args.propValue.Source, args.propValue.Target), null, Enum.MessageType.Error);
                    args.cancel = true;
                    return false;
                }
                var dataSourceControl = Arr_dataSource[0];
                if (dataSourceControl.Cache == null) {
                    Designer.Model.EventManager.HandleMessage(("Error, el control {0} no está inicializado correctamente.").format(args.propValue.Source), null, Enum.MessageType.Error);
                    args.cancel = true;
                    return false;
                }

                var elementType = dataSourceControl.Cache[0].FindType(args.propValue.Member);
                if (elementType == null) {
                    Designer.Model.EventManager.HandleMessage(("Error, no se encontró el tipo de nodo para el xPath {0}.").format(args.propValue.Member), null, Enum.MessageType.Error);
                    args.cancel = true;
                    return false;
                } else {
                    var allow = true;
                    //comprobación allowedTypes tipos permitidos.
                    if (args.propValue.AllowedTypes && args.propValue.AllowedTypes != '') {
                        if (args.propValue.AllowedTypes.indexOf('Collection') >= 0) {
                            if (!elementType.IsCollection) {
                                allow = false;
                            }
                        }
                        if (args.propValue.AllowedTypes.indexOf('ComplexType') >= 0) {
                            if (!elementType.Type.IsComlexType) {
                                allow = false;
                            } else {
                                allow = true;
                            }
                        }
                    }
                    if (!allow) {
                        Designer.Model.EventManager.HandleMessage(("Error, el nodo seleccionado no es válido. Sólo se permiten nodos de tipo: {0}.").format(args.propValue.AllowedTypes), null, Enum.MessageType.Error);
                        args.cancel = true;
                        return false;
                    }

                }

                if (args.propValue.Target != null && args.propValue.Target != '') {
                    sender.SetPropertyValue(args.propValue.Target, args.propValue.Target, elementType.Type.SampleValue, null);
                }

            }

        };


        //function (propName, member, memberValue, context)
        this.Properties = new Array(
            sourceProperty
            , memberProperty
            , targetProperty//
            , allowedTypesProperty
            ); // condensed array
    }



    /*Override. Devuelve la propiedad source porque la propiedad source contiene la referencia al origen de datos. */
    this.GetValidSource = function () { return this.Properties[0]; };

    this.ID = 21;
}
Designer.PropertyTypes.ControlSourceType.prototype = new Designer.PropertyTypes.BasePropertyType();