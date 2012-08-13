<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="PFCarrera._Default" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
	 
	<title>PFC</title>
	 <link id="cssMain" href="css/main.css" rel="stylesheet" type="text/css"/>
	<link href="css/smoothness/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
	<link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker/colorpicker.css" />
	<link href="css/fontselector/fontselector.css" rel="stylesheet" type="text/css" />
	<link href="css/treeview/jquery.treeview.css" rel="stylesheet" type="text/css" />
    <link href="css/xsdSelector/xsdSelector.css" rel="stylesheet" type="text/css" />
    <link href="css/jquery.rte/jquery.rte.css" rel="stylesheet" type="text/css" />
	  <script src="js/NameSpaces.js" type="text/javascript"></script>
	  <script src="js/jquery-1.6.2.js" type="text/javascript"></script>
	  <script src="js/jquery.tmpl.min.js" type="text/javascript" ></script>
	  <script src="js/Nodes.js" type="text/javascript"></script>
	  <script src="js/depuracion.js" type="text/javascript"></script>
	  <script src="js/Control.js" type="text/javascript"></script>
	  <script src="js/Designer.PropertyTypes.js" type="text/javascript" ></script>
	  <script src="js/TemplateInfo.js" type="text/javascript"></script>
	  <script src="js/grid.js" type="text/javascript"></script>
	  <script src="js/Designer.Model.ControlManager.js" type="text/javascript"></script>
	  <script src="js/ToolBoxManager.js" type="text/javascript"></script>
	  <script src="js/EventManager.js" type="text/javascript"></script>
	  <script src="js/Designer.oData.js" type="text/javascript"></script>
	  <script src="js/json2.js" type="text/javascript"></script>
	  <script src="controls/xml/GenericDescriptor.js" type="text/javascript"></script>
	  <script src="js/VisualEditors.js" type="text/javascript"></script>
	  <script type="text/javascript" src="js/colorpicker.js"></script>
	  <script src="js/jqfontselector.js" type="text/javascript"></script>
	<script src="js/jquery.rte.js" type="text/javascript"></script>
<script src="js/jquery.rte.tb.js" type="text/javascript"></script>
	
	  <script src="js/jquery-ui-1.8.14.custom.min.js" type="text/javascript"></script>
	  <script src="js/jQuery.Extensions.js" type="text/javascript"></script>
      <script src="js/Designer.Server.js" type="text/javascript"></script>
	  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	  <meta name="description" content="Poryecto Fin de Carrera, Pedro Leal" />
	  <meta http-equiv="Content-Language" content="es-ES" />
	  <meta name="lang" content="es" />
	  <meta http-equiv="Cache-Control" content="no-cache, mustrevalidate" />
