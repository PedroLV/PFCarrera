/* Depends:
*	Namespaces.js
*   TemplateInfo.js
*   Designer.js
* fontselector.js
* colorpicker.js
* Designer.PropertyTypes*
*/
//
//
//     Initializes a new instance of the System.Windows.Forms.Control class as a
//     child control, with specific text, size, and location.
//
// Parameters:
//   ParentControl:
//     The Control to be the parent of the control.
//
//   text:
//     The text displayed by the control.
//
//   left:
//     The System.Drawing.Point.X position of the control, in pixels, from the left
//     edge of the control's container. The value is assigned to the System.Windows.Forms.Control.Left
//     property.
//
//   top:
//     The System.Drawing.Point.Y position of the control, in pixels, from the top
//     edge of the control's container. The value is assigned to the System.Windows.Forms.Control.Top
//     property.
//
//   width:
//     The width of the control, in pixels. The value is assigned to the System.Windows.Forms.Control.Width
//     property.
//
//   height:
//     The height of the control, in pixels. The value is assigned to the System.Windows.Forms.Control.Height
//     property.

Designer.Control = function (descriptor) {

    var currentOffsetWidth = 0; //es la diferencia entre el tamaño deseado y el tamaño real debido a los bordes, padding etc
    var currentOffsetHeight = 0; //es la diferencia entre el tamaño deseado y el tamaño real debido a los bordes, padding etc
    var _instance = this;

    /*Contiene la lista de controles hijos de este control. Lógicamente sólo los controles de tipo contenedor podrán tener lista de controles.*/
    var _controls = new Collection.HashMap();

    var _dependencyID = new Array();

    /*el tamaño por defecto  del control en el diseñador. */
    this.ClientSize = null;

    /* es la posición Absoluta del control*/
    this.Position = null;

    /* es la posición relativa del control con respecto a su contenedor*/
    //this.Relative = null;
    /*Es el contenedor padre. El Designer.Model.Grid es el contendor por defecto.*/
    this.ParentControl = null;

    /* El id del control una vez está en pantalla */
    this.ID = "undefined";

    /*es el id interno que se usa para controlar el control en el interface.*/
    this.uiID = -1;

    /*es un flag para el diseñador. Indica que lo que se está mostrando en pántalla es válido y no hay que volver a redibujar el contenido..*/
    this.IsValid = false;

    /*Descriptor del control. Contiene toda la información sobre el control y sus propiedades*/
    if (descriptor != null) {
        this.ControlDescriptor = descriptor;
    }

    /*Almacena los valores para las propiedades*/
    this.ProperyValues = new Array();

    /*Devuelve un array con los controles hijos de este control.*/
    this.GetChildControls = function () {
        var controles = new Array();
        for (var i = 0; i++ < _controls.size; _controls.next()) {
            controles.push(_controls.value());
        }

        return controles;

    };

    /* el elemento en pantalla */
    this.$element = null;

    /* inicialización del elemento en pantalla. Ejecuta un script personalizado en caso de que el control lo requiera. */
    this.onInit = function ($control) { }

    /* inicialización del elemento en pantalla. Ejecuta un script personalizado en caso de que el control lo requiera. */
    this.Initializate = function (initValues) {
        if (this.$element != null) {
            //el tamaño me lo da el elemento inicial.


            if (initValues == null) {
                if (this.ControlDescriptor.ClientSize == null) {
                    var content = this.ControlDescriptor.GetContent(this.$element);
                    if (content != null) {
                        this.ClientSize = new Designer.Size(content.width(), content.height());
                    }
                } else {
                    this.ClientSize = new Designer.Size(this.ControlDescriptor.ClientSize.Width, this.ControlDescriptor.ClientSize.Height);
                }

                this.SetSize(this.ClientSize.Width, this.ClientSize.Height);
                this.Refresh(Enum.Events.Resize);
                this.Position = new Designer.Position(this.$element.position().top, this.$element.position().left);
            } else {
                this.ClientSize = new Designer.Size(initValues.ClientSize.Width, initValues.ClientSize.Height);
                this.SetSize(this.ClientSize.Width, this.ClientSize.Height);
                this.Refresh(Enum.Events.Resize);
                this.Position = new Designer.Position(initValues.Position.Top, initValues.Position.Left);
            }

            //            if (this.ControlDescriptor.Settings.ResizeContainer) {
            //                this.$element.css({ "width": this.ClientSize.Width + "px", "height": this.ClientSize.Height + "px" });
            //            }

        }

    }

    /*Refresca el tamaño del contenido para que siempre tenga un aspecto coherente en el diseñador*/
    function RefreshContentSize() {
        if (_instance.ControlDescriptor.Settings.ResizeContent) {
            //TODO 11/10/2011 calcular el exceso de tamaño debido al borde o paddings. Cuando se establece un tamaño, hay que descontar el borde. Ver innewidth y outerWidth
            //var content = $(this.$element.children()[0]);
            try {
                var content = _instance.ControlDescriptor.GetContent(_instance.$element);
                var tmpInnerWidth = _instance.ClientSize.GetWidthValue();
                var tmpInnerHeight = _instance.ClientSize.GetHeightValue();
                if (content.innerWidth() < content.outerWidth() || content.innerHeight() < content.outerHeight()) {
                    tmpInnerWidth = _instance.ClientSize.GetWidthValue() - (content.outerWidth() - content.innerWidth());
                    tmpInnerHeight = _instance.ClientSize.GetHeightValue() - (content.outerHeight() - content.innerHeight());
                }
                content.css({ "width": tmpInnerWidth + "px", "height": tmpInnerHeight + "px" });
            } catch (ex) {
                Designer.Model.EventManager.HandleMessage(("Ocurrió un error en la acción [RefreshContentSize], error: \"{0}\".").format(ex.Description), ex, Enum.MessageType.Error);
            }
        }
    }

    /**
    * Añade un control a la colección de hijos de este control
    * 
    * @param {Control} childControl Control que se añadirá a la colección interna de controles.
    * @param {Boolean} addElement Flag que controla si ademas de añadir el control a la colección, hay que configurar
    * @returns {String} Date String.
    */
    this.AddControl = function (childControl, addElement) {
        if (this.ControlDescriptor.Settings.IsContainer == true) {
            _controls.put(childControl.uiID, childControl); //añado el control recien creado 
            if (addElement == true) {
                if (this.ControlDescriptor.Settings.PositionMode == Enum.PositionMode.FlowLayout) {
                    childControl.$element.detach();

                    childControl.$element.css({ "position": "static", "float": "left", "top": "", "left": "", "z-index:": this.GetZIndex() });
                    this.GetFlowPanel().append(childControl.$element);

                }
            }
        } else {
            Designer.Model.EventManager.HandleMessage(("El control {0} no soporta la adición de controles internos ({1}).").format(this.ID, childControl.ID), null, Enum.MessageType.Error);
        }
    }


    /**
    * Añade un control a la colección de hijos de este controlEstablece una dependencia, de tal forma que si este control cambia el ID, debe cambiar también el valor de la propiedad en el control pasado como parametro vía uiID
    * 
    * @param {Integer} uiID_dependency uiID del control que se desea establece la dependencia.
    * @param {String} propName propiedad con la que se establece la dependencia.
    * @returns false
    */
    this.SetDependency = function (uiID_dependency, propName) {
        _dependencyID.push({ uiID: uiID_dependency, target: propName });
    }
    this.RemoveDependency = function (uiID_dependency, propName) {

        _dependencyID = jQuery.grep(_dependencyID, function (dependecy) { return !(dependecy.uiID == uiID_dependency && dependecy.target == propName); });


    }

    this.GetDependencyList = function () {
        return _dependencyID;
    }

    this.GetFlowPanel = function () {

        var panel = this.$element;

        var fpanel = panel.find("._flowLayout");
        if (fpanel.length > 0) {
            panel = $(fpanel[0]);
        }

        return panel;
    }

    this.RemoveControl = function (child) {
        var tmpuid = -10;
        try {
            if (typeof child == "string" || typeof child == "number") {
                tmpuid = child

            } else {
                tmpuid = child.uiID; //elimino el control de la lista de controles.
            }
            _controls.remove(tmpuid); //elimino el control de la lista de controles.
        } catch (ex) {
            Designer.Model.EventManager.HandleMessage(("Error eliminando el control hijo {0} de la colección de {1}.").format(tmpuid, _instance.ID), ex, Enum.MessageType.Error);
        }
    }

    this.ClearControls = function () {
        _controls.removeAll();
    }

    //esta función refreshca el tamaño del contenedor, es decir, el elemento del diseñador que contiene el contenido que se esta diseñando.
    function RefreshContainerSize() {

        if (_instance.ControlDescriptor.Settings.ResizeContainer) {
            var content = _instance.ControlDescriptor.GetContent(_instance.$element);
            _instance.$element.css({ "width": content.outerWidth() + "px", "height": content.outerHeight() + "px" });
        }
    }

    /*Actualiza la propiedad css pasada como parámetro en el diseñador*/
    this.UpdateCss = function (property, value, target) {

        if (property.PropertyType.cssStyle == null && property.PropertyType.Properties != null && property.PropertyType.Properties.length > 0) {
            for (var i = 0; i < property.PropertyType.Properties.length; i++) {
                var subProp = property.PropertyType.Properties[i];
                //if (subProp.PropertyType.cssStyle != null) {
                if (subProp.PropertyType.HasCss()) {
                    _instance.UpdateCss(subProp, value[subProp.Name], property.PropertyType.RenderTarget != null ? property.PropertyType.RenderTarget : target);
                }
            }
        } else {
            var cssStr = property.PropertyType.CssStyleDisplay(value);

            setCss(cssStr, property.PropertyType.RenderTarget != null ? property.PropertyType.RenderTarget : target);
        }






    }
    function setCss(cssStr, target) {
        //este css puede ser uno solo, o bien puede contener varios valores. Por ese motivo para usar jquery tengo que procesar la cadena.
        var content = _instance.ControlDescriptor.GetContent(_instance.$element, target);
        if (content != null) {
            var arrKeys = cssStr.split(';'); //


            for (var i = 0; i < arrKeys.length; i++) {
                var cssValue = arrKeys[i];
                if (cssValue != null && cssValue != '' && cssValue != ' ') {
                    var arrValues = cssValue.split(':');

                    content.css(arrValues[0], arrValues[1]);

                }

            }
        }

    }

    /*Refresca la pantalla con el contenido de las propiedades del control */
    this.Refresh = function (evt) {
        if (evt == null || evt == Enum.Events.Resize) {
            /*  */
            //TODO estoy esta mal pensado.
            _instance.$element.css({ "width": _instance.ClientSize.Width, "height": _instance.ClientSize.Height });
            RefreshContentSize();
            RefreshContainerSize();
        }
        else if (evt == null || evt == Enum.Events.Move) {
            /* muevo el control */
            _instance.$element.css({ "position": "absolute", "top": (_instance.Position.Top) + "px", "left": (_instance.Position.Left) + "px" });
        }

    }

    /*Devuelve los limites del control maximo y minimo. Devuelve un objeto de tipo Designer.Bounds*/
    this.GetBounds = function () {

        return new Designer.Bounds(this.Position, this.ClientSize);

    }
    /*Devuelve los limites del contenedor. Por defecto los limites del control y los del contenedor coinciden.*/
    this.GetContainerBounds = function () {

        return new Designer.Bounds(this.Position, this.ClientSize);

    }

    /*Establece la posición de este control teniendo en cuenta los límites del contenedor que lo contiene.*/
    this.SetPosition = function (top, left, setvalue) {
        //var boundaries = this.GetBounds(); //1º Obtengo los limites mi control
        //var boundaries = new Designer.Bounds(this.ParentControl.Position, this.ParentControl.ClientSize);
        var parent_boundaries = this.ParentControl.GetContainerBounds();

        var my_boundaries = this.GetBounds();

        if (!parent_boundaries.OutOfYBounds(my_boundaries)) {
            this.Position.Top = top;
        } else {
            if (my_boundaries.Top <= parent_boundaries.Top) {
                //se pasa por arriba
                this.Position.Top = parent_boundaries.Top + 1;
            } else {
                this.Position.Top = parent_boundaries.Bottom - this.ClientSize.Height - 1;
            }
        }

        if (!parent_boundaries.OutOfXBounds(my_boundaries)) {
            this.Position.Left = left;
        }
        else {
            if (my_boundaries.Left <= parent_boundaries.Left) {
                //se pasa por arriba
                this.Position.Left = parent_boundaries.Left + 1;
            } else {
                this.Position.Left = parseInt(parent_boundaries.Right) - this.ClientSize.Width - 1;
            }
        }
        if (setvalue) {

        }
    }

    this.SetSize = function (width, height) {


        this.ClientSize.Width = width;
        this.ClientSize.Height = height;

        //TODO comprobar si excede los límites del contenedor.
        if (this.ParentControl != null) {
            var my_boundaries = this.GetBounds();
            var parent_boundaries = this.ParentControl.GetContainerBounds();

            if (!parent_boundaries.OutOfYBounds(my_boundaries)) {

            } else {
                Designer.Model.EventManager.HandleMessage(("El valor {0} de alto del control sobrepasa el tamaño del control que lo contiene").format(height), null, Enum.MessageType.Warning);
            }
            if (!parent_boundaries.OutOfXBounds(my_boundaries)) {

            }
            else {
                Designer.Model.EventManager.HandleMessage(("El valor {0} de ancho del control sobrepasa el tamaño del control que lo contiene").format(width), null, Enum.MessageType.Warning);
            }
        }

    }

    /*Establece la posición de este control teniendo en cuenta los límites del contenedor que lo contiene.*/
    this.GetZIndex = function () {
        //var boundaries = this.GetBounds(); //1º Obtengo los limites mi control
        //var boundaries = new Designer.Bounds(this.ParentControl.Position, this.ParentControl.ClientSize);
        var z = this.$element.css('z-index');
        if (z == 'auto' || z == null) {
            return 0;
        } else {
            return parseInt(z);
        }


    }
    /*Devuelve true o false, si la cadena de padres de este control,contiene el uiID pasado como parametro, o a alguno de los controles del array "candidatos" pasado como parametro.*/
    this.HasParent = function (uiID, candidatos) {
        if (this.ParentControl.uiID == uiID) {
            return true;
        } else {
            if (candidatos != null) {
                jQuery.each(candidatos, function (i, c) {
                    if (_instance.ParentControl.uiID == c.uiID) {
                        return true;
                    }
                });
            }
        }

        return this.ParentControl.HasParent(uiID, candidatos);
    }



    /*Guarda las propiedades del este objeto en un texto JSON*/
    this.toJSONString = function () {

        //return JSON.stringify(this, null, '\t');
        //PROPIEDADES BASICAS
        var objStr = ('"ControlDescriptor": "{0}", "ID": "{1}", "currentZ": "{2}", "ClientSize": { "Width": {3}, "Height": {4} },"Position": { "Left": {5}, "Top": {6} }, "ParentuiID":"{7}", "uiID": "{8}"').format(this.ControlDescriptor.Name, this.ID, this.GetZIndex(), this.ClientSize.Width, this.ClientSize.Height, this.Position.Left, this.Position.Top, this.ParentControl.uiID, this.uiID);

        //PROPIEDADES DEFINIDAS POR EL USUARIO
        if (this.ControlDescriptor.Properties != null && this.ControlDescriptor.Properties.length > 0) {


            jQuery.each(this.ControlDescriptor.Properties, function (i, prop) {
                objStr += (',"{0}": {1}').format(prop.Name, JSON.stringify(_instance.ProperyValues[i], null, '\t'));
            });
        }
        return '{' + objStr + '}';
    }

    /*Devuelve el valor para la propiedad pasada como parámetro
    * propName Nombre de la propiedad que cuelga de la lista de propiedades.
    * member Nombre completo de la propiedad.
    * Ejemplo: para obtener DataSource.Member admite las siguientes llamadas
    * GetPropertyValue('DataSource', 'DataSource.Member')
    * GetPropertyValue('DataSource.Member')
    */
    this.GetPropertyValue = function (propName, member) {
        var currentValue = null;
        var root = propName;
        var accesor = member;
        if (propName != null && propName.indexOf('.') > 0) {
            root = propName.split('.')[0];
            accesor = propName;
        }
        if (root == "ID") {
            currentValue = this.ID;
        }
        else if (root == "Size") {
            currentValue = this.ClientSize;
        }
        else if (root == "Position") {
            currentValue = this.Position;
        }
        else if (root == "Parent") {
            currentValue = this.ParentControl;
        } else {
            for (var i = 0; i < this.ControlDescriptor.Properties.length; i++) {
                if (root == this.ControlDescriptor.Properties[i].Name) {
                    currentValue = this.ProperyValues[i];
                    break;
                }
            }
        }
        if (accesor != null && accesor.indexOf('.') > 0) {
            var arrPropName = accesor.split('.'); //obtenemos el array 
            for (var z = 1; z < arrPropName.length; z++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
                currentValue = currentValue[arrPropName[z]];
            }
        }

        return currentValue;
    }
    //Establece un valor a una propiedad desde el menu de propiedades.
    this.SetPropertyValue = function (propName, member, memberValue, context) {
        var property = this.GetProperty(propName);
        var rootValue = this.GetPropertyValue(propName);
        var currentValue = null;
        if (member != null && member.indexOf('.') > 0) {

            var arrPropName = member.split('.'); //obtenemos el array 
            var tmp = rootValue;
            for (var i = 1; i < arrPropName.length; i++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
                if (i == arrPropName.length - 1) {
                    currentValue = tmp[arrPropName[i]];
                    tmp[arrPropName[i]] = memberValue;
                } else {
                    tmp = tmp[arrPropName[i]]; //voy buscando el miembro que realmente quiero establecer.
                }
            }
            var internalProperty = this.GetProperty(propName, member);
            //Evento que se lanza para informar a ciertas propiedades de que el valor ha cambiado. Las propiedades que lo requieran, reciben el evento.
            var onChangeArgs = { target: member, currentValue: currentValue, newValue: memberValue, propValue: rootValue, cancel: false };
            if (internalProperty.onChange && (context == null || context.ignoreOnchange == false)) {
                internalProperty.onChange(this, onChangeArgs);
            }
            if (!onChangeArgs.cancel) {
                property.PropertyType.SetValue(rootValue); //refresco todo el arbol de propiedades.
            } else {
                return false;
            }
        } else {
            //  
            if (propName == "ID") {
                var args = { target: propName, currentValue: this.ID, newValue: memberValue, cancel: false }
                this.ControlDescriptor.IdProperty.onChange(this, args);
                if (!args.cancel) {
                    this.ID = memberValue;
                } else {
                    return false;
                }

            }
            else if (propName == "Parent") {
                //this.ParentControl; //read only
            } else {
                _instance.ProperyValues[GetIndexOf(property)] = memberValue;
            }
            property.PropertyType.SetValue(memberValue); //refresco la propiedad.
            rootValue = memberValue;
        }

        if (property.Behavior != null) {
            if (property.Behavior.toLowerCase() == "size") {
                _instance.SetSize(rootValue.Width, rootValue.Height);
                _instance.Refresh(Enum.Events.Resize);
            }
            else if (property.Behavior.toLowerCase() == "position") {
                _instance.SetPosition(rootValue.Top, rootValue.Left);
                _instance.Refresh(Enum.Events.Move);
            }
        }
        if (property.PropertyType.HasCss()) {
            _instance.UpdateCss(property, rootValue); //actualiza el control en el diseñador.
        }
        if (property.PropertyType.CheckHtmlContent()) {
            _instance.RenderHtml(property, rootValue, property.PropertyType.RenderTarget); //actualiza el contenido del control
        }

        RefreshContainerSize();
        //Por último refresco el árbol de propiedades.
        //cada propiedad debe mostrar su textoDisplay en función del nuevo valor.
        //            editor = c.GetProperty(root_property.Name);
        //            currentValue = root_value;
        //            editor.PropertyType.$Input.val(editor.PropertyType.TextToDisplay(currentValue));
        //            for (var i = 1; i < arrPropName.length; i++) {
        //                currentValue = currentValue[arrPropName[i]]; //asigno el valor.
        //                editor = editor.PropertyType.Properties[arrIndex[i]];
        //                editor.PropertyType.$Input.val(editor.PropertyType.TextToDisplay(currentValue));

        //            }
        return true;
    }

    /*Actualiza el contenido HTMl de los elementos en el diseñador*/
    this.RenderHtml = function (property, value, target) {

        if (property.PropertyType.HasHtmlContent == false && property.PropertyType.Properties != null && property.PropertyType.Properties.length > 0) {
            for (var i = 0; i < property.PropertyType.Properties.length; i++) {
                var subProp = property.PropertyType.Properties[i];
                //if (subProp.PropertyType.cssStyle != null) {
                if (subProp.PropertyType.CheckHtmlContent()) {
                    _instance.RenderHtml(subProp, value[subProp.Name], property.PropertyType.RenderTarget != null ? property.PropertyType.RenderTarget : target);
                }
            }
        } else {

            var htmlValue = property.PropertyType.HtmlContent != null ? property.PropertyType.HtmlContent.toString().format(value) : value;

            setHTML(htmlValue, property.PropertyType.RenderTarget != null ? property.PropertyType.RenderTarget : target, (value == null || value == ''));
        }






    }

    function setHTML(value, target, clearHtml) {
        var content = _instance.ControlDescriptor.GetContent(_instance.$element, target);
        if (content != null) {
            if (clearHtml) {
                content.html('');
            } else {
                content.html(value);
            }
        }

    }

    function GetIndexOf(property) {
        return jQuery.inArray(property, _instance.ControlDescriptor.Properties);
    }
    /*Devuelve la propiedad de este control que coincide con el nombre pasado como parametro */
    this.GetProperty = function (propName, xpath) {
        var property = null;
        if (propName == "ID") {
            property = this.ControlDescriptor.IdProperty;
        }
        else if (propName == "Size") {
            property = this.ControlDescriptor.SizeProperty;
        }
        else if (propName == "Position") {
            property = this.ControlDescriptor.PositionProperty;
        }
        else if (propName == "Parent") {
            property = this.ControlDescriptor.ParentProperty;
        }
        else {
            for (var i = 0; i < this.ControlDescriptor.Properties.length; i++) {
                if (propName == this.ControlDescriptor.Properties[i].Name) {
                    property = this.ControlDescriptor.Properties[i];
                    break;
                }
            }
        }
        //busqueda de propiedades internas si procede
        if (xpath != null && xpath.length > 2) {
            property = property.GetProperty(xpath);
        }
        //error no se ha encontrado un valor para esta propiedad.
        return property;
    }



}

