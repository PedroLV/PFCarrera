
//if (!Array.prototype.remove) {
	// Array Remove - By John Resig (MIT Licensed)
//    Array.prototype.remove = function (from, to) {
//        var rest = this.slice((to || from) + 1 || this.length);
//        this.length = from < 0 ? this.length + from : from;
//        return this.push.apply(this, rest);
//    };
//}
Designer.UI.ArrayListEditor = function (propertyType) {
	//editor de la propiedad tipo de esta lista. 
	var _propertyType = propertyType;
	var $editor = null;
	var _values = new Array();
	var _currentIndex = -1;
	var _$select = null;
	var _$msg;
	var _currentProperty;

	//HTML que forma el cuadro de diálogo.
	var _dialog = '<div class="editorPanel"  title="Lista de Valores"> \
			<form>\
			<fieldset>\
			<table cellpadding="3" cellspacing="0" border="0">\
				<tr>\
					<td style="width:170px"><label>Elementos</label></td>\
					<td style="width:24px"></td>\
					<td style="width:170px"><label>Propiedades</label></td>\
				</tr><tr><td style="vertical-align:top;">\
						<div style="float:left;vertical-align:top;">\
							<div class="fullwidth" style="vertical-align:top;">\
								<select multiple="multiple" title="Elementos de la lista" class="_select ui-widget-content ui-corner-all"></select>\
							</div>\
							<div class="fullwidth" style="padding-top:5px;">\
								<button  class="_dialogbtt" type="button" style="float:right;width:75px;" action="DELETE">Eliminar</button>\
								<button  class="_dialogbtt" type="button" style="float:right;width:75px;margin-right:5px;" action="ADD">Añadir</button>\
							</div>\
						</div>\
					</td>\
					<td style="width:24px;vertical-align:top;">\
						<div>\
							<img src="images/arrow_up_blue.png" class="_dialogbtt" alt="up" action="UP" />\
						</div>\
						<div  style="margin-top:10px">\
							<img src="images/arrow_down_blue.png" class="_dialogbtt" alt="down" action="DOWN" />\
						</div>\
					</td>\
					<td style="vertical-align:top;">\
						<div class="itemsPanel ui-widget-content ui-corner-all"></div>\
						<div class="fullwidth _alerta"></div>\
					</td></tr></table> </fieldset></form>\
					</div>';

	this.GetDialog = function () {
		$editor = $(_dialog);

		return $editor;
	}

	this.ShowValues = function (exp) {
		_values = JSON.parse(JSON.stringify(exp)); //clono los objetos, ya que hasta que no se presiona en aceptar, no se aceptan los cambios.
		_$select = $($editor.find('._select')[0]); //lista de elementos del editor.
		_$msg = $($editor.find('._alerta')[0]); //panel de mensajes.
		/* manejador del evento Selection change de la lista de elementos */

		for (var i = 0; i < exp.length; i++) {
			_$select.append($('<option></option>').val(i).html(_propertyType.TextToDisplay(exp[i])));
		}


		_$select.change(function (e) {
			doSelect(this.selectedIndex);

		});

		//Manejador de eventos para los botones. Por simplicidad, hay un único manejador y cada botón contiene una key con la acción que realiza.
		$editor.find('._dialogbtt').bind('click', function (evt) {

			var $btt = $(evt.target);
			var action = $btt.attr("action");

			if (action == "UP") {
				if (_currentIndex > 0) {
					var item = removeAt(_currentIndex);
					insertAt(item, _currentIndex - 1);
					$(_$select.children()[_currentIndex]).insertBefore($(_$select.children()[_currentIndex - 1]));
					doSelect(_currentIndex - 1);
				}
			}
			else if (action == "DOWN") {
				if (_currentIndex < _values.length - 1 && _currentIndex != -1) {
					var item = removeAt(_currentIndex);
					insertAt(item, _currentIndex + 1);
					$(_$select.children()[_currentIndex]).insertAfter($(_$select.children()[_currentIndex + 1]));
					doSelect(_currentIndex + 1);

				}

			} else if (action == "ADD") {
				_currentIndex = _values.length;
				_values.push(_propertyType.GetDefaultValue()); //añado un nuevo valor.
				ConfigureProperties(_values[_currentIndex]);
				_$select.find('option[selected="selected"]').each(function () {
					$(this).removeAttr("selected");
				});
				var txt = _propertyType.TextToDisplay(_values[_currentIndex]);
				_$select.append($('<option selected=\"selected\" title=\"' + txt + '\"></option>').val(_currentIndex).html(txt));

			} else if (action == "DELETE") {

				if (_currentIndex >= 0) {
					removeItem(_currentIndex);
				}
			}
		});


	}

	this.GetValues = function () {
		return _values;
	}

	this.Size = new Designer.Size(425, 405);

	function doSelect(index) {
		_currentIndex = index;
		_$select.find('option').each(function () {
			$(this).removeAttr("selected");
		});

		$(_$select.children()[_currentIndex]).attr('selected', 'selected');


		ConfigureProperties(_values[_currentIndex]);
	}

	/* configura las propiedades para el elemento que tengo seleccionado con el valor pasado como parámetro */
	function ConfigureProperties(exp) {

		var $propContainer = $($editor.find('.itemsPanel')[0]);
		$propContainer.empty();
		if (exp != null) {
			var mainProperties = new Designer.PropertyNodes.Category("Editor");
			_currentProperty = new Designer.ControlProperty(this, "Valor", _propertyType, null);
			mainProperties.AddProperty(_currentProperty, exp, "Valor");

			mainProperties.Render($propContainer, onPropertyUpdating,onPropertyShowEditor);

			Designer.Model.EventManager.ConfigureProperties($editor);

			/* expandir todas  las propiedades */
			Designer.Model.EventManager.ExpandAll($editor);
		}

	}

	function onPropertyUpdating(event) {
		var $target = $(event.target);
		var vindex = $target.attr("vindex");
		var pname = $target.attr("pname");
		var peditor = $target.attr("peditor"); //mal nombre, peditor contiene el path hasta la propiedad concreta al que pertenece este elemento.

		var currentValue = _values[_currentIndex]; //VALOR actual del elemento que estoy editando.
		var property = _currentProperty.GetProperty(peditor);
		var newValue = $target.val(); //NUEVO valor del editor que ha levantado el evento.

		if (pname != null && pname.indexOf('.') > 0) {
			arrPropName = pname.split('.'); //obtenemos el array 
			for (var i = 1; i < arrPropName.length; i++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
				currentValue = currentValue[arrPropName[i]];
			}
		}

		if (newValue != currentValue) {
			if (!property.PropertyType.Validate(newValue)) {
				//el valor introducido no es correcto. Avisar al usuario y restaurar el valor anterior.
				$target.val(currentValue);
				$target.addClass("ui-state-error");
				_$msg.text(("El valor introducido en la propiedad {0} no es correcto. {1}").format(pname, property.PropertyType.Description));
				_$msg.addClass("ui-state-highlight");
				setTimeout(function () {
					_$msg.removeClass("ui-state-highlight", 1500);
				}, 500);

				return false;
			} else {
				//asigno el valor que ha introducido el usuario a la subpropiedad de la propiedad
				if (pname != null && pname.indexOf('.') > 0) {

					var arrPropName = pname.split('.'); //obtenemos el array 
					var tmp = _values[_currentIndex];
					for (var i = 1; i < arrPropName.length; i++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
						if (i == arrPropName.length - 1) {
							tmp[arrPropName[i]] = newValue;
						} else {
							tmp = tmp[arrPropName[i]]; //voy buscando el miembro que realmente quiero establecer.
						}
					}

				} else {
					_values[_currentIndex] = newValue;
				}

				_currentProperty.PropertyType.SetValue(_values[_currentIndex]); //refresco todo el arbol de propiedades.

				_$select.children('option:selected').text(_currentProperty.PropertyType.TextToDisplay(_values[_currentIndex]));
				_$msg.text('');
				$target.removeClass("ui-state-error");
			}
		}

	}

	function onPropertyShowEditor(event) {
		var $btt = $(event.target);
		var vindex = $btt.attr("vindex");
		var pname = $btt.attr("pname");
		var peditor = $btt.attr("peditor");

		var property = _currentProperty.GetProperty(peditor);
		var currentValue = _values[_currentIndex]; //VALOR actual del elemento que estoy editando.
        if (pname != null && pname.indexOf('.') > 0) {
			arrPropName = pname.split('.'); //obtenemos el array 
			for (var i = 1; i < arrPropName.length; i++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
				currentValue = currentValue[arrPropName[i]];
			}
		}
		var $d = property.PropertyType.Site.GetDialog();

		$d.dialog({
		height: property.PropertyType.Site.Size.Height
		, width: property.PropertyType.Site.Size.Width
		, autoOpen: false
		,  resizable: false
		, zIndex: 900
		, modal: true
			, open: function (event, ui) {
				$('.ui-widget-overlay').bind("click" ,function() { $d.dialog("close"); });
			}
		, close: function (event, ui) {
			   
			}
		, buttons: {
				"Aceptar": function () {
						
						$(this).dialog("close");
                        var newValue = property.PropertyType.Site.GetValues();
                        if (pname != null && pname.indexOf('.') > 0) {

					        var arrPropName = pname.split('.'); //obtenemos el array 
					        var tmp = _values[_currentIndex];
					        for (var i = 1; i < arrPropName.length; i++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
						        if (i == arrPropName.length - 1) {
							        tmp[arrPropName[i]] = newValue;
						        } else {
							        tmp = tmp[arrPropName[i]]; //voy buscando el miembro que realmente quiero establecer.
						        }
					        }

				        } else {
					        _values[_currentIndex] = newValue;
				        }

				        _currentProperty.PropertyType.SetValue(_values[_currentIndex]); //refresco todo el arbol de propiedades.

						_$select.children('option:selected').text(_currentProperty.PropertyType.TextToDisplay(_values[_currentIndex]));
				        _$msg.text('');
				        
					
				},
				"Cancelar": function () {
					$(this).dialog("close");
				}
			},
		});

		$d.dialog("open");
		$("._dialogbtt").button();
		property.PropertyType.Site.ShowValues(currentValue);
		
	}

	function removeItem(from, to) {
		var rest = _values.slice((to || from) + 1 || _values.length);
		_values.length = from < 0 ? _values.length + from : from;
		_values.push.apply(_values, rest);

		_$select.children('option:selected').remove();
		ConfigureProperties(null);

		_currentIndex = -1;
	}

	function insertAt(vItem /*:variant*/, iIndex /*:int*/) /*:variant*/{


		_values.splice(iIndex, 0, vItem);

	}

	function removeAt(iIndex /*:int*/) /*:variant*/{


		var vItem = _values[iIndex];
		if (vItem) {
			_values.splice(iIndex, 1);
		}
		return vItem;

	}

}

