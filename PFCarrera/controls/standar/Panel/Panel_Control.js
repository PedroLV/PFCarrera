function Panel_Control() {

	this.RegisterToolBox = function (tbInfo) {


		this.ToolBoxInfo = tbInfo;
		/* Inizializamos todos los settings de este control. Sólo hace falta establecer aquellos que sean distintos a los valores por defecto.*/
		this.Settings.ResizeContainer = false;
		this.Settings.ResizeContent = false;
		/*es un flag para el diseñador. Indica si el control puede cambiar su tamaño. Valores posibles Enum.ResizeMode = { none: 0, all: 1, width: 2, height:3 }*/
		this.Settings.AllowResize = Enum.ResizeMode.all; //solo se permite variar el ancho. El alto viene determinado por el texto.

		this.Settings.IsContainer = true; //admite controles hijos de este control.

		/*Devuelve true en caso de que el control tenga configurado un tamaño.*/
		this.Settings.HasSize = true;

		/*Devuelve true en el caso de que la posición sea una propiedad.*/
		this.Settings.HasPosition = true;

		this.ClientSize = new Designer.Size("200", "150");
		this.Position = new Designer.Position(0, 0); //la posición no tiene valor por defecto.
		/* inicializamos todos lo valores del descriptor */
		//this.ToolboxBitmap = function () { return tbInfo.URL + 'img/toolbox.png'; }
		//this.Text = "Panel";
		//diseñador custom. No es necesario, es solo para mostrar que se puede hacer así.
		this.GetDesigner = new Designer.ControlDesigner(this.Name, '<div class="_ctrGrid grid8"  style="background-color:#ccc;float:left"></div>');

		//Inicializo mi template.
		this.TemplateInfo = new Designer.TemplateInfo();
		var mainTemplate = new Designer.Template(
		{
			Name: 'ParseHTML',
			Template: '<div>\n<div>\n \
						\t<div Id="${ID}">\n \
							${Designer.Model.ControlManager.RenderTemplate(ID)} \
						\t</div>\n \
					</div>\n</div>\n'
		});

		this.TemplateInfo.AddFile(mainTemplate);

		this.Properties = new Array(
			new Designer.ControlProperty(this, "Border", new Designer.PropertyTypes.Borders(), Enum.Categories.Style),
			new Designer.ControlProperty(this, "Paddings", new Designer.PropertyTypes.Paddings(), Enum.Categories.Style)
			);

	};     //por defecto no se registra ningún elemento. Este método necesita un objeto de tipo toolboxInfo, para saber donde está.


	this.onInit = function ($control) {


	}

}

Panel_Control.prototype = new Designer.ControlDescriptor(); //valores por defecto.