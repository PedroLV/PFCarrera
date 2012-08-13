 /* Depends:
 *	Control.js
 */
function DebugListener(url) {

    var elementObjectReference = null;
    var targetContainer = null;
    if(url != null)
    {
        if (elementObjectReference == null || elementObjectReference.closed) {
            jQuery(document).ready(function ($) {
                elementObjectReference = window.open(url, 'debugView', 'width=520, height=700,titlebar=no,location=no,toolbar=no,status=no,resizable=no,scrollbars=yes,left=0,top=0');
        
                setTimeout(function () { targetContainer = elementObjectReference.GetDebugPanel(); }, 2000);
            });
        
        
        }
        else {
            elementObjectReference.location = url;
            elementObjectReference.focus();
            setTimeout(function () { targetContainer = elementObjectReference.GetDebugPanel() }, 2000);
        }
    }

    this.WindowURL = url;

    this.Initializate = function(windowUrl){
        this.WindowURL = windowUrl;
        if (elementObjectReference == null || elementObjectReference.closed) {
            jQuery(document).ready(function ($) {
                elementObjectReference = window.open(windowUrl, 'debugView', 'width=520, height=700,titlebar=no,location=no,toolbar=no,status=no,resizable=no,scrollbars=yes,left=0,top=0');
        
                setTimeout(function () { targetContainer = elementObjectReference.GetDebugPanel(); }, 3000);
            });
        
        
        }
        else {
            elementObjectReference.location = windowUrl;
            elementObjectReference.focus();
            setTimeout(function () { targetContainer = elementObjectReference.GetDebugPanel() }, 3000);
        }

    }



    this.Log = function (valor) {
        //        if (targetContainer) {
        //            targetContainer.before($("<p>"+ valor + "</p>"));
        //            targetContainer.scrollTop(targetContainer.outerHeight());
        //        }
        if (elementObjectReference != null && !elementObjectReference.closed) {
            elementObjectReference.Log(valor);
        }
    }

    this.Error = function (err) {
        //        if (targetContainer) {
        //            targetContainer.append($("<p>"+ err + "</p>"));
        //        }
        if (elementObjectReference != null && !elementObjectReference.closed) {
            elementObjectReference.Error(err);
        }
    }

    this.DebugElement = function (item, $element, control) {
        if (elementObjectReference != null && !elementObjectReference.closed) {
            elementObjectReference.DebugElement(item, $element, control);
        }
        

    }

    


}

function FakeDataSource() {


    this.GetControlList = function (tab) {
        var controles_Info = new Array();
        

        $.ajax({
            type: "GET",
            url: "controls/ControlManifest.xml",
            dataType: "xml",
            success: function (xml) {
                $(xml).find('ToolBoxInfo[Tab="' + tab + '"]').each(function (toolBoxInfoXml) {
                    var toolBoxInfo = $(this);
                    var customControl = new Designer.ToolBoxInfo(toolBoxInfo.find('ControlName').text(), toolBoxInfo.find('URL').text(), tab, toolBoxInfo.find('Type').text(), toolBoxInfo.find('Icon').text(), toolBoxInfo.find('Text').text());
                    controles_Info.push(customControl);
                });

            }
            ,
            async: false
        });

        return controles_Info;

        /*

        if (tab == "general") {
            //la lista con la información de los controles tiene que venir del servidor
            var control1 = new Designer.ToolBoxInfo("jQuery_Cycle_Control", "controls/jquery/Cycle_Plugin/", tab);
            
            var control2 = new Designer.ToolBoxInfo("Masonry_Control", "controls/jquery/Masonry_Plugin/", tab);
            controles_Info.push(control1);
            controles_Info.push(control2);


        }

        if (tab == "contenedores") {
            //la lista con la información de los controles tiene que venir del servidor
            var control3 = new Designer.ToolBoxInfo("TextPanel_Control", "controls/standar/TextPanel/", tab);
           
            var control4 = new Designer.ToolBoxInfo("Panel_Control", "controls/standar/Panel/", tab);
            controles_Info.push(control3);
            controles_Info.push(control4);
        }
        if (tab == "custom") {
            //TODO hacer algún mecanismo para poner todos los controles en una lista.

        }*/

        
    }

    this.GetControlTabList = function () {
        var controles_Tabs = new Array();

        //la lista con la información de los TABs tiene que venir del servidor, en el fichero ControlManifest que contiene la lista de controles a mostar.
        $.ajax({
            type: "GET",
            url: "controls/ControlManifest.xml",
            dataType: "xml",
            success: function (xml) {
                $(xml).find('ToolBoxInfo').each(function () {
                    //var tab = $(this).text();
                    var tab = $(this).attr("Tab");
                    if ($.inArray(tab, controles_Tabs) == -1) {
                        controles_Tabs.push(tab);
                    }

                });

            }
            ,
            async: false
        });
        //DEPURACION
        //**************************************
        //controles_Tabs.push("general");
        //controles_Tabs.push("contenedores");
        //controles_Tabs.push("forms");
        // .. añadir aquí los tabs.
        //**************************************
        return controles_Tabs;
    }

}



