//Esta clase se emplea para sincronizar acciones de JAvascript.
//Resulta que hay ciertos elementos que hay que esperar a que se carguen y son ejecuciones asincronas que van por su cuenta.
//Con esta clase emito tantas esperas como sea necesario, y una vez que el contador se pone a cero, emito el evento de tareas finalizadas.

Designer.EventManager = function (msg_container) {

    var $msgContainer = $(msg_container);
    var listeners = new Array();
    var waits = 0;

    this.Wait = function () { waits++; }
    this.Signal = function () {
        waits--;
        if (waits == 0) { doEvent(); }
    }

    this.onSignaling = function (f) {
        listeners.push(f);
    }

    function doEvent() {
        while (listeners.length > 0) {
            try {
                listeners.pop()();
            } catch (err) {
                alert(err.Description);
            }
        }
    }

    this.ConfigureProperties = function (parent) {
        if (parent == null) {
            $(".us-expanded").click(collapse);

            $(".us-collapsed").click(expand);
        } else {
            parent.find(".us-expanded").click(collapse);

            parent.find(".us-collapsed").click(expand);
        }
    }

    this.ExpandAll = function (parent) {

        if (parent == null) {


            $('(body').find(".us-collapsed").each(function () {
                collapse(this);
            });
        } else {

            parent.find(".us-collapsed").each(function () {
                expand(this);
            });
        }

    }

    function expand(e) {
        var me = e.target ? $(e.target) : $(e);

        me.unbind('click', expand); //vi
        var elemento = me.parent().children("._noVisible:first");

        if (elemento.html() == null) {
            elemento = me.parent().next("._noVisible");
        }
        me.removeClass("us-collapsed");
        me.addClass("us-expanded");

        elemento.removeClass("_noVisible");
        elemento.addClass("_visible");

        me.bind('click', collapse);

    }

    function collapse(e) {
        var me = $(this);
        me.unbind('click', collapse);
        var elemento = me.parent().children("._visible:first");

        if (elemento.html() == null) {
            elemento = me.parent().next("._visible");
        }



        elemento.removeClass("_visible");
        elemento.addClass("_noVisible");
        me.removeClass("us-expanded");
        me.addClass("us-collapsed");


        me.bind('click', expand);
    }
    /*Se utliza para mostrar mensajes al usuario */
    this.HandleMessage = function (texto, ex, tipo) {
        //TODO mostrar mensajes al usurio 11/10/2011 usando Enum.MessageType = { Info: 0, Warning: 1, Error: 2 }

        //        if (tipo == Enum.MessageType.Warning) {

        //        }
        if (ex && ex.description) {
            texto += ex.description;
        }
        if (ex && ex.message) {
            texto += ex.message;
        }

        var msgNode = $(("<div class=\"msg{0} msgUser\">{1}</div>").format(tipo.toString(), texto));
        //var msgNode = $("<div class=\"prop-box\"><div class=\"spacio us-expandable us-expanded\"></div></div>");

        $msgContainer.prepend(msgNode); //TODO hacer que se inserte en la primera posicion

    }

}


