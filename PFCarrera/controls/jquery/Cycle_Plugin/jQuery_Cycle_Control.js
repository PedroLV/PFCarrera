 /* Depends:
 *	Control.js
 *  jQuery.js
 */


function jQuery_Cycle_Designer() {

	{ this.DragTimeHtml = '<img src="controls/jquery/Cycle_Plugin/img/designer.png" />'; }
}

jQuery_Cycle_Designer.prototype = new Designer.ControlDesigner("Cycle Plugin", '<div class="_ctrGrid"><img  src="controls/jquery/Cycle_Plugin/img/designer.png" /></div>');

function jQuery_Cycle_Control()
{
	/*Este metodo se ejecuta cuando se registra el descriptor del control en el diseñador */
	this.RegisterToolBox = function (tbInfo) {
        //No es necesario ese fichero para el editor
	    //jQuery.getScript(tbInfo.URL + 'jquery.cycle.all.js');
        //******************************************************
		this.ToolBoxInfo = tbInfo;

		/* Inizializamos todos los settings de este control. Sólo hace falta establecer aquellos que sean distintos a los valores por defecto.*/
		this.Settings.ResizeContainer = true;
		/*es un flag para el diseñador. Indica si el control puede cambiar su tamaño. Valores posibles Enum.ResizeMode = { none: 0, all: 1, width: 2, height:3 }*/
		this.Settings.AllowResize = Enum.ResizeMode.all; //solo se permite variar el ancho. El alto viene determinado por el texto.

		/*Devuelve true en caso de que el control tenga configurado un tamaño.*/
		this.Settings.HasSize = true;

		this.ClientSize = new Designer.Size(200, 150); ;

		/*Devuelve true en el caso de que la posición sea una propiedad.*/
		this.Settings.HasPosition = true;
		/* inicializamos todos lo valores del descriptor */
		//this.ToolboxBitmap = function () { return tbInfo.URL + 'img/toolbox.png'; }
		//this.Text = "Cycle Plugin";
		//diseñador custom. No es necesario, es solo para mostrar que se puede hacer así.
		this.GetDesigner = new jQuery_Cycle_Designer(); //diseñador específico para este control.

		
		this.Position = new Designer.Position(0, 0); //la posición no tiene valor por defecto.
		//Inicializo mi template.
		this.TemplateInfo = new Designer.TemplateInfo();
		var mainTemplate = new Designer.Template(
		{
			Name: 'ParseHTML',
			Template: '<div>\n<div>\n \
						\t<div id="${ID}">\n \
							{{each Images}} \
							\t\t<img src="${$value}" width="200" height="200" />\n  \
							{{/each}} \
						\t</div>\n \
							$(document).ready(function() { \
								$("#${ID}").cycle({ \
									fx: "${Effect}" \
								}); \
							});\n \
					</div>\n</div>\n' 
			});

		this.TemplateInfo.AddFile(mainTemplate);

};   


	this.onInit = function ($control) {


	}


	this.Properties = new Array(
			new Designer.ControlProperty(this, "Border", new Designer.PropertyTypes.Borders(), Enum.Categories.Style),
			new Designer.ControlProperty(this, "Paddings", new Designer.PropertyTypes.Paddings(), Enum.Categories.Style),
			new Designer.ControlProperty(this, "Images", new Designer.PropertyTypes.ArrayValue(new Designer.PropertyTypes.StringValue()), Enum.Categories.Data),
			new Designer.ControlProperty(this, "Speed", new Designer.PropertyTypes.NumericValue(), Enum.Categories.jQuery),
			new Designer.ControlProperty(this, "TimeOut", new Designer.PropertyTypes.NumericValue(), Enum.Categories.jQuery),
			new Designer.ControlProperty(this, "Effect", new Designer.PropertyTypes.ListValue('none',['blindX', 'blindY', 'blindZ', 'cover', 'curtainX', 'curtainY', 'fade', 'fadeZoom', 'growX', 'growY', 'none', 'scrollUp', 'scrollDown', 'scrollLeft', 'scrollRight', 'scrollHorz', 'scrollVert', 'shuffle', 'slideX', 'slideY', 'toss', 'turnUp', 'turnDown', 'turnLeft', 'turnRight', 'uncover', 'wipe', 'zoom'],null), Enum.Categories.jQuery)
			//,
			//new Designer.ControlProperty(this, "Images", new Designer.PropertyTypes.ImageList(), Enum.Categories.Data)
			); // condensed array

	this.TemplateInfo = null;

	
}

jQuery_Cycle_Control.prototype = new Designer.ControlDescriptor(); //valores por defecto.


/*
	<div id="shuffle" class="pics">

		<img src="http://cloud.github.com/downloads/malsup/cycle/beach1.jpg" width="200" height="200" />

		<img src="http://cloud.github.com/downloads/malsup/cycle/beach2.jpg" width="200" height="200" />

		<img src="http://cloud.github.com/downloads/malsup/cycle/beach3.jpg" width="200" height="200" />

	</div>

		<pre><code class="mix">$('#shuffle').cycle({

	fx:     'shuffle',

	easing: 'easeOutBack',

	delay:  -4000

});</code></pre>

*/