// Summary:
//     Stores an ordered pair of integers, typically the width and height of a rectangle.
Designer.Size = function (width_px, height_px) {

    this.Width = width_px;
    this.Height = height_px;

    this.GetWidthValue = function () {
        return getValue(this.Width);
    }
    function getValue(valor) {
        if (valor.match) {
            var m = valor == 0 ? ["0"] : valor.match(/^\d+/);
            if (m != null && m[0] != "0") {
                return parseInt(m);
            } else {
                return 0; //eliminar valor.
            }
        } else {
            return valor;
        }
    }

    this.GetHeightValue = function () {
        return getValue(this.Height);
    }

}

Designer.Position = function (top, left) {

    this.Left = left;
    // this.Right = right;
    this.Top = top;
    // this.Bottom = height;

}

function userException(msg, errCode) {
    this.description = msg;
    this.err = errCode;
}

// Summary:
//     Almacena la información que necesita el toolboxManager para añadir el control al panel de controles.
Designer.ToolBoxInfo = function (name, url, tabName, type, icon, text) {

    this.Name = name; //nombre del control. Tiene que coincidir con el nombre del fichero js
    this.URL = url; //url ubicación del control. ejemplo controls\jquery\Cycle_Plugin
    this.TabName = tabName; //tab donde ubicar el control.
    this.ControlType = type; //indica si el control es generico (xml) o bien es un control soportado por ficheros js.
    //Devuelve la ruta completa al fichero que contiene el descriptor del control, ya sea un js, o bien un xml, o lo que sea.
    if (icon == null || icon == '') {
        this.Icon = "toolbox.png"; //imagen por defecto
    } else {
        this.Icon = url + 'img/' + icon; //indica la imagen que muestra en el toolbox
    }
    this.Text = text;
    this.GetControlFileName = function () { return this.URL + this.Name + "." + type; }
}

