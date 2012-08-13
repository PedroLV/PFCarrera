
/* Depends:
*	Control.js
*   jQuery JavaScript Library v1.6.2
*   Editor
*/
Designer.PropertyNodes.Category = function (name) {

    var node = "<div class=\"prop-box\"><div class=\"spacio us-expandable us-expanded\"></div><div class=\"category\">" + name + "</div></div>";
    var _properties = new Array();
    this.AddProperty = function (controlProperty, value, vindex) {
        _properties.push(new Designer.PropertyNodes.Property(controlProperty, value, 0, vindex));
    }


    this.Render = function (propiedades, fun, dispFun) {
        var categoria = $(node);

        var propsContainer = $("<div class=\"fullwidth _visible\"> </div>");

        jQuery.each(_properties, function (i, prop) {
            
                propsContainer.append(prop.Render(propsContainer, fun, dispFun));
            
        });

        propiedades.append(categoria);
        propiedades.append(propsContainer);


    }
    /*devuelve la lista de propiedades de esta categoría */
    this.GetProperties = function () {
        var r = new Array();
        for (var i = 0; i < _properties.length; i++) {
            var p = _properties[i].GetControlProperty();
            if (p.Visible) {
                r.push(p);
            }
        }
        return r;
    }

    this.Size = function () {
        return _properties.length;
    }

}

/* 
    prop: propiedad que se está representando
    value: valor que muestra en el editor de la propiedad
    lelvel: nivel de profundidad.
    vindex: Es el índice de la propiedad dentro del array del propiedades del descriptor del control
    xpath: es el path de la propiedad desde la propiedad padre.
    peditor: Es el indice de la propiedad desde la raiz siguiendo el xpath.
*/
Designer.PropertyNodes.Property = function (prop, value, level, vindex, xpath, peditor) {
    var _property = prop;
    var _level = 0;
    var _xpath = _property.Name;
    if (xpath != null) {
        _xpath = xpath;
    }
    var _vindex = vindex;
    var _pEditor = vindex;
    if (peditor != null) {
        _pEditor = peditor;
    }
    if (level != null) {
        _level = level;
    }
    var _value = value;

    var node = "<div class=\"prop-box\">";

    if (_property.PropertyType.Properties != null && _property.PropertyType.Properties.length > 0) {
        node += "<div class=\"spacio us-expandable us-collapsed\">";
    } else {
        node += "<div class=\"spacio\">";
    }

    node += "</div><table cellpadding=\"0\" cellspacing=\"0\"  class=\"table_property\" ><tr>";

    if (_level > 0) {
        var padding = 14 * _level;
        node += "<td style=\"width:50%;padding-left:" + padding + "px\">";
    } else {

        node += "<td style=\"width:50%\">";
    }

    node += _property.Name + "</td><td class=\"tdInput\" style=\"width:50%\">";

    //    var editorStr = "";
    //    if (_property.PropertyType.ReadOnly) {
    //        editorStr += "<input type=\"text\"  maxlength=\"550\" class=\"pinput\" readonly=\"readonly\" value=\"";
    //    } else {
    //        editorStr += "<input type=\"text\" maxlength=\"550\" class=\"pinput\"  value=\"";
    //    }
    //    if (value != null) {
    //        editorStr += _property.PropertyType.TextToDisplay(value);
    //    } 

    //    editorStr += "\" vindex=\"" + _vindex + "\" pname=\"" + _xpath + "\" peditor=\"" + _pEditor + "\"/>"; //vindex y pname son el indice que contiene el valor de la propiedad y el miembro dentro de la propiedad que contiene el valor empezando por el padre.

    //var $editor = $(editorStr);
    //    if (!_property.PropertyType.ReadOnly) {
    //        $editor.bind('focusout', Designer.Model.ControlManager.onPropertyUpdating);

    //        $editor.bind('keydown', function (event) {
    //            if (event.keyCode == '13') {
    //                event.preventDefault();
    //                this.blur();
    //            }
    //        });
    //    }
    //    _property.PropertyType.$Input = $editor;


    node += "</td></tr></table>";



    /* Renderiza la propiedad con su editor asociado. Fun y dispFun son las funciones que capturan las acciones de introducir valor  y mostrar editor si lo hubiera.*/
    this.Render = function (propsContainer, fun, dispFun) {

        var $elemento = $(node);

        var $editor = _property.PropertyType.GetEditorToDisplay(_value, _vindex, _xpath, _pEditor, fun, dispFun);

        $elemento.find(".tdInput:first").append($editor);


        propsContainer.append($elemento);
        if (_property.PropertyType.Properties != null && _property.PropertyType.Properties.length > 0) {
            var innerContainer = $("<div class=\"prop-box _noVisible\"></div>");


            jQuery.each(_property.PropertyType.Properties, function (i, sub_prop) {
                //render de las propiedades internas. OJO el nombre tiene que coincidir con el nombre de la propiedad que expresa el valor.
                var inneProp = new Designer.PropertyNodes.Property(sub_prop, _value != null ? _value[sub_prop.Name] : null, _level + 1, _vindex, _xpath + "." + sub_prop.Name, _pEditor + "#" + i);
                if (sub_prop.Visible) {
                    inneProp.Render(innerContainer, fun, dispFun);
                }
            });

            propsContainer.append(innerContainer);
        }
    }

    this.GetControlProperty = function () {
        return _property;
    }


}