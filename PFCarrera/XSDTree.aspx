<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="XSDTree.aspx.cs" Inherits="PFCarrera.XSDTree" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">

<link id="cssMain" href="css/main.css" rel="stylesheet" type="text/css"/>
    <link href="css/smoothness/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker/colorpicker.css" />
    <link href="css/fontselector/fontselector.css" rel="stylesheet" type="text/css" />
    <link href="css/treeview/jquery.treeview.css" rel="stylesheet" type="text/css" />
    <link href="css/jquery.rte/jquery.rte.css" rel="stylesheet" type="text/css" />

<link href="css/xsdSelector/xsdSelector.css" rel="stylesheet" type="text/css" />
      <script src="js/NameSpaces.js" type="text/javascript"></script>
      <script src="js/jquery-1.6.2.js" type="text/javascript"></script>
      <script src="js/jquery.tmpl.min.js" type="text/javascript" ></script>
      <script src="js/Nodes.js" type="text/javascript"></script>
      <script src="js/depuracion.js" type="text/javascript"></script>
      <script src="js/TemplateInfo.js" type="text/javascript"></script>
    <script src="js/Designer.PropertyTypes.js" type="text/javascript"></script>
      <script src="js/Control.js" type="text/javascript"></script>
      <script src="js/grid.js" type="text/javascript"></script>
      <script src="js/Designer.Model.ControlManager.js" type="text/javascript"></script>
      <script src="js/ToolBoxManager.js" type="text/javascript"></script>
      <script src="js/EventManager.js" type="text/javascript"></script>
      
      <script src="js/json2.js" type="text/javascript"></script>
      <script src="controls/xml/GenericDescriptor.js" type="text/javascript"></script>
      <script src="js/VisualEditors.js" type="text/javascript"></script>
      <script type="text/javascript" src="js/colorpicker.js"></script>
      <script src="js/jqfontselector.js" type="text/javascript"></script>
    <script src="js/jquery.rte.js" type="text/javascript"></script>
    <script src="js/jquery.rte.tb.js" type="text/javascript"></script>
    <script src="js/jquery.treeview.js" type="text/javascript"></script>

      <script src="js/jquery-ui-1.8.14.custom.min.js" type="text/javascript"></script>
      
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <title>prueba de lectura de esquema</title>
</head>
<body>
    <form id="form1" runat="server">
    <script type="text/javascript" language="javascript">

        function LeerXSD(url) {
            printFallo("inicio parseo");
            var parser = new Designer.Schema.XSDParser(); //crea una nueva instancia de un XSDParser y

            var elementos = parser.OpenXSD(url, printResultados, printFallo);

        }

        function printResultados(elementos) {
            jQuery.each(elementos, function (index, e) {
                try {
                    $("#ElementTemplate").tmpl(e).appendTo("#panel");
                } catch (ex) {
                    printFallo(ex.message);
                }
            });
            printFallo("fin");

            $("._connImg").bind("click", function (element) {
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
        }

        function printFallo(message) {
            
            $("#err").append($('<p>' +message +'</p>'));
            
        }

       

    </script>

        <script id="ElementTemplate" type="text/x-jQuery-tmpl">   
            <div>
                <div class="_element">
                <div class="element_node">
                    <div class="element_conector">{{if Type.Elements.length > 0}}<img class="_connImg _connExpanded" src="css/xsdSelector/images/noImg.png"/>{{/if}} </div>
                    <div class="element_name_ct">
                        <div class="element_item ${getClass(Type,IsCollection)}">
                            ${Name}
                        </div>
                    </div>
                    <div class="element_attr_ct">
                        {{each Type.Attributes}} 
						     <div class="element_attr">
                                ${Name}
                            </div>	
						{{/each}}
                    </div>
                </div>
                {{if Type.Elements.length > 0}}
                    <div class="_collapseBox">
                        {{each Type.Elements}} 
                            <div class="element_body">
                                <table border="0" cellpadding="0" cellspacing="0" class="element_body">
                                    <tr>
                                        <td width="30px"><div class="element_line"></div></td>
                                        <td >
                                            <div class="element_childs _collapseBox">
                                                {{tmpl($value) "#ElementTemplate"}}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        {{/each}}
                    </div>
                {{/if}} 
            </div>
            </div>
        </script>
    <div>
    <input type="button" value="Parse" title="Parse" onclick="LeerXSD('schema - Copy.xsd')"/>
        <div id="err" class="editorPanel"  title="Selección de Contenidos" style="float:left;width:100%"> 
		    	                    
		</div>
        <div id="panel" class="editorPanel"  title="Selección de Contenidos" style="float:left;width:100%"> 
		    	                    
		</div>
        <div class="_element" style="margin-top:50px;">
            <div class="element_node">
                
                <div class="element_name_ct">
                    <div class="element_item Tcomplex">
                        Persona
                    </div>
                </div>
                <div class="element_attr_ct">
                    <div class="element_attr">
                        Edad
                    </div>
                    <div class="element_attr">
                        Casado
                    </div>
                    <div class="element_attr">
                        Color-Ojos
                    </div>
                </div>
            </div>
            <div class="element_body">
                <table border="0" cellpadding="0" cellspacing="0" class="element_body">
                    <tr>
                        <td width="20px"><div class="element_line"></div></td>
                        <td >
                            <div class="element_childs">
                                <div class="_element">
                                    <div class="element_node">
                                        <div class="element_conector"><img src="css/xsdSelector/images/plus.gif"/></div>
                                        <div class="element_name_ct">
                                            <div class="element_item Tcomplex">
                                                Hijos
                                            </div>
                                        </div>
                                        <div class="element_attr_ct">
                                
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="element_body">
                <table border="0" cellpadding="0" cellspacing="0" class="element_body">
                    <tr>
                        <td width="20px"><div class="element_line"></div></td>
                        <td >
                            <div class="element_childs">
                                <div class="_element">
                                    <div class="element_node">
                                        <div class="element_conector"></div>
                                        <div class="element_name_ct">
                                            <div class="element_item Tsimple">
                                                Padre
                                            </div>
                                        </div>
                                        <div class="element_attr_ct">
                                            <div class="element_attr">
                                                Edad
                                            </div>
                                        </div>
                                    </div>
                                    <div class="element_body">
                                        <table border="0" cellpadding="0" cellspacing="0" class="element_body">
                                            <tr>
                                                <td width="40px"><div class="element_line"></div></td>
                                                <td>
                                                    <div class="element_childs">
                                                        <div class="_element">
                                                            <div class="element_node">
                                                                <div class="element_conector"></div>
                                                                <div class="element_name_ct">
                                                                    <div class="element_item Tcollection">
                                                                        Padre
                                                                    </div>
                                                                </div>
                                                                <div class="element_attr_ct">
                                                                    <div class="element_attr">
                                                                        Edad
                                                                    </div>
                                                                </div>
                                                            </div>
                                                             <div class="element_body">
                                                                <table border="0" cellpadding="0" cellspacing="0" class="element_body">
                                                                    <tr>
                                                                        <td width="40px"><div class="element_line"></div></td>
                                                                        <td >
                                                                            <div class="element_childs">
                                                                                <div class="_element">
                                                                                    <div class="element_node">
                                                                                        <div class="element_conector"><img src="css/xsdSelector/images/plus.gif"/></div>
                                                                                        <div class="element_name_ct">
                                                                                            <div class="element_item Tcomplex">
                                                                                                Hijos
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="element_attr_ct">
                                
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    </form>
</body>
</html>