</head>
<body>

	<form id="form1" runat="server">
	<script type="text/javascript" language="javascript">
		var flgMenuLoading = false;
		var lastItem = new String();
		function ShowMenu(parent, item) {

			if (item != null) {
				if (!flgMenuLoading || lastItem != item) {
					HideMenu();
					lastItem = item;
					flgMenuLoading = true;

					var $sub = $("#" + item);
					$sub.css({ "position": "absolute", "top": (parent.offsetTop + (parent.offsetHeight -1)) + "px", "left": (parent.offsetLeft) + "px" });
					$sub.show('blind', null, 500, null);
					$sub.mouseleave(HideMenu);
				}
			}
			else {
				HideMenu();
			}
		}
		function HideMenu() {
				lastItem = '';
				$(".submenu:visible").removeAttr("style").fadeOut();
				flgMenuLoading = false;
			
		}
	</script>
   <%--Tecnología de servidor--%>
	<asp:ScriptManager ID="ScriptManager1" runat="server">
		<Services>
			<asp:ServiceReference Path="services/ServerPFC.svc"/>
		</Services>
	</asp:ScriptManager>
	<%--*******************************--%>
	<div id="contenido_all">
		<div id="nemuBar">
			
					<div class="icono" style="width:48px"  >
						<img onmouseover="ShowMenu(this, null)" src="images/disk_blue.png" alt="guardar" onclick="Designer.Server.SaveFileToServer()" style="float:left;" /><div  onmouseover="ShowMenu(this, 'mnuSaveas')" class="ui-icon ui-icon-triangle-1-s" style="float:left;"></div>
                        <ul id="mnuSaveas" class="submenu" >
							<li><img src="images/save_as.png" onclick="Designer.Server.ShowSaveDialog()" alt="guardar como" /><span>guardar como</span></li>
							
						</ul>
					</div>
					<div class="icono"  onmouseover="ShowMenu(this, null)">
						<img src="images/folder_document.png" alt="abrir" onclick="Designer.Server.ListFiles()" />
					</div>
					<div class="icono" onmouseover="ShowMenu(this, null)">
						<img src="images/text_code_colored.png" alt="generar" onclick="BeginRender()" />
						
						
					</div>

					<div class="separador" onmouseover="HideMenu()"></div>
					<div class="icono" onmouseover="ShowMenu(this,'mnuOrdenar')"  >
						<img src="images/element_copy.png" alt="ordenar"  />
						
						<ul id="mnuOrdenar" class="submenu" >
							<li><img src="images/sendtoback_24.png" alt="enviar fondo" /><span> enviar al fondo</span></li>
							<li><img src="images/sendbackward_24.png" alt="bajar" /><span>bajar</span></li>
							<li><img src="images/BringForward_24.png" alt="subir" /><span>elevar</span></li>
							<li><img src="images/BringTofront_24.png" alt="traer al frente" /><span>traer al frente</span></li>
						</ul>
					</div>
					 <div class="icono" onmouseover="ShowMenu(this,'mnuAlinear')"  >
						<img src="images/element_selection.png" alt="alinear"  />
						
						<ul id="mnuAlinear" class="submenu" >
							<li><img src="images/layout_west.png" alt="alinear izquierda" /><span> alinear izquierda</span></li>
							<li><img src="images/layout_east.png" alt="alinear derecha" /><span>alinear derecha</span></li>
							<li><img src="images/layout_vertical.png" alt="alinear vertical" /><span>alinear vertical</span></li>
							<li><img src="images/layout_horizontal.png" alt="alinear horizontal" /><span>alinear horizontal</span></li>
						</ul>
					</div>
					<div class="separador" onmouseover="HideMenu()"></div>
					<div class="icono" onmouseover="ShowMenu(this, null)">
						<img src="images/selection2.png" title="configuración del grid" alt="conf grid" onclick="GridSetup()" />                        
					</div>
					<div class="icono" onmouseover="ShowMenu(this, null)">
						<img src="images/document_info.png" title="inspeccionar elemento seleccionado" alt="generar" onclick="DebugSelected()" />                        
					</div>
		
				</div>
		
		<div id="cuerpo" class="fullwidth">
			<div id="controles">
				<div id="products">
					<div id="divToolbox">
				   
					</div>
				</div>
			</div>
			<div id="rightPanel"  >
				<div id="grid" class="grid8" style="position:relative">

				</div>

				<div id="datasources">

				</div>
			</div>
			<div id="propiedades">
		   
			</div>
		</div>
		
		<div id="mensajes">
			<div id="cabMesg">
				<div class="icon_mensajes" >
					<img src="images/delete.png" class="img_panel_mensajes" /> Errores
				</div>
				<div class="separador_mensajes" ></div>
				<div class="icon_mensajes" >
					<img src="images/warning.png" class="img_panel_mensajes" /> Advertencias
				</div>
				<div class="separador_mensajes" ></div>
				<div class="icon_mensajes" >
					<img src="images/about.png" class="img_panel_mensajes" /> Mensajes
				</div>
			</div>
			<div id="panel_mensajes">
				
			</div>
		</div>
<%--
		<div id="ArrayEditor"  class="editorPanel">
		
			<table cellpadding="3" cellspacing="0" border="0">
				<tr>
					<td style="width:170px"><label>Elementos</label></td>
					<td style="width:24px"></td>
					<td style="width:170px"><label>Propiedades</label></td>
				</tr>
				<tr>
					<td>
						<div style="float:left">
							<div class="fullwidth _select">
								<select id="Select1" multiple="multiple" title="Elementos de la lista" class="ui-widget-content ui-corner-all">
									
								</select>
							</div>

							<div class="fullwidth" style="padding-top:5px;">
								<button  class="_dialogbtt" type="button" style="float:right;width:80px;">Eliminar</button>
								<button  class="_dialogbtt" type="button" style="float:right;width:80px;margin-right:5px;">Añadir</button>
							</div>


						</div>
					</td>
					<td style="width:24px;vertical-align:top;">
						<div  >
							<img src="images/arrow_up_blue.png" class="_dialogbtt" alt="up" />
						</div>
						<div  style="margin-top:10px">
							<img src="images/arrow_down_blue.png" class="_dialogbtt" alt="down" />
						</div>
					</td>
					<td style="vertical-align:top;">
						<div id="itemProps" class="itemsPanel ui-widget-content ui-corner-all">
								
						</div>
					</td>
				</tr>
				
			
			</table>
		
		</div>