Designer.ControlDesigner = function (controlName, designerHtml) {

    var _designerHTML = "<div>sin diseñador</div>";
    var _dragHTML = "<div class='defaultBox ui-widget-header'>" + controlName + "</div>";
    if (designerHtml != null) {
        _designerHTML = designerHtml;
    }
    /*devuelve el codigo html que se mostrará cuando se crea por primera vez el control en la pantalla.*/
    this.DesignTimeHtml = _designerHTML;
    /*devuelve el codigo html que se mostrará mientras se arrastra el control desde la barra de controles.*/
    this.DragTimeHtml = _dragHTML;


}

Designer.Bounds = function (position, dimension) {

    this.Min = new Designer.Position(position.Top, position.Left);

    this.Max = new Designer.Position(position.Top + parseDimension(dimension.Height), position.Left + parseDimension(dimension.Width));

    this.Top = this.Min.Top;

    this.Bottom = this.Max.Top;

    this.Left = this.Min.Left;

    this.Right = this.Max.Left;

    /* Devuelve true si el punto pasado como parámetro está fuera de los limites de la frontera definida por este objeto Bounds */
    this.OutOfBounds = function (bounds) {
        if (this.Left < bounds.Left && bounds.Right < this.Right && this.Top < bounds.Top && bounds.Bottom < this.Bottom) {
            return false; //si esta dentro devuelvo false
        } else {
            return true;
        }
    }
    /* Devuelve true si el punto pasado como parametro está dentro de los límites */
    this.InBounds = function (bounds) {

        return !this.OutOfBounds(bounds);
    }

    this.OutOfYBounds = function (bounds) {

        if (this.Top < bounds.Top && bounds.Bottom < this.Bottom) {
            return false;
        } else {
            return true; //esta fuera de los márgenes
        }



    }

    this.OutOfXBounds = function (bounds) {
        if (this.Left < bounds.Left && bounds.Right < this.Right) {
            return false;
        } else {
            return true;
        }
        //        if(left > this.Min.Left){
        //            return false;
        //        }
        //        if(left < this.Max.Left){
        //            return false;
        //        }
        //        return true;
    }

    function parseDimension(dim) {
        if ($.isNumeric(dim)) {
            return parseInt(dim);
        } else {
            var m = (dim == null) ? ["0"] : dim.match(/^\d+/);
            if (m != null && m[0] != "0") {
                return parseInt(m[0]);
            } else {
                return 0; //eliminar valor.
            }
        }
    }

}

