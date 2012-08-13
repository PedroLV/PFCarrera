//Espacio de nombres para las clases que forman el nucleo del diseñador.
var Designer = {};

Designer.PropertyTypes = {};

Designer.PropertyNodes = {};

Designer.UI = {};

Designer.Schema = {};

Designer.Schema.XSD = {};


Designer.Util = {};

Designer.Model = {};

Designer.oData = {};

//Variables globales de configuración del diseñador.
Designer.Config = {}
Designer.Config.DesignerServerURL = "/services/Servidor.svc/";
Designer.Config.SelectableConfig = null;

//espacio de nombres para las colecciones
var Collection = {};

Designer["Event"] = {};
//espacio de nombre para las enumeraciones.
function Enum() { }
Enum.Events = { Init: 0, Resize: 1, Move: 2, Load: 3 }

Enum.ResizeMode = { none: 0, all: 1, width: 2, height: 3 }

Enum.Categories = { Style: 0, Data: 1, Control: 2, Settings: 3, Editor: 4, jQuery: 5 }

Enum.MessageType = { Info: 0, Warning: 1, Error: 2 }

Enum.PositionMode = { Absolute: 0, FlowLayout: 1 }

Designer.Contants = {};

Designer.Contants.FlowPanelContainer = '_flowLayout';

Designer.Util.getClass = function(eType, isCollection) {
    if (isCollection) {
        return 'Tcollection';
    } else if (eType.IsComlexType) {
        return 'Tcomplex';
    } else {
        return 'Tsimple';
    }
}


//metodos de extension
if (!String.prototype.format) {
    String.prototype.format = function () {
        var parametros = arguments;
        if (Object.prototype.toString.call(arguments[0]) === '[object Array]') {
            parametros = arguments[0];
        }
        var formatted = this;
        for (var arg = 0; arg < parametros.length; arg++) {
            formatted = formatted.replace(new RegExp("(\{)" + arg + "(\})", "gi"), parametros[arg]);
        }
        return formatted;
    };
}
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (str) { return (this.match("^" + str) == str) }
}


// linking the key-value-pairs is optional
// if no argument is provided, linkItems === undefined, i.e. !== false
// --> linking will be enabled
Collection.HashMap = function (linkItems) {
    this.current = undefined;
    this.size = 0;

    if (linkItems === false)
        this.disableLinking();
}

Collection.HashMap.noop = function () {
    return this;
};

Collection.HashMap.illegal = function () {
    throw new Error("illegal operation for maps without linking");
};

// map initialisation from existing object
// doesn't add inherited properties if not explicitly instructed to:
// omitting foreignKeys means foreignKeys === undefined, i.e. == false
// --> inherited properties won't be added
Collection.HashMap.from = function (obj, foreignKeys) {
    var map = new Map;

    for (var prop in obj) {
        if (foreignKeys || obj.hasOwnProperty(prop))
            map.put(prop, obj[prop]);
    }

    return map;
};

Collection.HashMap.prototype.disableLinking = function () {
    this.link = Collection.HashMap.noop;
    this.unlink = Collection.HashMap.noop;
    this.disableLinking = Collection.HashMap.noop;
    this.next = Collection.HashMap.illegal;
    this.key = Collection.HashMap.illegal;
    this.value = Collection.HashMap.illegal;
    this.removeAll = Collection.HashMap.illegal;

    return this;
};

// overwrite in Map instance if necessary
Collection.HashMap.prototype.hash = function (value) {
    if (value == null) {
        return null;
    }
    return (typeof value) + ' ' + (value instanceof Object ?
        (value.__hash || (value.__hash = ++arguments.callee.current)) :
        value.toString());
};

Collection.HashMap.prototype.hash.current = 0;

// --- mapping functions

Collection.HashMap.prototype.get = function (key) {
    var item = this[this.hash(key)];
    return item === undefined ? undefined : item.value;
};

Collection.HashMap.prototype.contains = function (key) {
    var item = this[this.hash(key)];
    return item != undefined;
};

Collection.HashMap.prototype.put = function (key, value) {
    var hash = this.hash(key);

    if (this[hash] === undefined) {
        var item = { key: key, value: value };
        this[hash] = item;

        this.link(item);
        ++this.size;
    }
    else this[hash].value = value;

    return this;
};

Collection.HashMap.prototype.remove = function (key) {
    var hash = this.hash(key);
    var item = this[hash];

    if (item !== undefined) {
        --this.size;
        this.unlink(item);

        delete this[hash];
    }

    return this;
};

// only works if linked
Collection.HashMap.prototype.removeAll = function () {
    while (this.size)
        this.remove(this.key());

    return this;
};

// --- linked list helper functions

Collection.HashMap.prototype.link = function (item) {
    if (this.size == 0) {
        item.prev = item;
        item.next = item;
        this.current = item;
    }
    else {
        item.prev = this.current.prev;
        item.prev.next = item;
        item.next = this.current;
        this.current.prev = item;
    }
};

Collection.HashMap.prototype.unlink = function (item) {
    if (this.size == 0)
        this.current = undefined;
    else {
        item.prev.next = item.next;
        item.next.prev = item.prev;
        if (item === this.current)
            this.current = item.next;
    }
};

// --- iterator functions - only work if map is linked

Collection.HashMap.prototype.next = function () {
    this.current = this.current.next;
};

Collection.HashMap.prototype.key = function () {
    return this.current.key;
};

Collection.HashMap.prototype.value = function () {
    return this.current.value;
};

Designer.IndexManager = function () {
    var idglobal = 0;

    this.GetNewID = function () {
        idglobal++;
        return idglobal + "";
    }
    this.UpdateID = function (current) {
        if (parseInt(current) > idglobal) {
            idglobal = parseInt(current);
        }
    }
};

Collection.List = function () {


    /* Elimina el elemento pasado como parametro del array */
    this.remove = function (item) {
        var j = 0;
        while (j < this.length) {
            if (this[j] == item) {
                this.splice(j, 1);
            } else {
                j++;
            }

        }
    };

    this.removeAll = function () {
       
        while (this.length > 0) {
            this.pop();

        }
    };

    this.contains = function (item) {
        var r = false;
        var j = 0;
        while (j < this.length) {
            if (this[j] == item) {
                r = true;
                break;
            } else {
                j++;
            }

        }
        return r;
    };
}

Collection.List.prototype = new Array();


Designer.LoadingPanel = function () {
    var _waitCounter = 0; //contador para mostrar la ventana de cargando.
    var _panel = null;
    this.Show = function () {
        _waitCounter++;
        if (_panel == null) {
            _panel = $('body');
        }
        if (_waitCounter == 1 && _panel != null) {
            _panel.append($(("<div id='loading' class='spinner' style='width: {0}px; height: {1}px; z-index: 4901;'></div>").format(_panel.innerWidth(), _panel.innerHeight())));
        }
    }

    this.Hide = function (forced) {
        _waitCounter--;
        if ((forced || _waitCounter <= 0) && _panel != null) {
            _panel.find("#loading").first().remove();
            _waitCounter = 0;
        }
    }
}











