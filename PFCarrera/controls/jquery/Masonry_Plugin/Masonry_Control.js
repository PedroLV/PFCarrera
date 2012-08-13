 /* Depends:
 *	Control.js
 */
function Masonry_Control()
{
   
    this.RegisterToolBox = function (tbInfo) {

        //        var utils = new CommonTasks();

        //        utils.AddScript(toolBoxInfo.URL + 'jquery.cycle.all.js');
        jQuery.getScript(tbInfo.URL + 'jquery.masonry.min.js');
        this.ToolBoxInfo = tbInfo;

        /* Inizializamos todos los settings de este control. Sólo hace falta establecer aquellos que sean distintos a los valores por defecto.*/
        this.Settings.ResizeContainer = true;
        this.Settings.AllowResize = Enum.ResizeMode.width; //solo se permite variar el ancho. El alto viene determinado por el texto.

        //this.ToolboxBitmap = function () { return tbInfo.URL + 'img/toolbox.png'; }
        //this.Text = "Masonry Plugin";
        //diseñador genérico donde le pasa un churro html.
        this.GetDesigner = new Designer.ControlDesigner(this.Name, '<div class="_ctrGrid"><p class="box col1">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.</p></div>');

    };  
    
    this.onInit = function ($control) {

        $control.masonry({
            itemSelector: '.box'
        });

        
    }
}

Masonry_Control.prototype = new Designer.ControlDescriptor(); //valores por defecto.

