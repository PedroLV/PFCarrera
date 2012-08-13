/* Depends:
*	Control.js
*   EventManager.js
*   jQuery JavaScript Library v1.6.2
*   Designer.oData.Base64Util
*/


 /**
     * Modela el gestor de controles del diseñador.
     * 
     * @param {String} props_container Nombre del contenedor donde se mostraran las propiedades del control o controles seleccionados.
     * See: {@link jsDate.formats}.
     * @returns {String} Date String.
     */

Designer.ControlManager = function (props_container) {

    var _instance = this;
    /* control manager mantiene la lista de controles que están en el diseñador
    * la primera lista es la lista general de controles
    */
    var _controls = new Collection.HashMap();

    var _deletedControls = new Array(); //contiene la lista de elementos eliminados.

    var $propContainer = $(props_container);

    var _selection = new Collection.List(); // es la lista de controles seleccionados.

    var tmpuiID = -1;

    var currentZ = 1; //es del maximo z-index

    var dragEvt = null; //evento de cambio de posicion

    var resizeEvt = null; //evento de cambio de tamaño

    var _Properties = new Array(); // lista de propiedades que se muestran en pantalla.

    var _cacheSelection = null; //Array que cachea la lista de controles seleccionados.

    /* Crea un nuevo control del tipo pasado como parametro en el descriptor. 
    Devuelve un nuevo objeto de tipo Control.
    initialValues tendrá valor cuando se genere el control desde un fichero.
    */
    this.RegisterControl = function (descriptor,initialValues) {

        var $myControl = $(descriptor.GetDesigner.DesignTimeHtml); //instancio el nodo HTML que representará el control en pantalla.

        descriptor.onInit($myControl); //El descriptor establece la configuración inicial del elemento en pantalla
        var uiID = "0";

        var c = new Designer.Control(descriptor); //creo un nuevo control

        if(initialValues != null){
            var uiID = initialValues.uiID;
            indexManager.UpdateID(uiID);
            c.ID = initialValues.ID; //establezco el nombre del elemento dentro del diseñador.
            
        }else{
            uiID = indexManager.GetNewID();
            c.ID = getTemporalName(descriptor); //establezco el nombre del elemento dentro del diseñador.
        }

        $myControl.attr("uiID", uiID); //uiID es el id interno que asocia el elemento de pantalla con el objeto de tipo control que modela el elemento de pantalla.
        c.uiID = uiID; //establezco el id interno para este elemento
        //creo el objeto que representará el elemento de pantalla
        //var c = factory(descriptor.ToolBoxInfo.Name); //crea una nueva instancia del control.
        
        /*establezco las propiedades iniciales que dependen del diseñador */
        
        
        c.$element = $myControl; //establezco el elemento de pantalla asociado a este control.
        c.IsValid = true; //cuando lo creo, pongo el flag a isValid.

        if (c.ControlDescriptor.Properties != null && c.ControlDescriptor.Properties.length > 0) {
            //inicializo las propiedades por defecto.
            if(initialValues == null){
                for (var z = 0; z < c.ControlDescriptor.Properties.length; z++) {
                    c.ProperyValues.push(c.ControlDescriptor.Properties[z].PropertyType.GetDefaultValue());
                }
            }else{
                for (var z = 0; z < c.ControlDescriptor.Properties.length; z++) {
                    var valorGuardado = initialValues[c.ControlDescriptor.Properties[z].Name];
                    c.ProperyValues.push(valorGuardado);
                }
            }
            
        }

        jQuery.each(c.ControlDescriptor.Properties, function (i, property) {
                
                if (property.PropertyType.HasCss()) {
                    c.UpdateCss(property, c.GetPropertyValue(property.Name)); //actualiza el control en el diseñador.
                }
                
                if (property.PropertyType.CheckHtmlContent()) {
                    c.RenderHtml(property, c.ProperyValues[i], property.PropertyType.RenderTarget); //actualiza el contenido del control
                }

            });
       

        _controls.put(uiID, c); //añado el control recien creado 

        return c;
    }

    /* Current design. Almacena en memoria la información de persistencia que se envía al servidor. */
    this.CurrentFile = null;


    /*
    Esta función serializa el diseño en un string de objetos JSON
    */
    this.SerializateDesign = function(){
        var resultado = new String();
        //El primer objeto contiene metadatos del diseño
        resultado = '[{"version":1 }';

        //recorro todos los controles y los voy serializando
        for (var i = 0; i++ < _controls.size; _controls.next()) {
            var ctr = _controls.value();
            resultado +=',' + ctr.toJSONString();
        }
        resultado+="]";
        return Designer.oData.Base64Util.encode(resultado);
    }

    /*
    Esta función desSerializa el diseño contenido en Designer.Model.ControlManager.CurrentFile y lo carga en el diseñador.
    */
    this.LoadDesign = function(){
        if(Designer.Model.ControlManager.CurrentFile == null){
            Designer.Model.EventManager.HandleMessage("No se seleccionó ningún fichero para cargar.", null, Enum.MessageType.Warning);
            return false;
        }
        
        var datos = Designer.oData.Base64Util.decode( Designer.Model.ControlManager.CurrentFile.Data);
        var arr = null;
        try{
            arr = jQuery.parseJSON( datos );
        }catch(ex){
            Designer.Model.EventManager.HandleMessage(("Error parsing json data {0}.").format(Designer.Model.ControlManager.CurrentFile.FileName), ex, Enum.MessageType.Error);
            return;
        }
        
        //1- Limpiar Diseñador.
        _controls.removeAll();
        _deletedControls = new Array();
        _selection.removeAll();
        _Properties = new Array();
        $propContainer.empty();
        tmpuiID = -1;currentZ = 1;
        _cacheSelection = null;
        Designer.Model.Grid.Clear();
        Designer.Model.DataSources.Clear();

        if(arr != null){
        try{
            var metadatos = arr[0]; //siempre hay metadatos.
            for(var i = 1; i < arr.length; i++){
                var s = arr[i];
            
            
                var nuevoControl = toolBoxManager.CreateControl(s.ControlDescriptor,s);


				Designer.Model.Grid.$element.append(nuevoControl.$element); //se añade al grid

				//inicializa el control con respecto al Designer.Model.Grid.
				Designer.Model.ControlManager.doEvent(Enum.Events.Load, nuevoControl.$element, s, Designer.Model.Grid); //genera el evento para que el controlManager se entere de que el control está creado.
            }

            for(var i = 1; i < arr.length; i++){
                var s = arr[i];
                var c = _controls.get(s.uiID); //obtengo el objeto que representa este control.
                if(s.ParentuiID >= 0){
                    c.ParentControl = _controls.get(s.ParentuiID);
                }else{
                    c.ParentControl = Designer.Model.Grid;
                }
                //en función del padre y del control, pueden pasar 3 cosas:
                if(c.ControlDescriptor.Settings.IsDataSource == true){
                    //1º El control es de tipo DataSource. Este control debe posicionarse en el área destinada a los controles de datos.
                    c.ParentControl = Designer.Model.DataSources;
                    c.$element.addClass("_isDatasource");
                }

                c.ParentControl.AddControl(c, true) //añado el elemento a la colección del padre.
            }

            /*
            //Deteccion del padre en base a la posición de arrastre del control.
            var tmpParent = this.HitTest(c, uiEvent, $element, control);//En el evento INIT el parámetro control contiene el elemento Parent.

            
            */

            Designer.Model.EventManager.HandleMessage(("Diseño {0} v{1} cargado con éxito.").format(Designer.Model.ControlManager.CurrentFile.FileName,metadatos.version), null, Enum.MessageType.Info);
        }catch(ex){
            Designer.Model.EventManager.HandleMessage(("Error cargando diseño {0}.").format(Designer.Model.ControlManager.CurrentFile.FileName), ex, Enum.MessageType.Error);
        }
        }
    }


    /*
    * evtName : nombre del evento
    * $element: objeto que representa el control con todas sus propiedades, su descriptor, etc.
    * uiEvent: datos el evento.
    * Control al que se refiere el evento: datos el evento.
    */
    this.doEvent = function (evtName, $element, uiEvent, control) {
        
        if (evtName == Enum.Events.Init) {
            //En el evento INIT control contiene al Designer.Model.Grid.
            //Posicion Inicial. OJO la posición incial es ABSOLUTA con respecto a la pantalla.
            //Para la posición relativa restamos a la posición Absoluta, la el OffSet del grid

            //1. Establecemos las coordenadas originales donde el usuario suelta el control.
            $element.css({ "position": "absolute", "top": (uiEvent.offset.top - control.OffSet.Top) + "px", "left": (uiEvent.offset.left - control.OffSet.Left) + "px", "z-index:": currentZ });
            currentZ++;

            var c = getControlFromElement($element);

            c.Initializate();

            //Deteccion del padre en base a la posición de arrastre del control.
            var tmpParent = this.HitTest(c, uiEvent, $element, control);//En el evento INIT el parámetro control contiene el elemento Parent.

            c.ParentControl = tmpParent;

            //en función del padre y del control, pueden pasar 3 cosas:
            if(c.ControlDescriptor.Settings.IsDataSource == true){
                //1º El control es de tipo DataSource. Este control debe posicionarse en el área destinada a los controles de datos.
                c.ParentControl = Designer.Model.DataSources;
                c.$element.addClass("_isDatasource");
            }

            //2º Padre contenedor de tipo FlowLayout. El control debe fluir dentro del padre.
            //3º Padre con posicionamiento absoluto
            c.ParentControl.AddControl(c, true) //añado el elemento a la colección del padre.

//            if(c.ControlDescriptor.Settings.PositionMode == Enum.PositionMode.FlowLayout){
//             //los controles de tipo flowLayout tienen que ser selectables.
//                c.ControlDescriptor.GetContent(c.$element).selectable(
//                {
//					
//					selected: function (event, ui) {
//                        event.stopPropagation();
//						consola.Log("INNER SELECT --> " +event.type + ' : ' + $(ui.selected).attr("uiID"));

//						Designer.Model.ControlManager.Select($(ui.selected));
//					}
//					,
//					unselected: function (event, ui) {
//                        event.stopPropagation();
//						consola.Log("INNER UNSELECT --> " + event.type + ' : ' + $(ui.unselected).attr("uiID"));

//						Designer.Model.ControlManager.UnSelect($(ui.unselected),false);
//					}
//					,
//					filter: '._ctrGrid' //solo se pueden seleccionar los elementos que tengan esa clase.
//				}

//                );
//            }

        }
        else if (evtName == Enum.Events.Move) {
            //tengo que actualizar o bien la propiedad de la zona de propiedades, o bien el estado del objeto.
            if (_selection.length == 1) {  //solo con selección simple.
                if (_Properties != null && _Properties.length > 0) {
                    var positionProperty = jQuery.grep(_Properties, function (prop, i) {
                        return (prop.Name == 'Position');
                    })[0];

                    if (positionProperty != null) {
                        positionProperty.PropertyType.SetValue(control.Position);
                    }
                }
            }
        }
        else if (evtName == Enum.Events.Resize) {
            //tengo que actualizar o bien la propiedad de la zona de propiedades, o bien el estado del objeto.
            if (_selection.length == 1) {  //solo con selección simple.
                if (_Properties != null && _Properties.length > 0) {
                    var sizeProperty = jQuery.grep(_Properties, function (prop, i) {
                        return (prop.Name == 'Size');
                    })[0];

                    if (sizeProperty != null) {
                        sizeProperty.PropertyType.SetValue(control.ClientSize);
                    }
                }
            }

        }
        else if (evtName == Enum.Events.Load) {
            //Carga desde fichero.
            $element.css({ "position": "absolute", "top": (uiEvent.Position.Top) + "px", "left": (uiEvent.Position.Left ) + "px", "z-index:": uiEvent.currentZ });
            currentZ = currentZ + 10;

            var c = getControlFromElement($element);

            c.Initializate(uiEvent);

        }

    }
    //* Devuelve la posición relativa del elemento hijo con respecto a su elemento padre. */
    function getRelativePosition(parent, top, left) {

        //la posicion relativa, es una posición relativa a la posición que tendría que tener con posicionamiento estático.
        return new Designer.Position(top - parent.Position.Top, left - parent.Position.Left);
    }

    this.Select = function ($element) {
        _cacheSelection = null;
        var uiID = $element.attr("uiID");
        if(uiID){//solo se puede seleccionar aquello que tenga uiID
        if (_selection.contains(uiID)) {
            //si ya lo contiene es que ya está seleccionado.

        } else {
            /*pongo el elemento a dragable */
            var c = _controls.get(uiID); //obtengo el objeto que representa este control.

            $element.draggable({
                containment: c.ParentControl.$element,
                scroll: false,
                cursor: "move",
                delay: 200,
                start: StatDrag,
                stop: StopDrag, //método que se ejecutará cuando se mueva un control.
                drag: onDragging
            });
            if(!c.ControlDescriptor.Settings.IsDataSource){
            $element.resizable({
                //alsoResize: $element.children()[0],
                autoHide: true
                , containment: c.ParentControl.$element
                , grid: Designer.Model.Grid.GridSize
                , handles: c.ControlDescriptor.Settings.GetResizeToken()
                , start: StatResize
                , stop: StopResize //método que se ejecutará cuando se haga un resize un control.
                //, resize: onResizing
            }); //resizable dentro de su padre.
            }

            _selection.push(uiID); //meto el identificador del control como selecionado.

            UpdateProperties(_selection);

            Designer.Model.EventManager.ConfigureProperties();
        }
        }

    }

    this.UnSelect = function ($element, noUpdate) {
        _cacheSelection = null;
        if(jQuery.isFunction($element)){
            jQuery.each(_selection, function (i, uiID) {
                var c = _instance.getControlByuiID(uiID);
                if($element(c)){
                    
                    c.$element.draggable("destroy");
                    c.$element.resizable("destroy");
                    _selection.remove(uiID); //elimino el control.
                }
            });
                
        }else{

            var uiID = $element.attr("uiID");
            if(uiID){//solo se puede desseleccionar aquello que tenga uiID
            if (_selection.contains(uiID)) {
                //si ya lo contiene es que ya está seleccionado.
                $element.draggable("destroy");
                $element.resizable("destroy");
                _selection.remove(uiID); //elimino el control.
            }
            }
        }
        if( noUpdate == false){
            UpdateProperties(_selection);
        }
    }

    /*Devuelve el contenedor que se encuentra debajo de las coordenadas indicadas en el evento*/
    /*Si el elemento que se encuentra debajo, no es un contenedor, no se tendrá en cuenta*/
    this.HitTest = function (c, uiEvent, $element) {
        var resultado = null;
        //var uiID = $element.attr("uiID");
        //recorro todos los controles buscando un contenedor. Cuando lo encuentro determino si está debajo de donde suelto el control.
        for (var i = 0; i++ < _controls.size; _controls.next()) {
            var ctr = _controls.value();
            if (ctr.uiID != c.uiID && ctr.ControlDescriptor.Settings.IsContainer) {
                //si estoy dentro del contenedor, entonces lo selecciono en los siguientes casos:
                // 1. no tengo ningúno seleccionado
                //2. Tengo un candidato, pero existe uno con z-index mayor.
                if (ctr.GetContainerBounds().InBounds(c.GetBounds()) && (resultado == null || resultado.GetZIndex() < ctr.GetZIndex())) {
                    resultado = ctr;
                }
            }
        }
        if (resultado == null) {
            resultado = Designer.Model.Grid; //ES OBLIGATORIO QUE EXISTA esta variable.
        }

        return resultado;
    }

    this.DeleteSelectedControls = function(){

        var tmpSeleccion = this.GetSelectedControls(); //genera el array con los controles seleccionados
        if(tmpSeleccion != null && tmpSeleccion.length > 0){
             jQuery.each(tmpSeleccion, function (i, control) {
                DeleteControl(control); //elimina un control y todos su descendientes.
            });
        }
        
    }

    /*Devuelve la lista de controles seleciconados */
    this.GetSelectedControls = function () {

        if (_cacheSelection != null) {
            return _cacheSelection;
        }

        _cacheSelection = new Array();

        jQuery.each(_selection, function (i, uiID) {
            _cacheSelection.push(_instance.getControlByuiID(uiID));
        });

        return _cacheSelection;
    }
    
    /*Devuelve la lista de controles que satisfaga la función pasado como parametro. Si el parametro es null, devuelve todos los controles.
    * selector : función de filtrado.
    *
    * ejemplo getControls( function(c) { return c.IsDataSourceControl;} ) devolverá los controles que tengan esa propiedad a true.
    */
    this.getControls = function (selector) {
        var controles = new Array();
        for (var i = 0; i++ < _controls.size; _controls.next()) {
            
            if(selector != null){
                
                if(selector(_controls.value())){

                    controles.push(_controls.value());
                }
            }else{
            
                controles.push(_controls.value());
            }
        }
        return controles;
    }

    this.GetAvariableSources = function() {
    
          var avariableSources =  this.getControls( function(c) { return c.ControlDescriptor.Settings.IsDataSource;});
          var resultado = new Array();
          resultado.push("");
          jQuery.each(avariableSources, function (i, c) {
            resultado.push(c.ID);
          });

          return resultado;


    }


    /*Manejador de eventos que ocurre cuando modificamos alguna propiedad. Se identifica el editor que ha cambiado y se actualiza el arbol de propiedades*/
    this.onPropertyUpdating = function (message) {

        var $target = $(message.target);
        var vindex = $target.attr("vindex");
        var pname = $target.attr("pname");
        var peditor = $target.attr("peditor");

        var newValue = $target.val(); //valor del editor que ha levantado el evento.
        var root_property = null; //la propiedad que está cambiando.
        _cacheSelection = _instance.GetSelectedControls();

        jQuery.each(_cacheSelection, function (i, c) {
            var currentValue = null; //el valor actual de la propiedad.
            //var root_value = null;
            var editor = null; //el editor que se corresponde con el valor. Si la propiedad no tiene subpropiedades será el mismo que la propiedad raiz.

            //1º Comparamos el valor del editor con el valor actual.
            if (IsNumeric(vindex)) {
                root_property = _Properties[vindex];
                editor = c.GetProperty(root_property.Name);
            }
            else {
                root_property = jQuery.grep(_Properties, function (prop, i) {
                    return (prop.Name == vindex);
                })[0];
                editor = root_property;
            }
            //root_value = c.GetPropertyValue(root_property.Name, pname);
            //currentValue = root_value;

            currentValue = c.GetPropertyValue(root_property.Name, pname);


            if (pname.indexOf('.') > 0) {

                //hemos modificado una propiedad, que está dentro de otra propiedad, ejemplo Border.Left.Type. Para esto tenemos el peditor que nos na la ruta de indices hasta la propiedad, pero la ruta hasta el valor, nos lo da la propiedad y la alcanzamos vía texto.
//                arrPropName = pname.split('.'); //obtenemos el array 
//                for (var i = 1; i < arrPropName.length; i++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
//                    currentValue = currentValue[arrPropName[i]];
//                }

                arrIndex = peditor.split('#'); //obtenemos el array 
                for (var i = 1; i < arrIndex.length; i++) { //comienzo en el 1 porque  la propiedad 0 ya la tengo.
                    editor = editor.PropertyType.Properties[arrIndex[i]];

                }
            }
            if (newValue != currentValue) {
                if (!editor.PropertyType.Validate(newValue)) {
                    //el valor introducido no es correcto. Avisar al usuario y restaurar el valor anterior.
                    $target.val(currentValue);
                    Designer.Model.EventManager.HandleMessage(("El valor introducido en la propiedad {0} no es correcto. {1}").format(pname, editor.PropertyType.Description), null, Enum.MessageType.Warning);
                    return false;
                } else {
                    //asigno el valor que ha introducido el usuario.
                    var r = c.SetPropertyValue(root_property.Name, pname, newValue);
                    if(r == false){
                        //se cancelo el cambio de la propidad.
                        $target.val(currentValue);
                        return false;
                    }
                    
                }
            }

        });

    }

    /*Esta funcion se llama cuando cambian algunas propiedades */
    this.onPropertyChanged = function(sender, args){
        if(args.target == "ID"){
            //Cuando se cambia un ID hay que comprobar que no hay ningún otro control con ese nombre.
            var  controles = _instance.getControls( function(c) { return c.ID == args.newValue && c.uiID != sender.uiID;} );
            if(controles.length > 0){
                args.cancel = true; //cancela el cambio de propiedad.
                Designer.Model.EventManager.HandleMessage(("Ya existe un control cuyo ID es {0}. Escriba otro nombre para este control").format(args.newValue), null, Enum.MessageType.Warning);
            }
        }
        
        if(sender.ControlDescriptor.Settings.IsDataSource == true){
            if(args.target == "ID"){
                var dependencias = sender.GetDependencyList();//iuID,target
                
                jQuery.each(dependencias, function (i, dependencia) {
                    var c = _instance.getControlByuiID(dependencia.uiID);
                    c.SetPropertyValue(dependencia.target.split('.')[0], dependencia.target, args.newValue, { ignoreOnchange : true}); //no queremos que se desencadene una cadena de onChange, ya que esta accion es interna.
            
                });

            }
        }

    }
    /*Esta función establece una depencia de ID. Esto significa que si el ID control referenciado por el valor pasado como parámetro, entonces también debe cambiar esta propiedad.*/
    this.SetIDDependency = function(sender, args){
        if(args.newValue != null && args.newValue != ''){
            var Arr_dataSource = _instance.getControls( function(c) { return c.ID == args.newValue;} );
            if(Arr_dataSource == null || Arr_dataSource.length == 0 || Arr_dataSource.length > 1){
                Designer.Model.EventManager.HandleMessage(("Error, no se encontró el control {0} origen de datos para poder establecer la dependencia de nombres.").format( args.newValue), null, Enum.MessageType.Error);
                return false;
            }
            var dataSourceControl = Arr_dataSource[0];
            dataSourceControl.SetDependency(sender.uiID, args.target);
        }       
        if(args.currentValue != null && args.currentValue != ''){
            var Arr_dataSource = _instance.getControls( function(c) { return c.ID == args.currentValue;} );
            if(Arr_dataSource == null || Arr_dataSource.length == 0 || Arr_dataSource.length > 1){
                Designer.Model.EventManager.HandleMessage(("Error, no se encontró el control {0} origen de datos para poder establecer la dependencia de nombres.").format( args.currentValue), null, Enum.MessageType.Error);
                return false;
            }
            var dataSourceControl = Arr_dataSource[0];
            dataSourceControl.RemoveDependency(sender.uiID, args.target);
        }         
    }

    this.onPropertyShowEditor = function (message) {

        var $btt = $(message.target);
        var vindex = $btt.attr("vindex");
        var pname = $btt.attr("pname");
        var peditor = $btt.attr("peditor");

        var root_property = null; //la propiedad raiz
        var propery = null;

        

        if (_selection.length == 0) { return false; }
        var currentSelection = _instance.GetSelectedControls();
        
        //si solo tenemos un control, seleccionamos las propiedades del descriptor de ese control.
        var control = currentSelection[0];
        root_property = _Properties[vindex];
        propery = control.GetProperty(root_property.Name, peditor); //propiedad exacta.

        currentValue = control.GetPropertyValue(root_property.Name, pname);

        var $d = propery.PropertyType.Site.GetDialog();
        //funciones globales
        Designer.Model.EventManager.CurrentDialog = $d;
        Designer.Model.EventManager.DialogOKClose = function () {
                        Designer.Model.EventManager.CurrentDialog.dialog("close");
                        var tmp  = propery.PropertyType.Site.GetValues();
                        for(var i = 0; i < currentSelection.length; i ++){
                            currentSelection[i].SetPropertyValue(root_property.Name, pname, tmp);
                        }
                    
                };
            
        $d.dialog({
        height: propery.PropertyType.Site.Size.Height != -1 ? propery.PropertyType.Site.Size.Height : 'auto'
        , width: propery.PropertyType.Site.Size.Width
        , autoOpen: false
        ,  resizable: false
        , zIndex: 900
        , modal: true
            , open: function (event, ui) {
                $('.ui-widget-overlay').bind("click" ,function() { $d.dialog("close"); });
            }
        , close: function (event, ui) {
                Designer.Model.EventManager.CurrentDialog.dialog("destroy");
                Designer.Model.EventManager.CurrentDialog.empty();
                Designer.Model.EventManager.CurrentDialog.remove();
                Designer.Model.EventManager.CurrentDialog = null;
                Designer.Model.EventManager.DialogOKClose = null;
            }
        , buttons: {
                "Aceptar": Designer.Model.EventManager.DialogOKClose,
                "Cancelar": function () {
                    $(this).dialog("close");
                }
            },
        });


        $d.dialog("open");
            //FALLA en IE 8 y Chrome
            //$d.find("._dialogbtt").button();
//            jQuery.each($d.find("._dialogbtt"), function (i, btt) {
//            
//                $(btt).button();

//            });
//+++++++++++++++++++++++++++++++++++++++++++++++++++
        propery.PropertyType.Site.ShowValues(currentValue, propery, control);
        
        

    }

    /*devuelve el control que se corresponde con el uiID pasado */
    this.getControlByuiID = function (uiID) {

        return _controls.get(uiID);
    }
    /* funcion que inicia la transformación del diseño en el producto final, en función del contenido de cada
    template de cada elemento del diseño.*/
    this.RenderTemplate = function(parent){
            
        var htmlStr = new String();

        //TODO primero sin hijos.

        //1. Primero generamos una lista los controles que tengan el parent pasado como parámetro.
        //2. Ordenamos la lista usando como criterio la posición absoluta de cada elemento.
        //array.sort(sortfunction)

        //3. Generamos cada plantilla
        jQuery.each(_instance.getControls((parent != null && parent != '') ? function(c){ return (c.ParentControl != null && c.ParentControl.ID == parent);}: function(c){ return (c.ParentControl.uiID == -1);}), function (i, control) {
            
            if(control.ControlDescriptor.TemplateInfo != null && control.ControlDescriptor.TemplateInfo.GetFiles() != null && control.ControlDescriptor.TemplateInfo.GetFiles().length > 0){
                try{
                    Designer.Model.EventManager.HandleMessage(("Info: [RenderTemplate][control:{0}].").format(control.ID), null, Enum.MessageType.Info);
                var data = JSON.parse(  control.toJSONString());
                data.Controls = control.GetChildControls();//asocio los controles hijos para que el motor de plantillas tenga acceso a los hijos.
                var nodo =$($(control.ControlDescriptor.TemplateInfo.GetFiles()[0].Template).tmpl(data));
                htmlStr += nodo.html();
                } catch (ex) {
                    Designer.Model.EventManager.HandleMessage(("Ocurrió un error en la acción [RenderTemplate][control:{1}], error: \"{0}\".").format(ex.Description,control.ID), ex, Enum.MessageType.Error);
                }
            }

        });


        return htmlStr;
        
    }
    /*devuelve el control que se corresponde con el elemento de pantalla pasado como parámetro. */
    function getControlFromElement($element) {
        var uiID = $element.attr("uiID");
        return _controls.get(uiID);
    }

    /* Pinta las propiedades de los elementos selecionados en la ventana de propiedades **/
    function UpdateProperties(controles) {

        $propContainer.empty();
        _Properties = new Array();


        var control = null;
        var mainProperties = null;
        if (controles.length == 0) { return false; }
        var currentSelection = _instance.GetSelectedControls();
        if (controles.length == 1) {
            //si solo tenemos un control, seleccionamos las propiedades del descriptor de ese control.
            control = currentSelection[0];
            jQuery.merge(_Properties,  jQuery.grep(control.ControlDescriptor.Properties, function (prop, i) {return prop.Visible;}));
            //render de las propiedades principales.
            mainProperties = new Designer.PropertyNodes.Category("Editor");


            //mainProperties.AddProperty(new Designer.ControlProperty(this, "ID", new Designer.PropertyTypes.StringValue(), null), control.ID, "ID");
            mainProperties.AddProperty(control.ControlDescriptor.IdProperty, control.ID, "ID");
            if (control.ControlDescriptor.ClientSize != null && control.ControlDescriptor.Settings.HasSize) {
                //mainProperties.AddProperty(new Designer.ControlProperty(this, "Size", new Designer.PropertyTypes.Size(), null), control.ClientSize, "Size"); //,  new Designer.PropertyTypes.Size(), control.ClientSize);
                mainProperties.AddProperty(control.ControlDescriptor.SizeProperty, control.ClientSize, "Size"); //,  new Designer.PropertyTypes.Size(), control.ClientSize);
            }
            if (control.ControlDescriptor.Position != null && control.ControlDescriptor.Settings.HasPosition) {
                //mainProperties.AddProperty(new Designer.ControlProperty(this, "Position", new Designer.PropertyTypes.Position(), null), control.Position, "Position");
                mainProperties.AddProperty(control.ControlDescriptor.PositionProperty, control.Position, "Position");
            }
            //mainProperties.AddProperty(new Designer.ControlProperty(this, "Parent", new Designer.PropertyTypes.StringValue(), null), control.ParentControl.ID, "Parent");
            mainProperties.AddProperty(control.ControlDescriptor.ParentProperty, control.ParentControl.ID, "Parent");

            mainProperties.Render($propContainer);

        } else {
            control = currentSelection[0]; //comparo las propiedades del primer control, con el resto.
            var arrControles = currentSelection.slice(-1); // todos menos el primero

            jQuery.each(control.ControlDescriptor.Properties, function (i, prop) {
                var hasProperty = true;
                if(prop.Visible && prop.PropertyType.AllowMultiSelect){
                    //miro si la propiedad esta en el resto de controles.
                    jQuery.each(arrControles, function (i, c) {
                        if (hasProperty) {
                            hasProperty = c.ControlDescriptor.HasProperty(prop.Name, prop.PropertyType.ID);
                        }
                    });
                    if (hasProperty) {
                        _Properties.push(prop); //ya tengo las propiedades comunes.
                    }
                }
            });
        }

        //creo las categorias
        //creo la categoria basic:

        if (_Properties != null ) {

            for (var name in Enum.Categories) {

                var cat = new Designer.PropertyNodes.Category(name);

                jQuery.each(_Properties, function (i, prop) {
                    if (prop.Category == Enum.Categories[name]) {
                        prop.onBeforeRender();
                        if (controles.length == 1) {
                            cat.AddProperty(prop, control.ProperyValues[i], i);
                        } else {
                            cat.AddProperty(prop, null, i);
                        }
                        
                    }
                });

                if (cat.Size() > 0) {
                    cat.Render($propContainer);
                }
            }

            if (mainProperties != null && mainProperties.Size() > 0) {
                jQuery.each(mainProperties.GetProperties(), function (i, prop) {
                    _Properties.push(prop);
                });

            }
        }


    }
    /*devuelve el control que se corresponde con el uiID pasado */
    function getControlByuiID(uiID) {

        return _controls.get(uiID);
    }


    function IsNumeric(input) {
        return (input - 0) == input && input.length > 0;
    }

    function DeleteControl(controlToDelete){
        //eliminos primero los hijos de este control
        jQuery.each(_instance.getControls() , function (i, control) {
            if (control.uiID != controlToDelete.uiID && control.HasParent(controlToDelete.uiID)) {
                DeleteControl(control);
            }
        });
        if($.inArray(controlToDelete.uiID, _deletedControls) == -1 ){
            _deletedControls.push(controlToDelete.uiID);
            _instance.UnSelect(controlToDelete.$element, true); //desselecciono el elemento.
            controlToDelete.$element.remove(); //elimino el elemento de la pantalla.
            _controls.remove(controlToDelete.uiID); //elimino el control de la lista de controles.
            if(controlToDelete.ParentControl != null){
                controlToDelete.ParentControl.RemoveControl(controlToDelete);
            }
        }
        UpdateProperties(_selection);
    }


    /* eventos arrastrar */
    function StopDrag(event, ui) {
        consola.Log(event.type + " offset-x: " + (ui.position.left - ui.originalPosition.left) + " offset-y: " + (ui.position.top - ui.originalPosition.top));
        consola.Log(event.type + " x: " + (ui.position.left) + " y: " + (ui.position.top));

        if (dragEvt != null) {
            dragEvt.doEndDrag(ui);
        }
        dragEvt = null;
    }

    function StatDrag(event, ui) {
        consola.Log(event.type);
        //dragEvt = new Designer.Event.DragEvent(_instance, _selection, $(event.target)); //CHANGED solo para version jquery 1.6
        dragEvt = new Designer.Event.DragEvent(_instance, _selection, $(event.currentTarget));
    }

    function onDragging(event, ui) {

        if (dragEvt != null) {
            dragEvt.doDragging(ui);
        }
    }
    /**********************************/
    /* eventos resize */
    function StopResize(event, uiEvt) {
        if (resizeEvt != null) {
            resizeEvt.doEndResize(uiEvt);
        }
        resizeEvt = null;
    }

    function StatResize(event, uiEvt) {
        consola.Log(event.type);
        //resizeEvt = new Designer.Event.ResizeEvent(_instance, $(event.target)); //CHANGED solo para version jquery 1.6
        resizeEvt = new Designer.Event.ResizeEvent(_instance, $(event.currentTarget));

    }

    function onResizing(event, uiEvt) {
        //actualizar tamaño.

        //actualizo la posicion actual del control según se va moviendo.
        if (resizeEvt != null) {
            resizeEvt.doResizing(uiEvt);
        }
    }
    /***************************/


    function getTemporalName(descriptor) {
        var indice = 1;
        for (var i = 0; i++ < _controls.size; _controls.next()) {
            var ctr = _controls.value();
            if (ctr.ControlDescriptor.ToolBoxInfo.Name == descriptor.ToolBoxInfo.Name) {
                indice++;
            }
        }
        //        for (var i in _controls) {
        //            var ctr = _controls[i];
        //            if (ctr.Name == tool.Name) {
        //                i++;
        //            }
        //        }
        return descriptor.ToolBoxInfo.Name + indice;
    }

    //    function factory(className) {
    //        var c = eval('new ' + className + '();');

    //        return c;
    //    };

}