Designer.ControlSettings = function () {

    /*es un flag para el diseñador. Indica si el control puede cambiar su tamaño. Valores posibles Enum.ResizeMode = { none: 0, all: 1, width: 2, height:3 }*/
    this.AllowResize = Enum.ResizeMode.none;

    /*es un flag para el diseñador. Indica que el contenedor depende del tamaño del contenido.*/
    this.ResizeContainer = false;

    /* Indica que cuando se redimensiona el contenedor, hay que establecer el tamaño del contenido con el nuevo tamaño */
    this.ResizeContent = true;

    /*Devuelve true si el control es un origen de datos válido para bindar */
    this.IsDataSource = false;

    /*Tipo de origen de datos. Jquery, XmlDataSource, otros*/
    this.SourceType = false;

    /*Devuelve true en caso de que sea un control contenedor de otros controles.*/
    this.IsContainer = false;

    /*Devuelve true en caso de que el control tenga configurado un tamaño.*/
    this.HasSize = false;

    /*Devuelve true en el caso de que la posición sea una propiedad.*/
    this.HasPosition = false;

    /*Devuelve Indica el modo de posicionamiento para los controles hijos.*/
    this.PositionMode = Enum.PositionMode.Absolute; //Modo de posicionamiento para los controles de tipo contenedor (IsContainer == true)


    /*  obtiene la cadena compatible con la función resize de jQuery the following keys are supported: { n, e, s, w, ne, se, sw, nw }*/
    this.GetResizeToken = function () {
        if (this.AllowResize == Enum.ResizeMode.none) {
            return null;
        }
        if (this.AllowResize == Enum.ResizeMode.all) {
            return 'e, s, se';
        }
        if (this.AllowResize == Enum.ResizeMode.width) {
            return 'e';
        }
        if (this.AllowResize == Enum.ResizeMode.height) {
            return 's';
        }
    }
}