Designer.UI.ColorEditor = function () {
	//editor de la propiedad tipo de esta lista. 
	
	var $editor = null;
	var _value = new String();
   

	//HTML que forma el cuadro de diálogo.
	var _dialog = '<div class="editorPanel"  title="Selección de color"> \
			 <p id="colorpickerHolder"></p>\
					</div>';

	this.GetDialog = function () {
		$editor = $(_dialog);

		return $editor;
	}

	this.ShowValues = function (exp) {


		$($editor.find('#colorpickerHolder')[0]).ColorPicker({
			flat: true
			,color: (exp != null && exp != '') ? exp : '#000000'
			, onChange: function (hsb, hex, rgb) {
				_value = '#' + hex;
			}    
				 });

	}

	this.Size = new Designer.Size(380, 290);

	this.GetValues = function () {
		return _value;
	}

   

}

Designer.UI.RichTextEditor = function () {
	//editor de la propiedad tipo de esta lista. 
	
	var $editor = null;
	var _arr = null;
    var _text = null;
   

	//HTML que forma el cuadro de diálogo.
	var _dialog = '<div class="editorPanel"  title="Editor de texto"> \
			                    <textarea  cols="83" rows="24"  class="rte1" method="post" action="#"></textarea> \
					</div>';

	this.GetDialog = function () {
		$editor = $(_dialog);

		return $editor;
	}

	this.ShowValues = function (exp) {

       _text = $editor.children('.rte1');
       
//        _arr.rte({
//		    controls_rte: rte_toolbar,
//		    controls_html: html_toolbar
//	        }, _data);
            _arr = new lwRTE ( $(_text[0]), {
            width: 450,
		    height: 300,
		    controls_rte: rte_toolbar,
		    controls_html: html_toolbar
	        }
            );
            _arr.set_content(exp);

	}

	this.Size = new Designer.Size(500, 500);

	this.GetValues = function () {
        
		return _arr.get_content();
	}
}

