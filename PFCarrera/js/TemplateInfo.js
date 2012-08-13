/* Depends:
*	Namespaces.js
*/
//Modela un objeto Plantilla.
//El constructor recibe como parámetro el engine que se encargará de la transformación de todos los elementos de la plantilla.
Designer.TemplateInfo = function () {
    var _files = new Array(); //files or directories
    
    this.GetFiles = function () { return _files; }
    this.AddFile = function (io) {
        io.Parent = this;
        _files.push(io);
    }
    this.TemplateEngine = null; //engine de que transformará el template.
}
//Modela un objeto abstracto de tipo Input OutPut
Designer.IO = function () {
    this.Name = new String(); //nombre del fichero que genera
    this.Parent = null;
    this.Destination = new String();
}

//Modela una carpeta a generar.
Designer.Directory = function () {
    
    this.Name = name;
    this.Path = '';
    
    this.AddFile = function (io) {
        io.Parent = this;
        _files.push(file);
    }

    this.GetFiles = function () { return _files; }
}
Designer.Directory.prototype = new Designer.IO();

//Modela un fichero de recursos, ya sea un css, una imagen
Designer.File = function () {
    this.Source = new String();
    this.Destination = new String();
    this.Parent = null;
}
Designer.File.prototype = new Designer.IO();

//Modela una plantilla, que generará un fichero en  función del objeto que se diseñe.
Designer.Template = function (options) {

    if (options != null) {

        if (options.Name != null) {
            this.Name = options.Name;
        }
        if (options.Template != null) {
            this.Template = options.Template;
        }
        if (options.Destination != null) {
            this.Destination = options.Destination;
        }
    } else {
        this.Template = new String(); //template.
    }
}
Designer.Template.prototype = new Designer.IO();

