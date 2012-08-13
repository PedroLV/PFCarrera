/* Depends:
*	Diseñador.js
*   Control.js
* Designer.Model.ControlManager.js */

/* Clase que modela el Designer.Model.Grid. */
/* @param container contenedor del Designer.Model.Grid. */
/* @param gridSize tamaño de la rejilla.¡. */
Designer.UI.Grid = function (container, gridSize) {

    this.ID = "";
    this.GridSize = gridSize; //valor por defecto del tamaño

    this.$element = $(container);

    this.uiID = -1;

    this.ClientSize = new Designer.Size(this.$element.width(), this.$element.height());
    //CHANGED 11/10/2011 Se ha cambiado el posicionamiento a relativo.
    //this.Position = new Designer.Position(this.$element.position().top, this.$element.position().left);
    this.Position = new Designer.Position(0, 0);
    //END CHANGED

    /*OffSet es la posición que hay con respecto al punto 0.0 de la página. */
    this.OffSet = new Designer.Position(this.$element.position().top, this.$element.position().left);

    this.Name = "Grid";

    /*Es el contenedor padre. El Designer.Model.Grid es el contendor por defecto.*/
    this.ParentControl = null;

    this.HasParent = function (uiID, _elements) { return false; }

    this.Clear = function () {
        this.$element.empty();
        this.ClearControls();
    }

    //
    this.TemplateInfo = new Designer.TemplateInfo();
    //    var mainTemplate = new Designer.Template(
    //        {
    //            Name: 'ParseHTML',
    //            Template: '<div><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> \
    //                        <html xmlns="http://www.w3.org/1999/xhtml"> \
    //                        <head> \
    //                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> \
    //                        <title>${ Title } </title> \
    //                        </head> \
    //                        <body> \
    //                            ${Designer.Model.ControlManager.RenderTemplate(null);} \
    //                        </body> \
    //                        </html></div>'
    //        });

    //TEMAPLTE http://jsfiddle.net/p9WUN/2/
    var mainTemplate = new Designer.Template(
        {
            Name: 'ParseHTML',
            Template: '<div><div><span> \
                        <label>${ Title }</label> <br />\
                            ${Designer.Model.ControlManager.RenderTemplate(null)} \
                        </span></div></div>'
        });

    this.TemplateInfo.AddFile(mainTemplate);
}

var tmpControlDescriptor = new Designer.ControlDescriptor();
/*Devuelve true en caso de que el control tenga configurado un tamaño.*/
tmpControlDescriptor.Settings.HasSize = true;
tmpControlDescriptor.Settings.IsContainer = true;
/*Devuelve true en el caso de que la posición sea una propiedad.*/
tmpControlDescriptor.Settings.HasPosition = false;

tmpControlDescriptor.ClientSize = new Designer.Size(235, 236);
//*************************

tmpControlDescriptor.Properties = new Array(

            new Designer.ControlProperty(this, "GridSize", new Designer.PropertyTypes.NumericValue(), Enum.Categories.Editor)
            ); // condensed array


Designer.UI.Grid.prototype = new Designer.Control(tmpControlDescriptor); 

//DELETE
//jQuery.fn.quickOuterWidth = function () {
//    var elem = this.get(0);
//    if (window.getComputedStyle) {
//        var computedStyle = window.getComputedStyle(elem, null);
//        return elem.offsetWidth + (parseInt(computedStyle.getPropertyValue('margin-left'), 10) || 0) + (parseInt(computedStyle.getPropertyValue('margin-right'), 10) || 0);
//    } else {
//        return elem.offsetWidth + (parseInt(elem.currentStyle["marginLeft"]) || 0) + (parseInt(elem.currentStyle["marginRight"]) || 0);
//    }

//};
Designer.UI.DataSourceContainer = function (container) {

    this.ID = "";
    
    this.$element = $(container);

    this.uiID = -2;//uiID específico.

    this.ClientSize = new Designer.Size(this.$element.width(), this.$element.height());
    //CHANGED 11/10/2011 Se ha cambiado el posicionamiento a relativo.
    //this.Position = new Designer.Position(this.$element.position().top, this.$element.position().left);
    this.Position = new Designer.Position(0, 0);
    //END CHANGED

    /*OffSet es la posición que hay con respecto al punto 0.0 de la página. */
    this.OffSet = new Designer.Position(this.$element.position().top, this.$element.position().left);

    this.Name = "DataSourceContainer";

    /*Es el contenedor padre. El Designer.Model.Grid es el contendor por defecto.*/
    this.ParentControl = null;

    this.Clear = function () {
        this.$element.empty();
        this.ClearControls();
    }

    this.HasParent = function (uiID, _elements) { return false; }

    //
    this.TemplateInfo = new Designer.TemplateInfo();
//    var mainTemplate = new Designer.Template(
//        {
//            Name: 'ParseHTML',
//            Template: '<div><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> \
//                        <html xmlns="http://www.w3.org/1999/xhtml"> \
//                        <head> \
//                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> \
//                        <title>${ Title } </title> \
//                        </head> \
//                        <body> \
//                            ${Designer.Model.ControlManager.RenderTemplate(null);} \
//                        </body> \
//                        </html></div>'
//        });

    //TEMAPLTE http://jsfiddle.net/p9WUN/2/
        var mainTemplate = new Designer.Template(
        {
            Name: 'ParseHTML',
            Template: '<div><div><span> \
                        <label>${ Title }</label> <br />\
                            ${Designer.Model.ControlManager.RenderTemplate(null)} \
                        </span></div></div>'
        });

    this.TemplateInfo.AddFile(mainTemplate);
}

tmpControlDescriptor = new Designer.ControlDescriptor();
/*Devuelve true en caso de que el control tenga configurado un tamaño.*/
tmpControlDescriptor.Settings.HasSize = false;
tmpControlDescriptor.Settings.IsContainer = true;
tmpControlDescriptor.Settings.PositionMode = Enum.PositionMode.FlowLayout;
/*Devuelve true en el caso de que la posición sea una propiedad.*/
tmpControlDescriptor.Settings.HasPosition = false;

tmpControlDescriptor.ClientSize = new Designer.Size(235, 236);
//*************************

tmpControlDescriptor.Properties = new Array(

            new Designer.ControlProperty(this, "GridSize", new Designer.PropertyTypes.NumericValue(), Enum.Categories.Editor)
            ); // condensed array


Designer.UI.DataSourceContainer.prototype = new Designer.Control(tmpControlDescriptor);

tmpControlDescriptor = null;

//DELETE
//jQuery.fn.quickOuterWidth = function () {
//    var elem = this.get(0);
//    if (window.getComputedStyle) {
//        var computedStyle = window.getComputedStyle(elem, null);
//        return elem.offsetWidth + (parseInt(computedStyle.getPropertyValue('margin-left'), 10) || 0) + (parseInt(computedStyle.getPropertyValue('margin-right'), 10) || 0);
//    } else {
//        return elem.offsetWidth + (parseInt(elem.currentStyle["marginLeft"]) || 0) + (parseInt(elem.currentStyle["marginRight"]) || 0);
//    }

//};