



var jQueryTemplateEngine = {


    Render: function (template, object, container, modo) {
        var contenido = $(template).tmpl(object);
        if (modo == "html") {
            contenido.appendTo("#" + container);
        } else {
            $("#" + container).text(contenido.html()); //espero que lo imprima en modo html.
        }
    }
};