<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Test.aspx.cs" Inherits="PFCarrera.Test" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    
    <title>PFC</title>
     <link id="cssMain" href="css/main.css" rel="stylesheet" type="text/css"/>
     <script src="js/jquery-1.6.2.js" type="text/javascript"></script>
    <link href="css/smoothness/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
     
    <script src="controls/jquery/Masonry_Plugin/jquery.masonry.min.js" type="text/javascript" language="javascript"></script>
     
     <script src="js/NameSpaces.js" type="text/javascript"></script>
     
      <script src="js/depuracion.js" type="text/javascript"></script>
      
      
      <script src="js/Control.js" type="text/javascript"></script>
      <script src="js/Designer.Model.ControlManager.js" type="text/javascript"></script>
      <script src="js/ToolBoxManager.js" type="text/javascript"></script>
      <script src="js/EventManager.js" type="text/javascript"></script>
      
      <script src="js/jquery-ui-1.8.14.custom.min.js" type="text/javascript"/>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	  <meta name="description" content="Poryecto Fin de Carrera, Pedro Leal" />
      <meta http-equiv="Content-Language" content="es-ES" />
      <meta name="lang" content="es" />
      <meta http-equiv="Cache-Control" content="no-cache, mustrevalidate" />
</head>
<body>
<script type="text/javascript" language="javascript">
   
   
    

</script>
    <form id="form1" runat="server">
    <div id="contenido_all">
        <div id="cabecera" class="fullwidth">
        <input type="button" onclick="Probar()" value="test" />
        </div>
        <div id="cuerpo" class="fullwidth">
        <div id="controles">
            <div id="products">
	            <h2 class="ui-widget-header">Controles</h2>	
	            <div id="divToolbox">
		           <h3><a href="#">General</a></h3>
                    <div >
                        
                        <div id="tool" class="dragger">
                            <div style="float:left"><img src="controls/jquery/Cycle_Plugin/img/toolbox.png" /></div>
                            <div class="img_caption">Cycle Plugin</div>
                        </div>
                        
                    </div>

                     <h3><a href="#">Contenedor</a></h3>
                    <div>
                    <div class="drag"><img src="controls/jquery/Cycle_Plugin/img/toolbox.png" /></div>
                        <div class="drag"><img src="controls/jquery/Cycle_Plugin/img/toolbox.png" /></div>
                        <div class="drag"><img src="controls/jquery/Cycle_Plugin/img/toolbox.png" /></div>
                    </div>
	            </div>
            </div>
        </div>
        <div id="grid">
                <div id="container" class="clearfix">

                  <div class="box col1">
                    <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.</p>
                  </div>

                  <div class="box col2">
                    <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.</p>
                  </div>

                </div>
        </div>
        </div>
        <div id="draggable" style="width:50px;float:left" class="ui-widget-content">
	        <p>Drag me to my target</p>
        </div>
    </div>
    

<script type="text/javascript" language="javascript">


    $(function () {
        $("#divToolbox").accordion({
            collapsible: true
        });


        var testo = $($("#draggable").children()[0]);
        alert(testo.height() + "x" + testo.width());



        $("#draggable").draggable({

            revert: "invalid", // when not dropped, the item will revert back to its initial position
            containment: '#grid',
            scroll: false,
            helper: "clone",
            cursor: "move",
            appendTo: 'body'


        });

        $("#grid").selectable({
            stop: function () {
                var result = $("#select-result").empty();
                $(".ui-selected", this).each(function () {
                    var index = $("#selectable li").index(this);
                    result.append(" #" + (index + 1));
                });
            }
            ,
            filter: '._ctrGrid'
        });







//        $(function () {

//            $('#container').masonry({
//                itemSelector: '.box',
//                columnWidth: 240

//            });

//        });





    });

$(window).ready(function ($) {
    $("#tool").draggable({

        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: '#grid',
        scroll: false,
        helper: "clone",
        cursor: "move",
        appendTo: 'body'


    });

    $("#grid").droppable({
        accept: "#tool, #draggable",
        activeClass: "ui-state-hover",
        hoverClass: "ui-state-active",
        drop: function (event, ui) {
            $(this).append(ui.draggable.clone());

        }


    });
});

    function Probar(){
        $("#xx").append("<div class='fullwidth'><img src='controls/jquery/Cycle_Plugin/img/toolbox.png' /></div>");
    }

    

       
    

    
</script>

    </form>
</body>
</html>

