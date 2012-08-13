function TextPanel_Control() {
    

    this.RegisterToolBox = function (tbInfo) {


        this.ToolBoxInfo = tbInfo;
        /* Inizializamos todos los settings de este control. Sólo hace falta establecer aquellos que sean distintos a los valores por defecto.*/
        this.Settings.ResizeContainer = false;
        this.Settings.ResizeContent = false;
        /*es un flag para el diseñador. Indica si el control puede cambiar su tamaño. Valores posibles Enum.ResizeMode = { none: 0, all: 1, width: 2, height:3 }*/
        this.Settings.AllowResize = Enum.ResizeMode.all; //solo se permite variar el ancho. El alto viene determinado por el texto.
        /*Devuelve true en caso de que el control tenga configurado un tamaño.*/
        this.Settings.HasSize = true;

        /*Devuelve true en el caso de que la posición sea una propiedad.*/
        this.Settings.HasPosition = true;

        this.ClientSize = new Designer.Size("200", "150");
        this.Position = new Designer.Position(0, 0); 
       
        //diseñador custom. No es necesario, es solo para mostrar que se puede hacer así.
        this.GetDesigner = new Designer.ControlDesigner(this.Name, '<div class="_ctrGrid"><div style="width:100%;float:left"></div></div>');

        //Inicializo mi template.
        this.TemplateInfo = new Designer.TemplateInfo();
        var mainTemplate = new Designer.Template(
		{
		    Name: 'ParseHTML',
		    Template: '<div>\n<div>\n \
						\t<div Id="${ID}">\n \
							${Text} \
						\t</div>\n \
					</div>\n</div>'
		});

		this.TemplateInfo.AddFile(mainTemplate);

        var rte = new Designer.PropertyTypes.RichText('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.');
        rte.HasHtmlContent = true;
        

		this.Properties = new Array(
			new Designer.ControlProperty(this, "Border", new Designer.PropertyTypes.Borders(), Enum.Categories.Style),
			new Designer.ControlProperty(this, "Paddings", new Designer.PropertyTypes.Paddings(), Enum.Categories.Style),
            new Designer.ControlProperty(this, "Text", rte, Enum.Categories.Editor),
            new Designer.ControlProperty(this, "DataSource", new Designer.PropertyTypes.DataSourceType(";;Text"), Enum.Categories.Data)

            );
    };
/*
    <Property  Name="DataSource" Category="Data">
			<PropertyType HasHtmlContent="false" typeName="Designer.PropertyTypes.DataSourceType">
				<DefaultValue>;;Text</DefaultValue>
			</PropertyType>
		</Property>
*/

    this.onInit = function ($control) {

       
    }
    //this.Site = new 

}

TextPanel_Control.prototype = new Designer.ControlDescriptor(); //valores por defecto.