Designer.ControlDescriptor = function () {

    /*nombre con el que el control aparece registrado en el toolboxTab*/
    this.Name = "unnamed";

    /*Es el icono que mostrará en la barra de controles*/
    //this.ToolboxBitmap = "default_control.png";

    //toolboxInfo
    this.ToolBoxInfo = null;

    /*el tamaño por defecto  del control en el diseñador cuando lo arrastramos. */
    this.ClientSize = null;


    /*El contenido que se genera en el diseñador*/
    this.GetDesigner = null;

    /*Funcion que se ejecuta cuando se registra un descriptor en el diseñador*/
    this.RegisterToolBox = null; //por defecto no se registra ningún elemento.

    /*es un flag para el diseñador. Indica si el control puede cambiar su tamaño. Valores posibles Enum.ResizeMode = { none: 0, all: 1, width: 2, height:3 }*/
    this.Settings = new Designer.ControlSettings();


    /*Especifica el template de transformación y la función de transformación.*/
    this.TemplateInfo = new Designer.TemplateInfo(null); //

    this.IdProperty = new Designer.ControlProperty(this, "ID", new Designer.PropertyTypes.StringValue(), null);
    if (Designer.Model.ControlManager) {
        this.IdProperty.onChange = Designer.Model.ControlManager.onPropertyChanged;
    }
    this.SizeProperty = new Designer.ControlProperty(this, "Size", new Designer.PropertyTypes.Size(), null);
    this.SizeProperty.Behavior = "size";
    this.PositionProperty = new Designer.ControlProperty(this, "Position", new Designer.PropertyTypes.Position(), null);
    this.PositionProperty.Behavior = "position";
    this.ParentProperty = new Designer.ControlProperty(this, "Parent", new Designer.PropertyTypes.StringValue(), null);

    /*Lista de propiedades de un control. */
    this.Properties = new Array();
    //parser


    /*Esta funcion determina como se accede al contenido del control en tiempo de diseño.
    * $element es el elemento de diseño en el diseñador. Target es un select de jquery a encontrar dentro del elemento de diseño.*/
    this.GetContent = function ($element, target) {
        var hijos = null
        var r = null;
        if (target != null) {
            hijos = $element.find(target);
        }
        else {
            hijos = $element.children();
        }
        if (hijos != null && hijos.length > 0) {
            r = $(hijos[0]);
        }
        if (r == null) {
            Designer.Model.EventManager.HandleMessage(("No se encontró el elemento \"{0}\"  en el objeto seleccionado").format(target != null ? target : "principal"), null, Enum.MessageType.Error);
        }
        return r;
    }

    /*devuelve true si alguna de las propiedades contiene la propiedad con nombre y tipo igual a los parámetros*/
    this.HasProperty = function (propName, editorID) {
        var r = false;
        if (this.Properties != null) {

            jQuery.each(this.Properties, function (i, prop) {
                if (prop.Name == propName && prop.PropertyType.ID == editorID) {
                    r = true;
                    return true;
                }
            });
        } else {
            return false;
        }
        return r;

    }

    /* Devuelve el control descritor propietario de una propiedad o un tipo de propiedad.  */
    this.GetDescriptorOwner = function () {
        return _instance;
    }

    /*Obtiene la propiedad que controla el origen de datos para propiedades bindadas contra un control de datos. La llamada no puede ir más hacia arriba. */
    this.GetValidSource = function () {
        var property = null;
        for (var i = 0; i < this.Properties.length; i++) {
            if (this.Properties[i].IsValidSource) {
                property = this.Properties[i];
            }
        }
        return property;
    }

}