Designer.UI.FileChooser = function () {
	//selector de ficheros. Depende de Designer.oData 
	
	var $editor = null;
	var _seleccion = null;
    var _arrFicheros = null;
    var _resourceType = null;
    
   

	//HTML que forma el cuadro de diálogo.
	var _dialog = '<div class="editorPanel"  title="Selección de Fichero"> \
			                    <div id="listPanel" class="listaFicheros"> </div> \
					</div>';

	this.GetDialog = function () {
		$editor = $(_dialog);

		return $editor;
	}

	this.ShowValues = function (exp) {
        var cliente = new Designer.oData.Client(Designer.Config.DesignerServerURL);
        _seleccion = null;
        _resourceType= exp.ResourceType;
        cliente.GetList(exp.ResourceType, DisplayFiles, null, false);
      
	}

    function DisplayFiles(lista){
        var listPanel = $editor.children('#listPanel');
        var tablaFicheros = new String();
        tablaFicheros += "<table width='100%' cellpadding='3' cellspacing='0' border='0'><thead class='ui-widget-header'><tr><th></th><th>Nombre</th><th>Descripción</th></tr></thead><tbody>";
        _arrFicheros = lista;
        jQuery.each(lista, function (i, file) {
                
             //("<div class='fileListentry'><img src='images/text_code_colored.png' alt='file' /><span>{0}</span></div>").format(file.FileName)
             tablaFicheros += ("<tr><td><img src='images/text_code_colored.png' alt='file' /></td><td>{0}</td><td>{1}</td></tr>").format(file.FileName, file.Description);
        
        });
        tablaFicheros += "</tbody></table>";

        var $table = $(tablaFicheros);

        $table.find('tbody > tr').click(function() {
            var tableRow = $(this) ;
            $table.find('tbody > tr').removeClass("_selected");
            $(this).toggleClass("_selected");

            arr = jQuery.grep(_arrFicheros, function(recurso, i){
              return (recurso.FileName == tableRow.children()[1].innerHTML);
            });
            if(arr != null && arr.length > 0){
            _seleccion = arr[0];
            }

        
        }).dblclick(function() {

            var tableRow = $(this) ;

            arr = jQuery.grep(_arrFicheros, function(recurso, i){
              return (recurso.FileName == tableRow.children()[1].innerHTML );
            });

            if(arr != null && arr.length > 0){
                _seleccion = arr[0];
            }
            Designer.Model.EventManager.DialogOKClose();
        });

        listPanel.append($table);

       
    }

	this.Size = new Designer.Size(500, 500);

	this.GetValues = function () {
        if(_seleccion != null){
		    return new Designer.Resource(_seleccion.FileURL,_resourceType );
        }
        else{
            return new Designer.Resource('',_resourceType );
        }
		
	}
}