--%>
		
	</div>
<script type="text/javascript" language="javascript">
	//var consola = new DebugListener('DebugListener.aspx');

	var consola = new DebugListener(null);
	
	//var x = window.DOMParser;

	Designer.Model.EventManager = new Designer.EventManager('#panel_mensajes');
	
	Designer.Model.ControlManager = new Designer.ControlManager('#propiedades');
    var toolBoxManager = new Designer.ToolBoxManager('#divToolbox');
	var indexManager = new Designer.IndexManager(); //gestiona los ids globales que se utilizan en el diseñador.
	Designer.Model.Grid = new Designer.UI.Grid("#grid", 8);
	Designer.Model.DataSources = new Designer.UI.DataSourceContainer("#datasources");

	
	jQuery(document).ready(function ($) {
		InitControlToolBox(); //inicializa los controles.
		setTimeout(function () { InitControlManager(); }, 2300);
	});

	//Controles
	function InitControlToolBox() {
		//TODO get controles de donde sea.
        GenericDescriptor.prototype = new Designer.ControlDescriptor(); //valores por defecto.
		var controlToolBoxSource = new FakeDataSource();

		var listaTabs = controlToolBoxSource.GetControlTabList();

		for (var i in listaTabs) {
			var tabName = listaTabs[i];
			//creo los tabs de controles:
			toolBoxManager.AppendToolTab(tabName);

			var listaControles = controlToolBoxSource.GetControlList(tabName);

			for (var j in listaControles) {
				var control_descriptor = listaControles[j];
				toolBoxManager.ApendTool(tabName, control_descriptor); //añade y registra los componentes necesarios para usar este control.
			}

		}
		Designer.Model.EventManager.onSignaling(function () {
			$("#divToolbox").accordion({
				collapsible: true
			});

			$(function () {
				Designer.Model.Grid.$element.droppable({
					accept: "._crtToolBox",
					activeClass: "ui-state-hover",
					hoverClass: "ui-state-active",

					drop: function (event, ui) {
						var nuevoControl = toolBoxManager.CreateControl(ui.draggable.context.id);


						$(this).append(nuevoControl.$element); //se añade al grid

						//inicializa el control con respecto al Designer.Model.Grid.
						Designer.Model.ControlManager.doEvent(Enum.Events.Init, nuevoControl.$element, ui, Designer.Model.Grid); //genera el evento para que el controlManager se entere de que el control está creado.
					}
					,
					over: function (event, ui) {
						//consola.Log(event.type); 
					}
				});

				$("._crtToolBox").draggable({

					revert: "invalid", // when not dropped, the item will revert back to its initial position
					containment: '#grid',
					scroll: false,
					// helper: "clone",
					helper: function (event) {
						var controlname = event.target.getAttribute("controlname");
						if (controlname) {
							return toolBoxManager.CreatePreview(controlname);
						}
					},

					cursor: "move",
					appendTo: 'body',
					create: function (event, ui) {
						// consola.Log(event.type); 
					}
				});
               
				Designer.Config.SelectableConfig = {
					start: function (event, ui) {
						Designer.Model.DataSources.$element.selectable( "unselectAll");
                        Designer.Model.ControlManager.UnSelect(function(c) { return c.ControlDescriptor.Settings.IsDataSource == true;}); //hacking para mozilla
						consola.Log("DATASOURCES UNSELECT --> Grid ");
					}
					,
					selected: function (event, ui) {
						consola.Log("SELECT --> Grid " +event.type + ' : ' + $(ui.selected).attr("uiID"));

						Designer.Model.ControlManager.Select($(ui.selected));
					}
					,
					unselected: function (event, ui) {
						consola.Log("UNSELECT --> Grid " + event.type + ' : ' + $(ui.unselected).attr("uiID"));

						Designer.Model.ControlManager.UnSelect($(ui.unselected),false);
					}
					,
					filter: '._ctrGrid' //solo se pueden seleccionar los elementos que tengan esa clase.
                    //,delay: 20
				};
				/*hace que los elementos del grid se puedan selecionar arrastrando el ratón. */
				Designer.Model.Grid.$element.selectable(Designer.Config.SelectableConfig);

                /*hace que los elementos del panel de datasources sean seleccionables con el ratón*/
				Designer.Model.DataSources.$element.selectable({
                     start: function (event, ui) {
                        Designer.Model.Grid.$element.selectable( "unselectAll");
                        Designer.Model.ControlManager.UnSelect(function(c) { return c.ControlDescriptor.Settings.IsDataSource == false;}); //hacking para mozilla
                        consola.Log("GRID UNSELECT --> DataSources ");
                    }
                    ,
                    selected: function (event, ui) {
                        consola.Log("SELECT --> DataSources " + event.type + ' : ' + $(ui.selected).attr("uiID"));

                        Designer.Model.ControlManager.Select($(ui.selected));
                    }
                    ,
                    unselected: function (event, ui) {
                        consola.Log("UNSELECT --> DataSources " + event.type + ' : ' + $(ui.unselected).attr("uiID"));

                        Designer.Model.ControlManager.UnSelect($(ui.unselected));
                    }
                    ,
                    filter: '._ctrGrid' //solo se pueden seleccionar los elementos que tengan esa clase.
                });


				$(this).keydown(function(event) {
				  if ( event.which == 13 ) {
					 event.preventDefault();
				  }else if ( event.which == 8 || event.which == 46) {
					if(event.target.className.indexOf("_propertyType") && event.target.type != "text"){

						Designer.Model.ControlManager.DeleteSelectedControls();
					}
				  }
				  
				});
			});

		});

	}
   
    
    /* graba el diseño en el servidor */
    

	function InitControlManager() {
		
		consola.Log("grid y: " + Designer.Model.Grid.$element.position().top);
		consola.Log("grid x: " + Designer.Model.Grid.$element.position().left);

		consola.DebugElement("Grid", Designer.Model.Grid.$element);

	}

	function DebugSelected() {
		if(consola.WindowURL == null){
			consola.Initializate( 'DebugListener.aspx');
			setTimeout(function () {
				var seleccion = Designer.Model.ControlManager.GetSelectedControls();
				jQuery.each(seleccion, function (i, c) {
			consola.DebugElement(c.ID, c.$element, c);
		});
			 }, 3000);
		}else{
		var seleccion = Designer.Model.ControlManager.GetSelectedControls();
		jQuery.each(seleccion, function (i, c) {
			consola.DebugElement(c.ID, c.$element, c);
		});
		}
		
		

	}

	

	function GridSetup(){
		
	}


	function TestDialog() {
		var editor = new Designer.UI.ArrayListEditor();
		var $d = editor.GetDialog();

		$d.dialog({
		height: 400
		, width: 425
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
						//TODO reportar valores.
						$(this).dialog("close");
					
				},
				Cancel: function () {
					$(this).dialog("close");
				}
			},
		});

		$d.dialog("open");
		
//        $(document).click(function (y) {
//            var $tgt = $(y.target);
//            if (!$tgt.parents().is(".editorPanel") && !$tgt.parents().is(".icono")) {
//                $d.dialog('close');
//            }
//        });

	}

	function BeginRender(){
		
		//TODO generar todo el arbol de ficheros..
		var nodo =$(Designer.Model.Grid.TemplateInfo.GetFiles()[0].Template).tmpl({ "Title" : "Diseño en pruebas" });

	   //alert();  //
	   //nodo.appendTo("#panel_mensajes");
	   Designer.Model.EventManager.HandleMessage(nodo.html(), null, Enum.MessageType.Info); 
	}

	function checkRegexp(o, regexp, n) {
		if (!(regexp.test(o.val()))) {
			o.addClass("ui-state-error");
			$(".validateTips").text(n)
				.addClass( "ui-state-highlight" );
			setTimeout(function() {
				$(".validateTips").removeClass("ui-state-highlight", 1500);
			}, 500 );
			return false;
		} else {
			return true;
		}
	}

   
	
</script>

	</form>
	
	
</body>
</html>
