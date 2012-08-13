/* Depends:
*	Namespaces.js
*   Designer.oData.js
*   Designer.Model.ControlManager
*   Designer.Model.EventManager
*/

Designer.Server = {


    SaveFileToServer: function (fileName) {

        if (fileName == null) {
            if (Designer.Model.ControlManager.CurrentFile != null) {
                fileName = Designer.Model.ControlManager.CurrentFile.FileName;
            } else {
                this.ShowSaveDialog();
                return false;
            }
        }
        var cliente = new Designer.oData.Client(Designer.Config.DesignerServerURL);
        if (Designer.Model.ControlManager.CurrentFile == null) {
            Designer.Model.ControlManager.CurrentFile = cliente.GetList("Design('new_design')", null, null, true); //obtengo un objeto nuevo del servidor.
        }
        Designer.Model.ControlManager.CurrentFile.FileName = fileName;
        Designer.Model.ControlManager.CurrentFile.Data = Designer.Model.ControlManager.SerializateDesign();

        cliente.Update(Designer.Model.ControlManager.CurrentFile, 'Design'
        , function (data) {
            Designer.Model.ControlManager.CurrentFile = data;
            if (data.MessageType == 3) {
                //ocurrio un error en el servidor.
                Designer.Model.EventManager.HandleMessage("ERROR - No se guardo el diseño: " + data.LastMessage, null, Enum.MessageType.Error);
            } else {
                Designer.Model.EventManager.HandleMessage(("Diseño {0} guardado con éxito.").format(data.FileName), null, Enum.MessageType.Info);
            }

        },
        function (err) {
            Designer.Model.EventManager.HandleMessage(("Error guardando diseño: {0}.").format(err.message), null, Enum.MessageType.Error);
        });

    }
    ,
    ShowSaveDialog: function () {
        var saveDialog = $('<div id="dialog-form" title="Nombre de fichero">	<p class="validateTips">Escriba un nombre para este diseño</p>	<form>	<fieldset>		<label for="name">Nombre</label>		<input type="text" name="__name" id="__name" class="text ui-widget-content ui-corner-all" /></fieldset>	</form></div>');
        saveDialog.dialog({
            autoOpen: false,
            height: 150,
            width: 350,
            modal: true,
            buttons: {
                "Guardar": function () {
                    var bValid = true;
                    var txt  =saveDialog.find("#__name:first");
                   txt.removeClass("ui-state-error");

                    bValid = bValid && checkRegexp(txt, /^([0-9a-zA-Z])+$/, "Solo se permiten los caracteres : a-z 0-9");

                    if (bValid) {

                        Designer.Server.SaveFileToServer(txt.val());
                        $(this).dialog("close");
                    }
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                //$("#__name").val("").removeClass("ui-state-error");
                $(this).dialog("destroy");
            }
        });
        if (Designer.Model.ControlManager.CurrentFile != null) {
            Designer.Model.ControlManager.CurrentFile.IsNew = true; //es un save as o un save inicial.
        }
        saveDialog.dialog("open");
    }
    ,
    ListFiles: function () {
        
        var cliente = new Designer.oData.Client(Designer.Config.DesignerServerURL);
        cliente.GetList('Design()?$select=FileName,TimeStamp', function (lista) {

            var $editor = $('<div class="editorPanel"  title="Selección de Fichero" > \
			                    <div id="listPanel" class="listaFicheros" style="min-height:400px;"> </div> \
					</div>');

            var listPanel = $editor.children('#listPanel');
            var tablaFicheros = new String();
            tablaFicheros += "<table width='100%' cellpadding='3' cellspacing='0' border='0'><thead class='ui-widget-header'><tr><th style='width:26px'></th><th>Nombre Fichero</th><th>Fecha</th></tr></thead><tbody>";
            _arrFicheros = lista;
            jQuery.each(lista, function (i, file) {
                if(file.TimeStamp == null){return;}
                //("<div class='fileListentry'><img src='images/text_code_colored.png' alt='file' /><span>{0}</span></div>").format(file.FileName)
                tablaFicheros += ("<tr><td><img src='images/components_24.png' alt='file' /></td><td>{0}</td><td>{1}</td></tr>").format(file.FileName, file.TimeStamp);

            });
            tablaFicheros += "</tbody></table>";

            var $table = $(tablaFicheros);

            $table.find('tbody > tr').click(function () {
                var tableRow = $(this);
                $table.find('tbody > tr').removeClass("_selected");
                $(this).toggleClass("_selected");

                arr = jQuery.grep(_arrFicheros, function (recurso, i) {
                    return (recurso.FileName == tableRow.children()[1].innerHTML);
                });
                if (arr != null && arr.length > 0) {
                    Designer.Server.Seleccion = arr[0];
                }


            }).dblclick(function () {

                var tableRow = $(this);

                arr = jQuery.grep(_arrFicheros, function (recurso, i) {
                    return (recurso.FileName == tableRow.children()[1].innerHTML);
                });

                if (arr != null && arr.length > 0) {
                    Designer.Server.Seleccion = arr[0];
                }
                Designer.Model.EventManager.DialogOKClose();
            });

            listPanel.append($table);

            
        Designer.Model.EventManager.CurrentDialog = $editor;
        Designer.Model.EventManager.DialogOKClose = function () {
                        
                        cliente.GetList(encodeURIComponent( "Design('"+Designer.Server.Seleccion.FileName+"')"), 
                        function (file) {
                            Designer.Model.ControlManager.CurrentFile = file;
                            Designer.Model.ControlManager.LoadDesign();
                        },null);
                        
                       
                        Designer.Model.EventManager.CurrentDialog.dialog("close");
                    
                };
            
        $editor.dialog({
        height:  'auto'
        , width:  500
        , autoOpen: false
        ,  resizable: false
        , zIndex: 900
        , modal: true
            , open: function (event, ui) {
                $('.ui-widget-overlay').bind("click" ,function() { $editor.dialog("close"); });
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


        $editor.dialog("open");

        }, null, false);


        
    }
    ,
    Seleccion: null
}