Designer.Borders = function () {

    this.Top = new Designer.Border(0, 'none', '#ffffff');
    this.Bottom = new Designer.Border(0, 'none', '#ffffff');
    this.Left = new Designer.Border(0, 'none', '#ffffff');
    this.Right = new Designer.Border(0, 'none', '#ffffff');

    //this.Detail = function () { return this.Top.Detail() + " " + this.Right.Detail() + " " + this.Bottom.Detail() + " " + +this.Left.Detail() }

}

Designer.Border = function (width, style, color) {

    this.Width = width;
    this.Style = style;
    this.Color = color;
    /*top right botton left */
    //this.Detail = function () { return this.Width + "px " + this.Style + " " + this.Color; }

}

Designer.Paddings = function (top, right, bottom, left) {

    this.Top = top;
    this.Bottom = bottom;
    this.Left = left;
    this.Right = right;

    //this.Detail = function () { return this.Top + "px " + this.Right + "px " + this.Bottom + "px " + this.Left + "px"; }

}

Designer.Resource = function (resourceURL, resourceType) {

    this.ResourceURL = resourceURL;
    this.ResourceType = resourceType;


}

Designer.FontSetting = function (fontFamily, fontSize, fontStyle) {

    this.FontFamily = fontFamily;
    this.FontSize = fontSize;
    this.FontStyle = fontStyle;
    this.FontWeight = 'normal'; //valor por defecto.
}