/*modela un evento de arrastrar un control */
Designer.Event.DragEvent = function (sender, selection, $target) {
    var _flgUpdating = false;
    var _uiID = $target.attr("uiID"); //uiID del elemento que se está moviendo.
    var _selection = selection; //array de uiID seleccionados en el momento de realizar el evento.
    var _manager = sender; //manager padre de la acción.

    var _elements = null;
    var x = 0;
    var y = 0;
    /*mueve el resto de controles seleccionados junto con el elemento que mueve el usuario en pantalla */
    this.doDragging = function (uiEvt) {

        if (!_flgUpdating) {
            _flgUpdating = true;
            //actualizo la posicion actual del control según se va moviendo.
            var c_me = _manager.getControlByuiID(_uiID);
            c_me.Position.Left = uiEvt.position.left;
            c_me.Position.Top = uiEvt.position.top;

            if (_elements == null) {
                ResolveSelection(); //creo la coleccion de controles seleccionados.
            }
            var tmpx = uiEvt.position.left - uiEvt.originalPosition.left;
            var tmpy = uiEvt.position.top - uiEvt.originalPosition.top;
            
            jQuery.each(_elements, function (i, c) {
                //c.Position.Left = c.Position.Left + (tmpx - x);
                //c.Position.Top = c.Position.Top + (tmpy - y);
                c.SetPosition(c.Position.Top + (tmpy - y), c.Position.Left + (tmpx - x));
                c.Refresh(Enum.Events.Move);
            });
            x = tmpx;
            y = tmpy;
            _flgUpdating = false;
        }
    }

    this.doEndDrag = function (uiEvt) {
        var c = _manager.getControlByuiID(_uiID); //al finalizar el arrastre, actualizamos las propiedades del control que se mueve.
        /*c.Position.Left = c.Position.Left + (uiEvt.position.left - uiEvt.originalPosition.left);
        c.Position.Top = c.Position.Top + (uiEvt.position.top - uiEvt.originalPosition.top);*/
        c.Position.Left = uiEvt.position.left;
        c.Position.Top = uiEvt.position.top;
        c.Refresh(Enum.Events.Move);

        _manager.doEvent(Enum.Events.Move, null, uiEvt, c);
    }

    function ResolveSelection() {
        _elements = new Array();
       
        jQuery.each(_selection, function (i, uiID) {
            if (uiID != _uiID) {
                _elements.push(_manager.getControlByuiID(uiID));
            }
        });

        var hijos = _manager.getControls();

        
        jQuery.each(hijos, function (i, control) {
            if ($.inArray(control, _elements) && control.uiID != _uiID && control.HasParent(_uiID, _elements)) {
                if(control.ParentControl.ControlDescriptor.Settings.PositionMode != Enum.PositionMode.FlowLayout){
                    _elements.push(control);
                }
            }
        });



    }

}


Designer.Event.ResizeEvent = function (sender, $target) {
    var _flgUpdating = false;
    var _uiID = $target.attr("uiID"); //uiID del elemento que se está moviendo.
    
    var _manager = sender; //manager padre de la acción.

    /* actualiza el tamaño según se va cambiando de tamaño NO FUNCIONA BIEN */
//    this.doResizing = function (uiEvt) {

//        if (!_flgUpdating) {
//            _flgUpdating = true;
//            //actualizo la posicion actual del control según se va moviendo.
//            var c_me = _manager.getControlByuiID(_uiID);
//            c_me.ClientSize.Width = uiEvt.size.width;
//            c_me.ClientSize.Height = uiEvt.size.height;

//           
//            _flgUpdating = false;
//        }
//    }

    this.doEndResize = function (uiEvt) {
        var c_me = _manager.getControlByuiID(_uiID);
        c_me.SetSize(uiEvt.size.width, uiEvt.size.height);
        c_me.Refresh(Enum.Events.Resize);
        _manager.doEvent(Enum.Events.Resize, null, uiEvt, c_me);
        
    }

}