Designer.UI.DataMemeberTreeEditor = function (propertyType) {
	//editor de la propiedad tipo de esta lista. 
	
	var _propertyType = propertyType;
	var $editor = null;
	
    var _dataSourceControl= null;
    var _seleccion = null; 
   

	//HTML que forma el cuadro de diálogo.
	var _dialog = '<div class="editorPanel"  title="Selección de Nodo"> \
			                    <div id="seleccion" class="" style="clear:both"><input id="_nameSpace" type="text" maxlength="3" class="" style="width:4%;float:left;" value="cs"/> \
                                <input id="_selection" type="text" maxlength="750" class="ui-state-highlight" style="width:92%;float:left;margin-left:1%;min-height:15px" value="pinche en un nodo"/> </div> \
                                <div id="listPanel" class="fondoComunEditor" xPath="__root"> </div> \
					</div>';

	this.GetDialog = function () {
		$editor = $(_dialog);

		return $editor;
	}

	this.ShowValues = function (exp, property, control) {
        var dataSource = null;
        _seleccion = null;
        //cuando se trata de seleccionar un miembro, hay que acceder al árbol de miembros.
        var propertySource = _propertyType.GetValidSource(); //buscamos la propiedad que referencia al origen de datos.
        
        //assert
        if(propertySource == null){
            Designer.Model.EventManager.HandleMessage(("No se encontró un origen de datos para la propiedad \"{0}\".").format(property.GetFullName()), null, Enum.MessageType.Error);
            return false;
        }
        if(control == null){
            Designer.Model.EventManager.HandleMessage(("No se encontró el control propietario para la propiedad \"{0}\".").format(property.GetFullName()), null, Enum.MessageType.Error);
            return false;
        }
        //obtenemos el control que representa el origen de datos.
        var controlName = control.GetPropertyValue(propertySource.GetFullName());
        if(controlName == null){
            Designer.Model.EventManager.HandleMessage(("Error, no se ha establecido el origen de datos (Propiedad Source) \"{0}\".").format(propertySource.GetFullName()), null, Enum.MessageType.Warning);
            return false;
        }
        var Arr_dataSource = Designer.Model.ControlManager.getControls( function(c) { return c.ID == controlName;} );
        if(Arr_dataSource == null || Arr_dataSource.length == 0 || Arr_dataSource.length > 1){
            Designer.Model.EventManager.HandleMessage(("Error, no se encontró el control {0} origen de datos para poder establecer un miembro.").format(controlName), null, Enum.MessageType.Error);
            return false;
        }
        _dataSourceControl = Arr_dataSource[0];
        var resource = _dataSourceControl.GetPropertyValue('Schema'); //
        if(resource == null){
            Designer.Model.EventManager.HandleMessage(("Error, el control {0} no tiene la propiedad schema configurada o bien no es un origen de datos válido.").format(controlName), null, Enum.MessageType.Warning);
            return false;
        } 
        if(resource.ResourceURL == null || resource.ResourceURL == ''){
            Designer.Model.EventManager.HandleMessage(("Error, el control {0} no tiene la propiedad schema configurada o bien no es un origen de datos válido.").format(controlName), null, Enum.MessageType.Warning);
            return false;
        } 
        if(_dataSourceControl.Cache == null){
            //genero el arbol de nodos, ya que no se ha generado todavía.
            LeerXSD(resource.ResourceURL);
        }else{
            printResultados(_dataSourceControl.Cache);
        }

        _seleccion = $($editor.find("#_selection")[0]);
        _seleccion.val(exp);
	}

	this.Size = new Designer.Size(480, -1);//-1 auto.

	this.GetValues = function () {
        
        if(_seleccion != null){
		    return _seleccion.val();
        }
        else{
            return null;
        }
	}

     function LeerXSD(url) {
            Designer.Model.EventManager.HandleMessage(("Analizando fichero XSD. {0}").format(url), null, Enum.MessageType.Info);
            var parser = new Designer.Schema.XSDParser(); //crea una nueva instancia de un XSDParser y

            parser.OpenXSD(url, function(d) { printResultados(d);Designer.Model.EventManager.HandleMessage("Análisis finalizado.", null, Enum.MessageType.Info);}, printFallo);

     }
     function printFallo(error){
        Designer.Model.EventManager.HandleMessage(error, null, Enum.MessageType.Error);
     }

    function printResultados(elementos) {
        if(_dataSourceControl.Cache == null){
            _dataSourceControl.Cache = elementos;
        }
        var listPanel = $editor.children('#listPanel');
        var elementTemplate = $(getNodeTemplate());
        listPanel.append(elementTemplate);
        jQuery.each(elementos, function (index, e) {
            try {
                elementTemplate.tmpl(e).appendTo(listPanel);
            } catch (ex) 
            {
                Designer.Model.EventManager.HandleMessage("Error parseando XSD.", ex, Enum.MessageType.Error);
            }
        });
        

        listPanel.find("._connImg").bind("click", function (element) {
            var me = $(element.target);

            var nodosHijos = me.parent().parent().next("._collapseBox");
            if (nodosHijos.length != 0) {
                if (me.attr("class").indexOf("_connExpanded") > 0) {
                    //collapse node
                    nodosHijos.removeClass("_visible");
                    nodosHijos.addClass("_noVisible");
                } else {
                    //epand node
                    nodosHijos.removeClass("_noVisible");
                    nodosHijos.addClass("_visible");
                }
            }



            me.toggleClass("_connExpanded");
        });

        listPanel.find(".element_attr").bind("click", doSeleccion).bind("dblclick", doSeleccionAndClose);

        listPanel.find(".element_item").bind("click", doSeleccion).bind("dblclick", doSeleccionAndClose);
    }

    function doSeleccionAndClose(element){
        doSeleccion(element);
        Designer.Model.EventManager.DialogOKClose();
    }

    function doSeleccion(element){
         var me = $(element.target);
        var tmp = me.attr("xPath");
        var tmpNode = me.parent();
        var resultado = tmp; //el resultado es el nodo hoja.
        var flg = true;
        while (flg ) {
            if(tmpNode == null){
                flg = false; //salida forzada del bucle
            } else{
            tmp = tmpNode.attr("xPath");
            if(tmp != null &&  tmp != '__root'){
                resultado = tmp + '/'  + resultado; 
            }else{
                flg = (tmp == null || tmp != '__root');
            }
            tmpNode = tmpNode.parent();
            }
        }

        
        var nameSpace = $($editor.find("#_nameSpace")[0]).val();
        if(nameSpace != ''){
            nameSpace += ':';
        }
        _seleccion.val(resultado.format(nameSpace));
    }

    function getClass(eType, isCollection) {
            if (isCollection){
                return 'Tcollection';
            } else if (eType.IsComlexType) {
                return 'Tcomplex';
        } else {
            return 'Tsimple';
        }
    }

   function getNodeTemplate(){
        return '<script id="ElementTemplate" type="text/x-jquery-tmpl"> <div> \
                <div class="_element" > \
                <div class="element_node"> \
                    <div class="element_conector">{{if Type.Elements.length > 0}}<img class="_connImg _connExpanded" src="css/xsdSelector/images/noImg.png"/>{{/if}} </div> \
                    <div class="element_name_ct"> \
                        <div class="element_item ${Designer.Util.getClass(Type,IsCollection)}" xPath="{0}${Name}"> \
                            ${Name} \
                        </div> \
                    </div> \
                    <div class="element_attr_ct" xPath="{0}${Name}"> \
                        {{each Type.Attributes}}  \
						     <div class="element_attr" xPath="@{0}${Name}"> \
                                ${Name} \
                            </div>	 \
						{{/each}} \
                    </div> \
                </div> \
                {{if Type.Elements.length > 0}} \
                    <div class="_collapseBox" xPath="{0}${Name}"> \
                        {{each Type.Elements}}  \
                            <div class="element_body"> \
                                <table border="0" cellpadding="0" cellspacing="0" class="element_body"> \
                                    <tr> \
                                        <td width="30px"><div class="element_line"></div></td> \
                                        <td > \
                                            <div class="element_childs _collapseBox"> \
                                                {{tmpl($value) "#ElementTemplate"}} \
                                            </div> \
                                        </td> \
                                    </tr> \
                                </table> \
                            </div> \
                        {{/each}} \
                    </div> \
                {{/if}}  \
            </div> \
            </div></script>';

   }

}
