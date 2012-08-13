
/* Depends:
*	Control.js
*   EventManager.js
*   Designer.Model.ControlManager.js
*  jQuery JavaScript Library v1.6.2
*/
Designer.ToolBoxManager = function (container) {

    var _instance = this;


    var listaToolBox = new Collection.HashMap();

    this.$Container = $(container);

    this.ToolBoxTabs = new Array();

    this.AppendToolTab = function (tabName) {

        var tab = new ToolBoxTab(tabName);

        this.ToolBoxTabs.push(tab);

        this.$Container.append("<h3><a href='#'>" + tabName + "</a></h3>");

        var $div = $("<div></div>");

        this.$Container.append($div);

        tab.$Container = $div;

        /*
        <h3><a href="#">General</a></h3>
        <div>
        <ul>
        <li>Lolcat Shirt</li>
        <li>Cheezeburger Shirt</li>
        <li>Buckit Shirt</li>
        </ul>
        </div>
        */

    }

    this.ApendTool = function (tabName, toolBoxInfo) {


        Designer.Model.EventManager.Wait();
        //CONTROLES XML
        if (toolBoxInfo.ControlType == "xml") {
            $.ajax({
                type: "GET",
                url: toolBoxInfo.GetControlFileName(),
                dataType: "xml",
                success: function (xml) {


                    var ctr_descriptor = new GenericDescriptor($(xml)); //crea una nueva instancia de custom_control y

                    InitDescriptor(ctr_descriptor, toolBoxInfo, tabName);
                }
                ,
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status);
                    throw thrownError;
                }
            ,
                async: true
            });
        } else {
            //1. cargamos el script para tener en memoria el código
            jQuery.getScript(toolBoxInfo.GetControlFileName(), function (data) {

                var ctr_descriptor = factory(toolBoxInfo.Name); //crea una nueva instancia del objeto Control-Descriptor
                ctr_descriptor.Name = toolBoxInfo.Name;
                //c.prototype = new Designer.Control();
                InitDescriptor(ctr_descriptor, toolBoxInfo, tabName);
            });
        }

    }

    function InitDescriptor(ctr_descriptor, toolBoxInfo, tabName) {
        //TODO 03/10/2011 MOVE este código para que los controles se carguen bajo demanda cuando se utilizan por primera vez.
        ctr_descriptor.RegisterToolBox(toolBoxInfo); //registra el control con la información suministrada.
        registerInternal(ctr_descriptor); //registro el control
        //**************************END_TODO **************
        var tabToApped = null;
        for (var i in _instance.ToolBoxTabs) {
            var tab = _instance.ToolBoxTabs[i];
            if (tabName == tab.Name) {
                tabToApped = tab;
            }
        }

        if (tab == null) {
            var ex = new userException('No se encontró el contenedor de controles: ' + tabName);
            throw ex;
        } else {



            var $myTool = $("<div class='_crtToolBox fullwidth' id='" + toolBoxInfo.Name + "'><div style='float:left'><img alt='" + toolBoxInfo.Name + "' width='24' height='24' src='" + toolBoxInfo.Icon + "' controlname='" + toolBoxInfo.Name + "'/></div><div class='img_caption' controlname='" + toolBoxInfo.Name + "'>" + toolBoxInfo.Text + "</div></div>");
            tabToApped.$Container.append($myTool);
        }

        //indicamos al interface que tenemos el control cargado
        Designer.Model.EventManager.Signal();
    }

    this.CreateControl = function (controlName, initialValues) {
        var controlDescriptor = listaToolBox.get(controlName); //obtengo el control de la lista de controles.
        var myControl = null;
        if (controlDescriptor) {
            /* */
            myControl = Designer.Model.ControlManager.RegisterControl(controlDescriptor, initialValues); /*registra un control del tipo seleccionado en el el toolbox. */

        } else {
            var ex = new userException('No se encontró el control en el registro: ' + controlName);
            throw ex;
        }
        return myControl;
    }
    /*crea el previo del control para visualizar mientras se arrastra */
    this.CreatePreview = function (controlName) {
        var controlDescriptor = listaToolBox.get(controlName);
        var $myControl = null;
        if (controlDescriptor) {
            $myControl = $(controlDescriptor.GetDesigner.DragTimeHtml);

        } else {
            var ex = new userException('No se encontró el toolbox en el registro: ' + controlName);
            throw ex;
        }
        return $myControl;
    }

    function factory(className) {
        return eval('new ' + className + '();');
    };

    function registerInternal(ctr) {
        if (listaToolBox.contains(ctr.ToolBoxInfo.Name) == false) {
            listaToolBox.put(ctr.ToolBoxInfo.Name, ctr);
        }
    }
}

function ToolBoxTab(title){
    this.Name = title;
    this.$Container = null;
}

