<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="jtest.aspx.cs" Inherits="PFCarrera.jtest" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    
    <title>jtest</title>
       <link id="cssMain" href="css/main.css" rel="stylesheet" type="text/css"/>
    <link href="css/smoothness/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker/colorpicker.css" />
    <link href="css/fontselector/fontselector.css" rel="stylesheet" type="text/css" />
    <link href="css/jquery.rte/jquery.rte.css" rel="stylesheet" type="text/css" />
      <script src="js/NameSpaces.js" type="text/javascript"></script>
      <script src="js/jquery-1.6.2.js" type="text/javascript"></script>
      <script src="js/jquery.tmpl.min.js" type="text/javascript" ></script>
      <script src="js/Nodes.js" type="text/javascript"></script>
      <script src="js/depuracion.js" type="text/javascript"></script>
      <script src="js/Control.js" type="text/javascript"></script>
      <script src="js/grid.js" type="text/javascript"></script>
      <script src="js/Designer.Model.ControlManager.js" type="text/javascript"></script>
      <script src="js/ToolBoxManager.js" type="text/javascript"></script>
      <script src="js/EventManager.js" type="text/javascript"></script>
      <script src="js/TemplateInfo.js" type="text/javascript"></script>
      <script src="js/json2.js" type="text/javascript"></script>
      <script src="controls/xml/GenericDescriptor.js" type="text/javascript"></script>
      <script src="js/VisualEditors.js" type="text/javascript"></script>
      <script type="text/javascript" src="js/colorpicker.js"></script>
      <script src="js/jqfontselector.js" type="text/javascript"></script>
    <script src="js/jquery.rte.js" type="text/javascript"></script>
<script src="js/jquery.rte.tb.js" type="text/javascript"></script>
    
      <script src="js/jquery-ui-1.8.14.custom.min.js" type="text/javascript"></script>
      
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	  <meta name="description" content="Proyecto Fin de Carrera, Pedro Leal" />
      <meta http-equiv="Content-Language" content="es-ES" />
      <meta name="lang" content="es" />
      <meta http-equiv="Cache-Control" content="no-cache, mustrevalidate" />


 
</head>
<body>

      <style type="text/css">
#targetElement { width:240px;height:200px;background-color:#999;margin:30px auto; }
.positionDiv { width:50px;height:50px;opacity:0.6; }
#position1 {background-color:#F00;}
#position2 {background-color:#0F0;}
#position3 {background-color:#00F;}
#position4 {background-color:#FF0;}
</style>

    <form id="form1" runat="server">
    <div>
     <script type="text/javascript" language="javascript">
     $(document).ready(function () {

         $("#position1").position({
             my: "center",
             at: "center",
             of: "#targetElement"
         });
         $("#position2").position({
             my: "left top",
             at: "left top",
             of: "#targetElement"
         });
         $("#position3").position({
             my: "right center",
             at: "right bottom",
             of: "#targetElement"
         });
        

        


         $("#kk").draggable({
            
             scroll: false,
             cursor: "move",
             delay: 200
           
         });

         $("#kk").resizable({ alsoResize: $("#kk").children(), autoHide: true });

         $("#divR").draggable({

             revert: "invalid", // when not dropped, the item will revert back to its initial position
             containment: '#dRela',
             scroll: false,
             helper: "clone",
             cursor: "move"
             ,
             appendTo: 'body'


         });
     });

     function Probar() {
        alert( $("#position3").position());
     }
  </script>
  
 test
   
<div id="targetElement">
  <div class="positionDiv" id="position1">1</div>
  <div class="positionDiv" id="position2">2</div>
  <div class="positionDiv" id="position3">3</div>
  <div class="positionDiv" id="position4">4</div>
</div>


<input type="button" onclick="Probar()" value="test" />
        <asp:Panel ID="Panel1" runat="server">
        </asp:Panel>
    </div>

    <div id="kk" class="_ctrGrid"><img id="imgkk"  src="controls/jquery/Cycle_Plugin/img/designer.png" /></div>
    
     

    <div id="dRela" style="width:100%;float:left;height:400px;border:2px solid #0c0c0c">
    
       <div id="divR" style="width:100px;height:100px;background-color:Blue;top:10px;left:10px;">test </div>
        <div style="width:100px;height:100px;background-color:Red;position:relative;top:0px;left:0px;float:left;"> </div>
         <div style="width:100px;height:100px;background-color:Green;position:relative;top:10px;left:50px;float:left;"> </div>
         <div style="width:100px;height:100px;background-color:Teal;position:relative;top:-50px;left:160px;float:left;"> </div>
    
    </div>

    <div id="Div1" style="width:90%;float:left;height:400px;border:2px solid #0c0c0c;position:relative">
    
       <div id="div2" style="width:100px;height:100px;background-color:Blue;top:10px;left:10px;position:absolute;z-index:4">10,10 </div>
        <div style="width:100px;height:100px;background-color:Red;position:absolute;top:0px;left:0px;float:left;">0,0 </div>
        
    
    </div>
    
   <div  style="width:100%;float:left;height:400px;border:2px solid #5c5c0c">
<span style="position:relative; top:20px; left:30px;">Posición relativa </span> 
<table width="100%" border="1" cellpadding="0" cellspacing="0" bordercolor="#000000"> 
  <tr> 
    <td>&nbsp;</td> 
    <td>&nbsp;</td> 
  </tr> 
  <tr> 
    <td>&nbsp;</td> 
    <td>&nbsp;</td> 
  </tr> 
</table> 
<div style="position:relative; top:-10px; left:30px;">Otra posición relativa</div> 
    </div>
    </form>
</body>
</html>