Designer.Schema.XSDParser = function () {
    var _instance = this;
    var _nameSpaces = new Collection.HashMap();
    var _xsd = null;
    var _targetNameSpace = null;
    var _elements = new Array();
    var _errFun = null;
    var _arrConsolidacion = new Array(); // array de objetos que necesitan consolidar el tipo de datos.

    _nameSpaces.put('_globalNS', new Designer.Schema.XSD.NameSpace('', 'global namespace')); //espacio de nombre globar.

    this.Parse = function (xml) {

        var xmlInfo = xml.find('xs\\:schema'); //.find('xs:schema'); //xs:schema

        if (xmlInfo.length > 0) {
            var schema = $(xmlInfo[0]);

            //busco los namespaces:
            $.each(xmlInfo[0].attributes, function (i, attrib) {
                var name = attrib.name;
                var value = attrib.value;
                if (name.startsWith('xmlns:')) {
                    var prefix = name.split(':')[1];
                    var nameSpace = new Designer.Schema.XSD.NameSpace(prefix, attrib.value);
                    _nameSpaces.put(prefix, nameSpace);
                    if (value == 'http://www.w3.org/2001/XMLSchema') {
                        _xsd = nameSpace;
                    }
                }
            });
            _targetNameSpace = this.getNameSpaceByURI(schema.attr("targetNamespace"));

            //TODO validar que tengo todos los elemetos para continuar
            //_targetNameSpace, _xsd

            //proceso los imports
            schema.children(_xsd.getQName('import')).each(function (i) {
                var xmlNode = $(this);
                try {

                    var newParser = new Designer.Schema.XSDParser();
                    newParser.OpenXSD(xmlNode.attr("schemaLocation"), null, _errFun);

                    ImportNameSpace(xmlNode.attr("namespace"), newParser.getNameSpaces());

                } catch (ex) {
                    RaiseError('ocurrió un error al importar: ' + xmlNode[0].xml, ex);
                }
            });
            try {

                schema.children(_xsd.getQName('attribute')).each(function (i) {
                    //var gr = parseAttribute(_targetNameSpace, $(this));
                    //if (gr == null) {
                    throw "No se puede procesar el nodo attribute en el nivel raiz.";
                    //}
                });
                schema.children(_xsd.getQName('notation')).each(function (i) {
                    RaiseError("Nodo notation no soportado.", ex);
                });
                schema.children(_xsd.getQName('attributeGroup')).each(function (i) {
                    RaiseError("Nodo attributeGroup no soportado.", ex);
                });

                //proceso los tipos simples
                schema.children(_xsd.getQName('group')).each(function (i) {
                    var gr = parseGroup(_targetNameSpace, $(this));
                    if (gr == null) {
                        throw "Errores procesando un nodo group. No se puede continuar";
                    }
                });
                //proceso los tipos simples
                schema.children(_xsd.getQName('simpleType')).each(function (i) {
                    var st = parseSimpleType(_targetNameSpace, $(this));
                    if (st == null) {
                        throw "Errores procesando un nodo simpleType. No se puede continuar";
                    }

                });

                //proceso los tipos complejos
                schema.children(_xsd.getQName('complexType')).each(function (i) {
                    var ct = parseComplexType(_targetNameSpace, $(this));
                    if (ct == null) {
                        throw "Errores procesando un nodo complexType. No se puede continuar";
                    }
                });

                //proceso los elementos
                schema.children(_xsd.getQName('element')).each(function (i) {
                    var element = parseElement(null, $(this));
                    if (element == null) {
                        throw "Errores procesando un nodo element. No se puede continuar";
                    }
                    _elements.push(element);
                });

                //consolidación de tipos
                jQuery.each(_arrConsolidacion, function (i, objeto) {
                    // PropertyName: propertyName, Target: target, TypeName: tipo
                    objeto.Target[objeto.PropertyName] = _instance.getTypeByQName(objeto.TypeName);
                });

            } catch (ex) {
                RaiseError("Se detuvo la lectura del esquema.", ex);
            }

            return _elements;

        } else {
            RaiseError("No es un documento XSD.", null);
        }
    }



    this.OpenXSD = function (url, succesfun, errFun) {
        _errFun = errFun;
        $.ajax({
            type: "GET",
            url: url,
            dataType: "xml",
            success: function (xml) {

                var e = _instance.Parse($(xml));
                if (succesfun) {
                    succesfun(e);
                }
            }
            ,
            error: function (xhr, ajaxOptions, thrownError) {
                RaiseError("Error " + xhr.status + "-" + thrownError + "  obteniendo la URL: " + url, null);
            }
            ,
            async: true
        });
    }

    this.getTypeByQName = function (qname, target, propertyName) {

        var prefix = '_globalNS';
        var name = qname;
        if (qname.indexOf(':') > 0) {
            prefix = qname.split(':')[0];
            name = qname.split(':')[1];
        }

        var ns = _nameSpaces.get(prefix);
        if (ns == null) {
            return RaiseError("No se encontró el espacio de nombres: [" + prefix + "]", null);
        } else {
            var tipo = ns.TypesTable.get(name);
            if (tipo == null) {

                //en este caso postergo la asignación del tipo a una fase final de consolidación de tipos.
                if (target != null) {
                    _arrConsolidacion.push({ PropertyName: propertyName, Target: target, TypeName: qname });
                } else {
                    return RaiseError("No se encontró el tipo dentro del namespace: [" + qname + "]", null);
                }
            } else {
                return tipo;
            }
        }
    }
    this.getGroupByQName = function (qname) {

        var prefix = '_globalNS';
        var name = qname;
        if (qname.indexOf(':') > 0) {
            prefix = qname.split(':')[0];
            name = qname.split(':')[1];
        }

        var ns = _nameSpaces.get(prefix);
        if (ns == null) {
            return RaiseError("No se encontró el espacio de nombres: [" + prefix + "]", null);
        } else {
            var group = ns.GroupTable.get(name);
            if (ns == null) {
                return RaiseError("No se encontró el grupo dentro del namespace: [" + qname + "]", null);
            } else {
                return group;
            }
        }


    }
    this.getNameSpaces = function () {
        var ns = new Array();
        for (var i = 0; i++ < _nameSpaces.size; _nameSpaces.next()) {
            //if (_nameSpaces.value().NAMESPACE_URI != _xsd.NAMESPACE_URI) {
            ns.push(_nameSpaces.value());
            //}
        }
        return ns;
    }

    this.getNameSpaceByURI = function (ns_URI) {
        for (var i = 0; i++ < _nameSpaces.size; _nameSpaces.next()) {
            if (_nameSpaces.value().NAMESPACE_URI == ns_URI) {
                return _nameSpaces.value();
            }
        }
        return null;
    }

    function RaiseError(texto, ex) {
        if (ex != null) {
            //
            _errFun != null ? _errFun(texto + ": " + ex.message) : alert(texto + ": " + ex.message); ;
        } else {
            //alert(texto);
            _errFun != null ? _errFun(texto) : alert(texto);
        }
        return false;
    }
    function ImportNameSpace(ns_URI, arrNameSpaces) {
        var current = _instance.getNameSpaceByURI(ns_URI);
        if (current != null) {
            jQuery.each(arrNameSpaces, function (i, ns) {
                if (ns.NAMESPACE_URI == ns_URI) {
                    current.ImportTypes(ns.getTypes());
                    return false;
                }
            });
        }
    }

    function parseComplexType(parent, xmlNode) {
        try {

            var typeName = xmlNode.attr("name");
            if (typeName == null || typeName == '') {
                typeName = parent.Name;
            }
            if (typeName == null || typeName == '') {
                throw "No se puede crear el tipo de datos sin especificar un nombre.";
            }
            var cType = new Designer.Schema.XSD.AnyType(typeName);

            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(cType, $(this));
            });

            _targetNameSpace.TypesTable.put(typeName, cType);
            cType.IsComlexType = true;

            xmlNode.children(_xsd.getQName('simpleContent')).each(function (i) {
                parseSimpleContent(cType, $(this));
            });

            xmlNode.children(_xsd.getQName('complexContent')).each(function (i) {
                parseComplexContent(cType, $(this));
            });


            xmlNode.children(_xsd.getQName('sequence')).each(function (i) {
                parseSequence(cType, $(this));
            });

            xmlNode.children(_xsd.getQName('attribute')).each(function (i) {
                parseAttribute(cType, $(this));
            });

            return cType;

        } catch (ex) {
            RaiseError('ocurrió un error al parsear el simple type: ' + xmlNode[0].xml, ex);
        }
    }

    function parseSimpleType(parent, xmlNode) {
        try {

            var typeName = xmlNode.attr("name");
            if (typeName == null || typeName == '') {
                typeName = parent.Name;
            }
            if (typeName == null || typeName == '') {
                throw "No se puede crear el tipo de datos sin especificar un nombre.";
            }
            var simpleType = new Designer.Schema.XSD.AnyType(typeName);

            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(simpleType, $(this));
            });

            _targetNameSpace.TypesTable.put(typeName, simpleType);

            xmlNode.children(_xsd.getQName('restriction')).each(function (i) {
                parseRestriction(simpleType, $(this));
            });
            xmlNode.children(_xsd.getQName('union')).each(function (i) {
                parseUnion(simpleType, $(this));
            });
            xmlNode.children(_xsd.getQName('list')).each(function (i) {
                parseList(simpleType, $(this));
            });

            return simpleType;
        } catch (ex) {
            RaiseError('ocurrió un error al parsear el simple type: ' + xmlNode[0].xml, ex);
        }
    }

    function parseSimpleContent(parent, xmlNode) {
        try {

            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });

            xmlNode.children(_xsd.getQName('restriction')).each(function (i) {
                parseRestriction(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('extension')).each(function (i) {
                parseExtension(parent, $(this));
            });
        } catch (ex) {
            RaiseError('ocurrió un error al parsear el simple content: ' + xmlNode[0].xml, ex);
        }
    }

    function parseAttribute(parent, xmlNode) {
        try {
            var name = xmlNode.attr("name");
            if (name != null && name != '') {
                var attr = { Name: name, Type: null, Parent: parent };
                
                var typeName = xmlNode.attr("type");
                if (typeName != null && typeName != '') {
                    attr.Type = _instance.getTypeByQName(typeName, attr, 'Type');
                } else {
                    type = _xsd.getDefaultType();
                }
            } else {
                throw "Bad XSD. El atributo name es obligatorio";
            }
            parent.Attributes.push(attr);
        } catch (ex) {
            RaiseError('ocurrió un error al parsear el attribute: ' + xmlNode[0].xml, ex);
        }
    }



    function parseSequence(parent, xmlNode) {
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });

            xmlNode.children(_xsd.getQName('element')).each(function (i) {
                var element = parseElement(parent, $(this));
                if (element == null) {
                    throw "Errores procesando un nodo element. No se puede continuar";
                }
                parent.Elements.push(element);
            });
            xmlNode.children(_xsd.getQName('group')).each(function (i) {
                parseGroup(null, $(this));
            });
            xmlNode.children(_xsd.getQName('sequence')).each(function (i) {
                parseSequence(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('choice')).each(function (i) {
                parseChoice(parent, $(this));
            });

        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo Sequence: ' + xmlNode[0].xml, ex);
        }
    }

    function parseComplexContent(parent, xmlNode) {
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('restriction')).each(function (i) {
                parseRestriction(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('extension')).each(function (i) {
                parseExtension(simpleType, $(this));
            });
        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo ComplexContent: ' + xmlNode[0].xml, ex);
        }

    }
    function parseExtension(parent, xmlNode) {
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });
            var base = xmlNode.attr("base");
            if (base != null) {
                var baseType = _instance.getTypeByQName(base, parent, 'BaseType');
                parent.BaseType = baseType;
            }
            xmlNode.children(_xsd.getQName('group')).each(function (i) {
                parseGroup(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('sequence')).each(function (i) {
                parseSequence(parent, $(this)); //añadimos más campos a la secuencia.
            });

        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo Extension: ' + xmlNode[0].xml, ex);
        }

    }
    /* parsea la etiqueta group */
    function parseGroup(parent, xmlNode) {
        //The group element is used to define a group of elements to be used in complex type definitions.
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });
            if (xmlNode.attr("ref") != null && xmlNode.attr("name")) {
                throw 'Name and ref attributes cannot both be present'; //validación.. no voy a poner muchas.
            }
            var ref = xmlNode.attr("ref");
            if (ref != null) {
                //hace referencia a un grupo existente.
                var grupoExistente = _instance.getGroupByQname(ref);
                parent.ImportarGrupo(grupoExistente);
            }
            var name = xmlNode.attr("name");
            if (name != null) {
                //crea un grupo
                var nuevoGrupo = new Designer.Schema.XSD.AnyType(name);
                _targetNameSpace.GroupTable.put(name, nuevoGrupo);
                nuevoGrupo.IsComlexType = true;

                xmlNode.children(_xsd.getQName('sequence')).each(function (i) {
                    parseSequence(nuevoGrupo, $(this));
                });

                xmlNode.children(_xsd.getQName('choice')).each(function (i) {
                    parseChoice(nuevoGrupo, $(this));
                });

            }

        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo Group: ' + xmlNode[0].xml, ex);
        }
    }

    function parseChoice(parent, xmlNode) {
        /* XML Schema choice element allows only one of the elements contained in the <choice> declaration to be present within the containing element.*/
        //http://www.w3schools.com/schema/el_choice.asp
        //http://www.schemacentral.com/sc/xsd/e-xsd_group.html
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });
            
            var occurs = parseOccurs(xmlNode);
            parent.occurs = occurs;

            xmlNode.children(_xsd.getQName('element')).each(function (i) {
                parseElement(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('group')).each(function (i) {
                parseGroup(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('choice')).each(function (i) {
                parseChoice(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('sequence')).each(function (i) {
                parseSequence(parent, $(this));
            });
            xmlNode.children(_xsd.getQName('any')).each(function (i) {
                parseAny(parent, $(this));
            });




        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo Choice: ' + xmlNode[0].xml, ex);
        }
    }

    function parseElement(parent, xmlNode) {
        var element = null;
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });
            var name = xmlNode.attr("name");
            if (name != null && name != '') {
                element = new Designer.Schema.XSD.Element(name);
                element.Parent = parent;


                var type = xmlNode.attr("type");
                var occurs = parseOccurs(xmlNode);
                if (occurs.maxOccurs > 1) {
                    element.IsCollection = true;
                }
                if (type != null && type != '') {
                    element.Type = _instance.getTypeByQName(type, element, 'Type');
                } else {
                    //proceso los tipos simples
                    xmlNode.children(_xsd.getQName('simpleType')).each(function (i) {
                        element.Type = parseSimpleType(element, $(this));
                    });

                    //proceso los tipos complejos
                    xmlNode.children(_xsd.getQName('complexType')).each(function (i) {
                        element.Type = parseComplexType(element, $(this));
                    });
                    if (element.Type == null) { //si no se especifica el tipo, entonces tiene el tipo por defecto TOKEN
                        element.Type = _xsd.getDefaultType();
                    }
                }
            } else {
                throw "Bad XSD. El atributo name es obligatorio";
            }
        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo Element: ' + xmlNode[0].xml, ex);
        }
        return element;
    }

    function parseKeyRef() {
        //<keyref  id=ID name=NCName refer=QName any attributes/>
    }

    function parseAny(parent, xmlNode) {
        RaiseError('Nodo any no soportado: ' + xmlNode[0].xml, ex);
    }


    /*devuelve un objeto con la información sobre maxocurr y min ocurrs */
    function parseOccurs(xmlNode) {
        var maxOccurs = xmlNode.attr("maxOccurs");
        if (maxOccurs == null || minOccurs == '') {
            maxOccurs = 1;
        } else if (maxOccurs == 'unbounded') {
            maxOccurs = 99;
        }
        var minOccurs = xmlNode.attr("minOccurs");
        if (minOccurs == null || minOccurs == '') {
            minOccurs = 1;
        }

        return { maxOccurs: parseInt(maxOccurs), minOccurs: parseInt(minOccurs) };
    }

    function parseRestriction(parent, xmlNode) {
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });
            var base = xmlNode.attr("base");
            if (base != null) {
                parent.IsType = _instance.getTypeByQName(base, parent, 'IsType');

            }
            //TODO comprobar si es necesaria alguna de estas propiedades.
            //            xmlNode.children(_xsd.getQName('minExclusive')).each(function (i) {
            //                parseMinExclusive(simpleType, $(this));
            //            });
            //            xmlNode.children(_xsd.getQName('minInclusive')).each(function (i) {
            //                parseMinInclusive(simpleType, $(this));
            //            });
            //            xmlNode.children(_xsd.getQName('maxExclusive')).each(function (i) {
            //                parseMaxExclusive(simpleType, $(this));
            //            });
            //            xmlNode.children(_xsd.getQName('maxInclusive')).each(function (i) {
            //                parseMaxInclusive(simpleType, $(this));
            //            });
        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo Restriction: ' + xmlNode[0].xml, ex);
        }

    }

    function parseUnion(parent, xmlNode) {
        /* procesa el tipo simple como una union de tipos ejemplo numero text y el valor podría ser 34 - grande */
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });
            var memberTypes = xmlNode.attr("memberTypes");
            if (memberTypes != null) {
                var arr = memberTypes.split(' ');
                for (var i = 0; i < arr.length; i++) {
                    var baseType = _instance.getTypeByQName(arr[i]);
                    parent.SampleValue += ' ' + baseType.SampleValue;
                }
            }
        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo Union: ' + xmlNode[0].xml, ex);
        }
    }
    function parseList(parent, xmlNode) {
        try {
            xmlNode.children(_xsd.getQName('annotation')).each(function (i) {
                parseAnnotation(parent, $(this));
            });
            var base = xmlNode.attr("itemType");
            if (base != null) {
                var baseType = _instance.getTypeByQName(base);
                parent.SampleValue = baseType.SampleValue;
            }

        } catch (ex) {
            RaiseError('ocurrió un error al parsear el nodo List: ' + xmlNode[0].xml, ex);
        }

    }

    function parseAnnotation(parent, xmlNode) {
        /*<xs:annotation>
        <xs:appInfo>Aplicación</xs:appInfo>
        <xs:documentation xml:lang="en">
        This Schema defines a note!
        </xs:documentation>
        </xs:annotation>*/
        var appInfo = '';
        var documentation = '';
        xmlNode.children(_xsd.getQName('appInfo')).each(function (i) {
            appInfo = $(this).text();
        });
        xmlNode.children(_xsd.getQName('documentation')).each(function (i) {
            documentation = $(this).text();
        });
        parent.Annotation = { appInfo: appInfo, documentation: documentation };
    }

}