/*
Modela una propiedad de un control
Nombre: Nombre de la propiedad
PropType: PropertyType tipo de la propiedad. Puede ser un tipo simple o un tipo compuesto de más propiedades.
Category: Clasificación de la propiedad
option: cajon desastre para meter más parametros de inicialización de propiedades (onBeforeRender)
*/
Designer.ControlProperty = function (parent, name, proptype, category, options) {

    /*nombre de la propiedad, debe coincidir con el miembro de datos al que se está accediendo.*/
    this.Name = name;
    this.Category = category;
    /*Descripción de para qué sirve la propiedad */
    this.Description = '';
    /* Tipo de la propiedad */
    this.PropertyType = proptype;
    /* reglas de validación complejas */
    this.Validation = null;
    this.Behavior = null;
    this.Visible = true;

    /* La propiedad tiene un padre que puede ser un control o bien un tipo */
    this.Parent = parent; //para poder ir hacia atras en la cadena de propiedades. tipo --> prop --> tipo --> prop
    this.ParentProperty = (parent != null && parent.Parent != null && parent.Parent.Settings == null) ? parent.Parent : null; //parent property es una propiedad no puede ser ni un tipo ni un control.
    proptype.Parent = this; //el padre del tipo es esta propiedad. Control --> Propiedad --> Tipo --> Propiedades ? -- Tipo
    proptype.InitProperties();
    /*******************************************/
    this.IsValidSource = false; /* Devuelve true, cuando  */

    if (options != null) {
        /*Función que se ejecuta justo antes de que se renderize en pantalla el editor para esta propiedad. */
        if (options.onBeforeRender) {
            this.onBeforeRender = options.onBeforeRender;
        } else {
            this.onBeforeRender = onBeforeRenderHandler; //funcion por defecto
        }

    } else {
        /*Función que se ejecuta justo antes de que se renderize en pantalla el editor para esta propiedad. */
        this.onBeforeRender = onBeforeRenderHandler; //funcion por defecto
    }

    /*Obtiene el property de una propiedad interna al editor de esta propiedad. OJO el primer elemento es la propiedad raiz.*/
    this.GetProperty = function (xpath) {
        var property = this;
        if (xpath.indexOf('.') > 0) { //puedo buscar por nombre
            var arrPropName = xpath.split('.'); //obtenemos el array 
            for (var z = 1; z < arrPropName.length; z++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
                for (var y = 0; y < property.PropertyType.Properties.length; y++) {
                    if (arrPropName[z] == property.PropertyType.Properties[y].Name) {
                        property = property.PropertyType.Properties[y];
                        break;
                    }
                }

            }
        }
        else if (xpath.indexOf('#') > 0) { //puedo buscar por nombre
            var arrIndex = xpath.split('#'); //obtenemos el array 
            for (var x = 1; x < arrIndex.length; x++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
                property = property.PropertyType.Properties[arrIndex[x]];
            }
        }
        return property;
    }

    /* Obtiene el nombre completo de la propiedad */
    this.GetFullName = function () {
        if (this.ParentProperty != null) {
            return this.ParentProperty.GetFullName() + "." + this.Name;
        } else {
            return this.Name;
        }
    }

    function onBeforeRenderHandler() {
        //Recorre las propiedades del Type y ejecutar la función onBeforeRender de cada una.
        if (this.PropertyType != null && this.PropertyType.Properties != null && this.PropertyType.Properties.length > 0) {
            jQuery.each(this.PropertyType.Properties, function (i, prop) {
                prop.onBeforeRender();
            });
        }
    }

    /*Obtiene la propiedad que controla el origen de datos para propiedades bindadas contra un control de datos. Por defecto pasa la llamada al padre. */
    this.GetValidSource = function () { if (this.IsValidSource == true) { return this; }; if (this.Parent && this.Parent.GetValidSource) { return this.Parent.GetValidSource(); } else { return null; } };

    /* Devuelve el control propietario de una propiedad o un tipo de propiedad.  */
    this.GetDescriptorOwner = function () {
        return this.Parent.GetDescriptorOwner();
    }

    /* Se llama cuando cambia una propiedad */
    this.onChange = null;

}

Designer.ValidationSettings = function (propertyType) {




}









