/* Depends:
*	Control.js
*  EventManager.js
*  Default.aspx
*/

/* este control recibe un xml donde vienen especificados todos los detalles del descriptor */
function GenericDescriptor(xml) {

    var _instance = this;
    /*******************************/
    //En función del XML rellenamos la información del control
    var xmlInfo = xml.find('GenericDescriptor');
    if (xmlInfo.length == 1) {
        var descriptor = $(xmlInfo[0]);
        _instance.Name = descriptor.attr("Name");
        _instance.GetDesigner = new Designer.ControlDesigner(this.Name, '<div class="_ctrGrid">' + descriptor.find('Designer').text() + '</div>');

        //Settings
        var settingsXML = descriptor.find('Settings');
        if (settingsXML.length == 1) {
            var settings = $(settingsXML[0]);
            /* Inizializamos todos los settings de este control. Sólo hace falta establecer aquellos que sean distintos a los valores por defecto.*/
            _instance.Settings = new Designer.ControlSettings();
            _instance.Settings.ResizeContainer = settings.find('ResizeContainer').text().toLowerCase() == 'true';
            /*es un flag para el diseñador. Indica si el control puede cambiar su tamaño. Valores posibles Enum.ResizeMode = { none: 0, all: 1, width: 2, height:3 }*/
            _instance.Settings.AllowResize = getResizeMode(settings.find('AllowResize').text());
            _instance.Settings.ResizeContent = settings.find('ResizeContent').text().toLowerCase() == 'true';
            _instance.Settings.IsContainer = settings.find('IsContainer').text().toLowerCase() == 'true';//determina si el control tiene una zona con controles hijos.
            _instance.Settings.IsComponent = settings.find('IsComponent').text().toLowerCase() == 'true';//determina si el control aparece en el diseñador, o bien aparece en la barra de componentes.
            _instance.Settings.PositionMode = getPositionMode(settings.find('PositionMode').text());
        }
        //***************************************

        //Properties
        this.Properties = new Array();
        var propertiesXML = descriptor.children('Properties');
        if (propertiesXML.length == 1) {
            propertiesXML.children('Property').each(function (i) {
                var property = $(this);
                if (property.attr("Behavior")) {
                    if (property.attr("Behavior").toLowerCase() == "size") {
                        _instance.Settings.HasSize = true;
                        var nodeSize = property.children('PropertyType').children('DefaultValue');
                        if (nodeSize.length == 1) {
                            try {
                                var sizeArr = nodeSize.text().split(',');
                                _instance.ClientSize = new Designer.Size(sizeArr[0], sizeArr[1]);
                            } catch (ex) {
                                Designer.Model.EventManager.HandleMessage("Error estableciendo el tamaño inicial del control", ex, Enum.MessageType.Error);
                            }
                        }
                    } else if (property.attr("Behavior").toLowerCase() == "position") {
                        _instance.Settings.HasPosition = true; //se ha encontrado una propiedad posición
                        _instance.Position = new Designer.Position(0, 0); //la posición no tiene valor por defecto.
                    }

                } else {

                    //Propiedad normal
                    CreateProperty(_instance, property);
                }


            });
        }


        //Templates
        this.TemplateInfo = new Designer.TemplateInfo();
        var templateInfoXML = descriptor.children('TemplateInfo');
        if (templateInfoXML.length == 1) {
            BuildTemplateFrame(_instance.TemplateInfo, templateInfoXML);
        }
        //***************************************


    }

    function CreateProperty(parent, property) {
        var piNode = property.children('PropertyType');
        var propertyType = getPropertyEditor(piNode.attr("typeName"), piNode.children('DefaultValue'));
        var htmlContent = piNode.children('HtmlContent');
        if (htmlContent != null && htmlContent.length == 1) {
            propertyType.HtmlContent = $(htmlContent).text();
        }


        $.each(piNode[0].attributes, function (i, attrib) {
            var name = attrib.name;
            var value = attrib.value;
            if (name != 'typeName') {
                propertyType[name] = value;
            }
        });
        /*propertyType.HasHtmlContent = piNode.attr("HasHtmlContent");
        propertyType.RenderTarget = piNode.attr("RenderTarget");
        propertyType.cssStyle = piNode.attr("cssStyle");*/
        var newProperty = new Designer.ControlProperty(parent, property.attr("Name"), propertyType, getCategoryEnum(property.attr("Category")));
        newProperty.Description = property.attr("Description") != null ? property.attr("Description") : "";
        if (parent.Properties == null) { parent.Properties = new Array(); }


        var propertiesXML = piNode.children('Properties');
        if (propertiesXML.length == 1) {
            var valueType = new String(); //cadena auxiliar que me sirve para construir el tipo de datos que sera capaz de almacenar los valores para esta propiedad compuesta.
            propertyType.ReadOnly = true; // es una propiedad compuesta, luego el editor original es readOnly
            //OJO cuando un control genérico entra en este punto, significa que se trata de una propiedad compuesta de tipo custom.
            //El programa no conoce cual es el valor asociado a esta propiedad, tiene que construirlo on the fly.
            propertiesXML.children('Property').each(function (i) {
                var subProperty = $(this);
                var piSubNode = subProperty.children('PropertyType');
                var subPropertyType = getPropertyEditor(piSubNode.attr("typeName"), piSubNode.children('DefaultValue'));
                if (valueType != null && valueType != '') {
                    valueType += ', ';
                }
                valueType += "\"" + subProperty.attr("Name") + "\"" + ":" + JSON.stringify(subPropertyType.GetDefaultValue());
                //Propiedad interna a un propertyType
                CreateProperty(newProperty.PropertyType, subProperty);

                newProperty.PropertyType.GetDefaultValue = function () { return JSON.parse('{' + valueType + '}'); }
            });
        }
        parent.Properties.push(newProperty);


    }

    /*crea los objeto plantillas a partir de la información contenida en el XML */
    function BuildTemplateFrame(parent, node) {

        node.children('Directory').each(function (i) {
            var directoryXML = $(this);
            var tmp = new Designer.Directory();
            tmp.Name = getNode(directoryXML, "Name");
            tmp.Path = getNode(directoryXML, "Path");
            parent.AddFile(tmp);
            BuildTemplateFrame(tmp, directoryXML);

        });
        node.children('File').each(function (i) {
            var fileXML = $(this);
            var tmp = new Designer.File();
            tmp.Source = getNode(fileXML, "Source");
            tmp.Destination = getNode(fileXML, "Destination");
            parent.AddFile(tmp);

        });
        node.children('Template').each(function (i) {
            var templateXML = $(this);
            var tmp = new Designer.Template();
            tmp.Template = getNode(templateXML, "Template");
            tmp.Name = getNode(templateXML, "Name");
            tmp.Destination = getNode(templateXML, "Destination");
            parent.AddFile(tmp);
        });


    }
    /*******************************/

    //funcion auxiliar
    function getNode(parent, name, defaultValue) {
        var node = parent.children(name);
        if (node != null && node.length == 1) {
            return $(node).text();
        } else {
            return defaultValue ? defaultValue : '';
        }
    }

    /*Este metodo se ejecuta cuando se registra el descriptor del control en el diseñador */
    this.RegisterToolBox = function (tbInfo) {

        this.ToolBoxInfo = tbInfo;
    };


    this.onInit = function ($control) {


    }


    //TODO getCategory.. meter tantas como existan en el enum.

    /*Obtiene el valor de la propiedad AllowResize a partir del texto pasado como parámetro*/
    function getResizeMode(str) {

        if (str == 'all') {
            return Enum.ResizeMode.all;
        } else if (str == 'width') {
            return Enum.ResizeMode.width;
        } else if (str == 'height') {
            return Enum.ResizeMode.height;
        } else if (str == 'none') {
            return Enum.ResizeMode.none;
        } else {
            return Enum.ResizeMode.none;
        }
    }

    /*Obtiene el tipo enumerado PositionMode a partir de un string*/
    function getPositionMode(str) {

        if (str == 'Absolute') {
            return Enum.PositionMode.Absolute;
        } else if (str == 'FlowLayout') {
            return Enum.PositionMode.FlowLayout;
        } else {
            return Enum.PositionMode.Absolute;
        }
    }

    /*Obtiene el tipo enumerado Enum.Category a partir de un string*/
    function getCategoryEnum(str) {

        if (str == 'Style') {
            return Enum.Categories.Style;
        } else if (str == 'Data') {
            return Enum.Categories.Data;
        }
        else if (str == 'Control') {
            return Enum.Categories.Control;
        }
        else if (str == 'Settings') {
            return Enum.Categories.Settings;
        }
        else if (str == 'Editor') {
            return Enum.Categories.Editor;
        } else {
            return Enum.Categories.Style;
        }
    }

    /*Obtiene el editor a partir de los valores pasados como argumentos de la función.*/
    function getPropertyEditor(str, defaultValue, cssValue) {

        var valor = null;
        if (defaultValue == null || jQuery.trim(defaultValue.text()) == '') {

        } else {
            valor = defaultValue.text();
        }
        var cssValor = null;
        if (defaultValue == null || jQuery.trim(cssValue) == '') {

        } else {
            cssValor = cssValue;
        }

        if (str == 'Designer.PropertyTypes.NumericValue') {
            return new Designer.PropertyTypes.NumericValue(valor == null ? 0 : parseInt(valor), cssValor);
        }
        else if (str == 'Designer.PropertyTypes.StringValue') {
            return new Designer.PropertyTypes.StringValue(valor, cssValor);
        }
        else if (str == 'Designer.PropertyTypes.Size') {
            return new Designer.PropertyTypes.Size(valor);
        }
        else if (str == 'Designer.PropertyTypes.Position') {
            return new Designer.PropertyTypes.Position(valor);
        }
        else if (str == 'Designer.PropertyTypes.Borders') { //TODO no admite valor por defecto
            return new Designer.PropertyTypes.Borders(null);
        }
        else if (str == 'Designer.PropertyTypes.Border') { //admite valores por defecto. OJO
            return new Designer.PropertyTypes.Border(defaultValue);
        }
        else if (str == 'Designer.PropertyTypes.Paddings') { //admite la siguiente cadena 0,0,0,0
            return new Designer.PropertyTypes.Paddings(defaultValue);
        }
        else if (str == 'Designer.PropertyTypes.BoolValue') { //admite la siguiente cadena true o false
            return new Designer.PropertyTypes.BoolValue(defaultValue);
        }
        else if (str == 'Designer.PropertyTypes.Font') { //admite la siguiente cadena 0,0,0,0
            return new Designer.PropertyTypes.Font(defaultValue);
        }
        else if (str == 'Designer.PropertyTypes.FontFamilyType') {
            return new Designer.PropertyTypes.FontFamilyType(valor, cssValor);
        }
        else if (str == 'Designer.PropertyTypes.ListValue') {
            return new Designer.PropertyTypes.ListValue(defaultValue, null, null, cssValor); //TODO revisar...
        }
        else if (str == 'Designer.PropertyTypes.ColorType') {
            return new Designer.PropertyTypes.ColorType(valor, cssValor); //TODO revisar...
        }
        else if (str == 'Designer.PropertyTypes.ArrayValue') {
            return new Designer.PropertyTypes.ArrayValue(defaultValue, cssValor); //TODO revisar...
        }
        else if (str == 'Designer.PropertyTypes.UserType') {
            return new Designer.PropertyTypes.UserType(defaultValue, cssValor); //TODO revisar...
        }
        else {
            return eval("new " + str + "(defaultValue, cssValor);");
        }

    }
}