Designer.Schema.XSD.NameSpace = function (prefix, nameSpace) {
    var _instance = this;
    var _defaultType = null;
    this.NAMESPACE_URI = nameSpace;
    this.PREFIX = prefix;

    this.TypesTable = new Collection.HashMap();
    this.GroupTable = new Collection.HashMap();
    this.AttributeGroup = new Collection.HashMap();
    this.getDefaultType = function () {
        return _defaultType;
    }
    //inicializo la tabla de tipos primitivos de un documento XSD
    if (nameSpace == "http://www.w3.org/2001/XMLSchema") {
        //cargo la tabla de tipos
        this.TypesTable.put('boolean', new Designer.Schema.XSD.AnyType('boolean', 'true'));
        this.TypesTable.put('byte', new Designer.Schema.XSD.AnyType('byte', '127'));
        this.TypesTable.put('unsignedByte', new Designer.Schema.XSD.AnyType('unsignedByte', '255'));
        this.TypesTable.put('short', new Designer.Schema.XSD.AnyType('short', '32767'));
        this.TypesTable.put('unsignedShort', new Designer.Schema.XSD.AnyType('unsignedShort', '65535'));
        this.TypesTable.put('int', new Designer.Schema.XSD.AnyType('int', '2147483647'));
        this.TypesTable.put('nonPositiveInteger', new Designer.Schema.XSD.AnyType('nonPositiveInteger', '-2147483647'));
        this.TypesTable.put('negativeInteger', new Designer.Schema.XSD.AnyType('negativeInteger', '-2147483647'));
        this.TypesTable.put('unsignedInt', new Designer.Schema.XSD.AnyType('byte', '4294967295'));
        this.TypesTable.put('long', new Designer.Schema.XSD.AnyType('long', ' 9223372036854775807'));
        this.TypesTable.put('unsignedLong', new Designer.Schema.XSD.AnyType('unsignedLong', '18446744073709551615'));
        this.TypesTable.put('integer', new Designer.Schema.XSD.AnyType('integer', '123456'));
        this.TypesTable.put('decimal', new Designer.Schema.XSD.AnyType('decimal', '12557.32'));
        this.TypesTable.put('float', new Designer.Schema.XSD.AnyType('float', '16777216'));
        this.TypesTable.put('double', new Designer.Schema.XSD.AnyType('double', '900719925.45'));
        this.TypesTable.put('duration', new Designer.Schema.XSD.AnyType('duration', 'P0Y1347M'));
        this.TypesTable.put('dayTimeDuration', new Designer.Schema.XSD.AnyType('dayTimeDuration', 'P1DT2H'));
        this.TypesTable.put('yearMonthDuration', new Designer.Schema.XSD.AnyType('yearMonthDuration', 'P0Y20M'));
        this.TypesTable.put('dateTime', new Designer.Schema.XSD.AnyType('dateTime', '2002-10-10T17:00:00Z'));
        this.TypesTable.put('time', new Designer.Schema.XSD.AnyType('time', '05:00:25.999'));
        this.TypesTable.put('date', new Designer.Schema.XSD.AnyType('date', ' 2002-10-10-05:00'));
        this.TypesTable.put('gYearMonth', new Designer.Schema.XSD.AnyType('gYearMonth', '1999-10'));
        this.TypesTable.put('gYear', new Designer.Schema.XSD.AnyType('gYear', '1999'));
        this.TypesTable.put('gMonthDay', new Designer.Schema.XSD.AnyType('gMonthDay', '01-25'));
        this.TypesTable.put('gDay', new Designer.Schema.XSD.AnyType('gDay', '12'));
        this.TypesTable.put('gMonth', new Designer.Schema.XSD.AnyType('gMonth', '01'));
        this.TypesTable.put('string', new Designer.Schema.XSD.AnyType('string', 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,'));
        this.TypesTable.put('normalizedString', new Designer.Schema.XSD.AnyType('normalizedString', 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,'));
        _defaultType = new Designer.Schema.XSD.AnyType('token', 'Lorem ipsum');
        this.TypesTable.put('token', _defaultType);
        this.TypesTable.put('language', new Designer.Schema.XSD.AnyType('language', 'en-GB'));
        this.TypesTable.put('NMTOKEN', new Designer.Schema.XSD.AnyType('NMTOKEN', 'Lorem'));
        this.TypesTable.put('NMTOKENS', new Designer.Schema.XSD.AnyType('NMTOKENS', 'ABCD Lorem'));
        this.TypesTable.put('Name', new Designer.Schema.XSD.AnyType('Name', '_my.Element'));
        this.TypesTable.put('NCName', new Designer.Schema.XSD.AnyType('NCName', 'my-element'));
        this.TypesTable.put('ID', new Designer.Schema.XSD.AnyType('ID', 'my-element'));
        this.TypesTable.put('IDREF', new Designer.Schema.XSD.AnyType('IDREF', 'my-reference'));
        this.TypesTable.put('IDREFS', new Designer.Schema.XSD.AnyType('IDREFS', 'my-element1 my-element2'));
        this.TypesTable.put('ENTITY', new Designer.Schema.XSD.AnyType('ENTITY', 'ENTITY prod557a'));
        this.TypesTable.put('ENTITIES', new Designer.Schema.XSD.AnyType('ENTITIES', 'prod557a prod557b'));
        this.TypesTable.put('QName', new Designer.Schema.XSD.AnyType('QName', 'pre:myElement'));
        this.TypesTable.put('NOTATION', new Designer.Schema.XSD.AnyType('NOTATION', 'pre:myElement'));
        this.TypesTable.put('anyURI', new Designer.Schema.XSD.AnyType('anyURI', 'http://datypic.com/prod.html#shirt'));
        this.TypesTable.put('base64Binary', new Designer.Schema.XSD.AnyType('base64Binary', '0F+40A=='));
        this.TypesTable.put('hexBinary', new Designer.Schema.XSD.AnyType('base64Binary', '0FB80FB80FB8'));
    }
    else if (nameSpace == "http://www.w3.org/2001/XMLSchema-instance") {
        this.TypesTable.put('type', new Designer.Schema.XSD.AnyType('type', 'pre:myElement'));
        this.TypesTable.put('nil', new Designer.Schema.XSD.AnyType('nil', 'null'));
        this.TypesTable.put('schemaLocation', new Designer.Schema.XSD.AnyType('schemaLocation', 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.'));
        this.TypesTable.put('noNamespaceSchemaLocation', new Designer.Schema.XSD.AnyType('noNamespaceSchemaLocation', 'urn:example:org'));
    }
    else if (nameSpace == "http://ltcs.uned.es/lo") {
        this.TypesTable.put('TTitle', new Designer.Schema.XSD.AnyType('TTitle', 'Lorem ipsum dolor'));
        this.TypesTable.put('TText', new Designer.Schema.XSD.AnyType('TText', 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,'));
        this.TypesTable.put('TPath', new Designer.Schema.XSD.AnyType('TPath', 'node/node/resource'));
        this.TypesTable.put('TLocalReference', new Designer.Schema.XSD.AnyType('TLocalReference', 'urn:example:org'));
        this.TypesTable.put('TExternalReference', new Designer.Schema.XSD.AnyType('TExternalReference', 'http://datypic.com/prod.html#shirt'));
        this.TypesTable.put('TReference', new Designer.Schema.XSD.AnyType('TReference', 'example.org'));
        this.TypesTable.put('TLocalReference', new Designer.Schema.XSD.AnyType('TLocalReference', 'example.org'));
    }
    /*devuelve un qualified name para el valor pasado como parametro */
    this.getQName = function (value) {
        return _instance.PREFIX + '\\:' + value;
    }

    this.getTypes = function () {
        var arr = new Array();
        for (var i = 0; i++ < _instance.TypesTable.size; _instance.TypesTable.next()) {
            arr.push(_instance.TypesTable.value());
        }
        return arr;
    }
    this.ImportTypes = function (arrTypes) {
        jQuery.each(arrTypes, function (i, ttype) {
            if (!_instance.TypesTable.contains(ttype.Name)) {
                _instance.TypesTable.put(ttype.Name, ttype);
            }
        });
    }

}

Designer.Schema.XSD.AnyType = function (name, sampleValue) {
    this.Name = name;
    this.SampleValue = sampleValue;
    this.Print = function () {
        if (this.SampleValue == null) {
            throw "Any Type has no sample value.";
        } else {
            return this.SampleValue;
        }
    }
    this.ImportarGrupo = function (grupo) {
        $.each(grupo.Elements, function (i, element) {
            this.Elements.push(element);
        });
    }
    this.IsComlexType = false;
    
    this.IsChoice = false;
    this.Elements = new Array();
    this.Attributes = new Array();
    this.BaseType = null; /*tipo base */
    this.IsType = null; /* redefinición del tipo */
}

Designer.Schema.XSD.Element = function (name, elementType) {
    this.Name = name;
    this.Type = elementType;
    this.IsReference = false;
    this.ReferenceType = null;
    this.IsCollection = false;
    this.Parent = null;


    this.FindType = function (xpath) {
        var resultado = this.BaseType;
        //cs:checkSheet/cs:sheet/cs:header/cs:options/cs:option/cs:label
        var arrXpath = xpath.split('/');
        var prefix = '';
        var tmpName = arrXpath[0];
        var resto = xpath.substring(arrXpath[0].length + 1);

        if (tmpName.indexOf(':') > 0) {
            prefix = tmpName.split(':')[0];
            tmpName = tmpName.split(':')[1];
        }

        var tmpArrMatch = tmpName.match(/^[\w\d\_\@\-\.]*/);

        if (tmpArrMatch != null && tmpArrMatch.length > 0) {


            tmpName = tmpArrMatch[0]; //regexp para que seleccione solo el nombre del nodo sin operaciones ni nada
            if (this.Name == tmpName || tmpName == '.') {
                resultado = this.FindType(resto);
            } else if (tmpName == '..') {
                resultado = this.Parent.FindType(resto);
            } else {
                if (tmpName[0] == '@') {
                    //buscar en los attributos.
                    for (var i = 0; i < this.Type.Attributes.length; i++) {
                        if (this.Type.Attributes[i].Name == tmpName) {
                            resultado = this.Type.Attributes[i];
                            break;
                        }
                    }
                } else {
                    for (var i = 0; i < this.Type.Elements.length; i++) {
                        if (this.Type.Elements[i].Name == tmpName) {
                            resultado = resto == "" ? this.Type.Elements[i] : this.Type.Elements[i].FindType(resto);
                            break;
                        }
                    }
                }
            }

        }



        return resultado;
    }

}

//Designer.Schema.


/*
<xs:schema
   attributeFormDefault='qualified'
   elementFormDefault='qualified'
   targetNamespace='http://ltcs.uned.es/lo'
   xmlns:lo='http://ltcs.uned.es/lo'
   xmlns:xs='http://www.w3.org/2001/XMLSchema'>
  <xs:simpleType
     name='TTitle'>
    <xs:restriction
       base='xs:normalizedString'/>
  </xs:simpleType>

*/

/*
Designer.Schema.XSD.NAMESPACE_URI = 'http://www.w3.org/2001/XMLSchema';
Designer.Schema.XSD.PREFIX = 'xsd';
Designer.Schema.XSD.qname = function (localPart) {
    Designer.Util.Ensure.ensureString(localPart);
    return new Designer.XML.QName(Designer.Schema.XSD.NAMESPACE_URI, localPart,
			Jsonix.Schema.XSD.PREFIX);
};
Designer.XML.XSDType
*/
/*
Designer.Util.NumberUtils = {
	isInteger : function(value) {
		return Designer.Util.Type.isNumber(value) && ((value % 1) === 0);
	}
};*/

//Designer.Util.StringUtils = {
//	trim : function(str) {
//		Designer.Util.Ensure.ensureString(str);
//		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
//	},
//	isEmpty : function(str) {
//		return Designer.Util.StringUtils.trim(str).length === 0;
//	},
//	isBlank : function(str) {
//		return !Designer.Util.Type.exists(str) || Designer.Util.StringUtils.trim(str).length === 0;
//	},
//	isNotBlank : function(str) {
//		return Designer.Util.Type.isString(str) && Designer.Util.StringUtils.trim(str).length !== 0;
//	}
//};

/*
Designer.Util.Ensure = {
    ensureBoolean: function (value) {
        if (!Designer.Util.Type.isBoolean(value)) {
            throw 'Argument [' + value + '] must be a boolean.';
        }
    },
    ensureString: function (value) {
        if (!Designer.Util.Type.isString(value)) {
            throw 'Argument [' + value + '] must be a string.';
        }
    },
    ensureNumber: function (value) {
        if (!Designer.Util.Type.isNumber(value)) {
            throw 'Argument [' + value + '] must be a number.';
        }
    },
    ensureNumberOrNaN: function (value) {
        if (!Designer.Util.Type.isNumberOrNaN(value)) {
            throw 'Argument [' + value + '] must be a number or NaN.';
        }
    },
    ensureInteger: function (value) {
        if (!Designer.Util.Type.isNumber(value)) {
            throw 'Argument must be an integer, but it is not a number.';
        } else if (!Designer.Util.NumberUtils.isInteger(value)) {
            throw 'Argument [' + value + '] must be an integer.';
        }
    },
    ensureDate: function (value) {
        if (!(value instanceof Date)) {
            throw 'Argument [' + value + '] must be a date.';
        }
    },
    ensureObject: function (value) {
        if (!Designer.Util.Type.isObject(value)) {
            throw 'Argument [' + value + '] must be an object.';
        }
    },
    ensureArray: function (value) {
        if (!Designer.Util.Type.isArray(value)) {
            throw 'Argument [' + value + '] must be an array.';
        }
    },
    ensureFunction: function (value) {
        if (!Designer.Util.Type.isFunction(value)) {
            throw 'Argument [' + value + '] must be a function.';
        }
    },
    ensureExists: function (value) {
        if (!Designer.Util.Type.exists(value)) {
            throw 'Argument [' + value + '] does not exist.';
        }
    }
};*/
/*
Designer.Util.Type = {
    exists: function (value) {
        return (typeof value !== 'undefined' && value !== null);
    },
    isString: function (value) {
        return typeof value === 'string';
    },
    isBoolean: function (value) {
        return typeof value === 'boolean';
    },
    isObject: function (value) {
        return typeof value === 'object';
    },
    isFunction: function (value) {
        return typeof value === 'function';
    },
    isNumber: function (value) {
        return (typeof value === 'number') && !isNaN(value);
    },
    isNumberOrNaN: function (value) {
        return (value === +value) || (Object.prototype.toString.call(value) === '[object Number]');
    },
    isNaN: function (value) {
        return Designer.Util.Type.isNumberOrNaN(value) && isNaN(value);
    },
    isArray: function (value) {
        // return value instanceof Array;
        return !!(value && value.concat && value.unshift && !value.callee);
    },
    isDate: function (value) {
        return !!(value && value.getTimezoneOffset && value.setUTCFullYear);
    },
    isRegExp: function (value) {
        return !!(value && value.test && value.exec && (value.ignoreCase || value.ignoreCase === false));
    }
};*/