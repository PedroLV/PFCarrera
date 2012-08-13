<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="DebugListener.aspx.cs" Inherits="PFCarrera.DebugListener" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>Hiper-Ventana</title>
     <link id="cssMain" href="css/main.css" rel="stylesheet" type="text/css"/>
    <link href="css/smoothness/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
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
       <script src="js/jquery-ui-1.8.14.custom.min.js" type="text/javascript"></script>
      <script src="js/jQuery.Extensions.js" type="text/javascript"></script>
</head>
<body style="overflow:scroll">
    <form id="form1" runat="server">
   
    
    <input type="button" id="btClear" value="Borrar" title="Limpiar"/>


    <div id="panel" class="fullwidth" >
    
    </div>
     <script type="text/javascript" language="javascript">
         var targetContainer = null;
         function GetDebugPanel() {
             targetContainer = $('#panel');
             targetContainer.append($("<p>hello</p>"));
             return targetContainer;
         }


         function Log(valor) {
             if (targetContainer) {
                 targetContainer.append($("<p>" + valor + "</p>"));
                 targetContainer.scrollTop(targetContainer.outerHeight());
             }
         }

         function Error(err) {
             if (targetContainer) {
                 targetContainer.append($("<p>" + err + "</p>"));
             }
         }


         function DebugElement(item, $element, control) {

             //var btt = $("<input style='float:right' type='submit' value='X'/>").button().click(function () { $("#" + item).html(''); });
             var titulo = $("<h1 class='ui-widget-header' style='float:left;width:100%'>" + item + "</h1>"); // onclick = 'javascript:$(#item).empty();'
             //titulo.append(btt);
             targetContainer.append(titulo);
             var $div = $("<div id='" + item + "' class='fullwidth'></div>");

             targetContainer.append($div);
             /****** style ***************************************/
             $div.append("<h3><a href='#'>Style</a></h3>");
             var $divStyle = $("<div></div>");

             $divStyle.append("<p>width: " + $element.width() + "</p>");
             $divStyle.append("<p>height: " + $element.height() + "</p>");
             $divStyle.append("<p>offset top: " + $element.offset().top + "</p>");
             $divStyle.append("<p>offset left: " + $element.offset().left + "</p>");
             $divStyle.append("<p>innerWidth: " + $element.innerWidth() + "</p>");
             $divStyle.append("<p>innerHeight: " + $element.innerHeight() + "</p>");
             $divStyle.append("<p>outerWidth: " + $element.outerWidth() + "</p>");
             $divStyle.append("<p>outerHeight: " + $element.outerHeight() + "</p>");
             $divStyle.append("<p>top: " + $element.position().top + "</p>");
             $divStyle.append("<p>left: " + $element.position().left + "</p>");

             /*---------------------------------------------*/
             $div.append($divStyle);
             /**************************************************/
             /****** Manipulation ***************************************/
             $div.append("<h3><a href='#'>Manipulation</a></h3>");
             var $divMan = $("<div></div>");

             //$divMan.append("<p>Text: " + $element.text() + "</p>");
             // $divMan.append("<p>html: " + $element.html() + "</p>");
             // $divMan.append("<p>val: " + $element.val() + "</p>");
             $divMan.append("<p>z-index: " + $element.css('z-index') + "</p>");
             $divMan.append("<p>position: " + $element.css('position') + "</p>");



             /*---------------------------------------------*/
             $div.append($divMan);
             /**************************************************/
             /****** Manipulation ***************************************/
             if (control != null) {
                 $div.append("<h3><a href='#'>Properties</a></h3>");
                 var $divProperties = $("<div></div>");

                 $divProperties.append("<p>ID: " + new Designer.ControlProperty(this, "ID", new Designer.PropertyTypes.StringValue(), null).PropertyType.TextToDisplay(control.ID) + "</p>");
                 $divProperties.append("<p>Size: " + new Designer.ControlProperty(this, "Size", new Designer.PropertyTypes.Size(), null).PropertyType.TextToDisplay(control.ClientSize) + "</p>");
                 $divProperties.append("<p>Position: " + new Designer.ControlProperty(this, "Position", new Designer.PropertyTypes.Position(), null).PropertyType.TextToDisplay(control.Position) + "</p>");
                 $divProperties.append("<p>Parent: " + new Designer.ControlProperty(this, "Parent", new Designer.PropertyTypes.StringValue(), null).PropertyType.TextToDisplay(control.ParentControl.ID) + "</p>");

                 if (control.ControlDescriptor.Properties != null && control.ControlDescriptor.Properties.length > 0) {

                   
                     jQuery.each(control.ControlDescriptor.Properties, function (i, prop) {
                         $divProperties.append("<p>" + prop.Name + ": " + prop.PropertyType.TextToDisplay(control.ProperyValues[i]) + " CSS:" + prop.PropertyType.CssStyleDisplay(control.ProperyValues[i]) + "</p>");

                     });

                 }

                 

                 if (control.GetChildControls().length > 0) {
                       var tmpControles = "<p>CONTROLS:<ul>";

                       jQuery.each(control.GetChildControls(), function (i, ctrl) {
                           tmpControles += "<li>" + ctrl.ID + "</li>";
                       });


                     $divProperties.append(tmpControles + "</ul></p>");

                 } else {
                     $divProperties.append("<p>CONTROLS: none</p>");
                 }

                 $divProperties.append("<p>JSON:" + control.toJSONString() + "</p>");
                 /*---------------------------------------------*/
                 $div.append($divProperties);
             }

             /****** Property Values ***************************************/
             $div.append("<h3><a href='#'>Offset</a></h3>");
             var $divoff = $("<div></div>");

             $divoff.append("<p>top: " + $element.position().top + "</p>");
             $divoff.append("<p>left: " + $element.position().left + "</p>");
             $divoff.append("<p>offset top: " + $element.offset().top + "</p>");
             $divoff.append("<p>offset left: " + $element.offset().left + "</p>");

             /*---------------------------------------------*/
             $div.append($divoff);
             targetContainer.scrollTop(targetContainer.outerHeight());
             /**************************************************/


             $div.accordion({
                 collapsible: true
             });

             /*
             <h3><a href="#">Section 3</a></h3>
             <div>
             <p>
             Nam enim risus, molestie et, porta ac, aliquam ac, risus. Quisque lobortis.
             Phasellus pellentesque purus in massa. Aenean in pede. Phasellus ac libero
             ac tellus pellentesque semper. Sed ac felis. Sed commodo, magna quis
             lacinia ornare, quam ante aliquam nisi, eu iaculis leo purus venenatis dui.
             </p>
             <ul>
             <li>List item one</li>
             <li>List item two</li>
             <li>List item three</li>
             </ul>
             </div>
             */

         }



         jQuery(document).ready(function ($) {
             $("#btClear").button().click(function () { targetContainer.html(''); });
         });
     </script>
    </form>
</body>
</html>
