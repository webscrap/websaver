var WebSaverGlobal =  {
    name        : "WebSaver2",
    version     : "1.0",
    author      : "xiaoranzzz@myplace.hell",
    pdate       : "2008/02/25",
    os          : null,
    preference    : {
        storage : null,
        directory : null,
        enableDblClick  : null,
        enablePersist   : null,
        catalog         : null
    },
    window      : null,
    statusBar   : null,
    pref        : null,
    app         : null,
    database    : null,
    topicSaver  : null,
    init        : function() {
        this.window = window;
        this.os = xrLiN.os;
        this.preference.storage = this.pref.getStorage();
        this.preference.directory = this.pref.getDirectory();
        this.preference.enableDblClick = this.pref.getEnableDblClick();
        this.preference.enablePersist = this.pref.getEnablePersist();
        this.preference.catalog = this.database.readCatalog(
            "/",
            this.preference.storage,
            this.preference.directory
        );
        this.preference.catalog.path = '/';
    },
    savePreference : function() {
        this.pref.setStorage(this.preference.storage);
        this.pref.setDirectory(this.preference.directory);
        this.pref.setEnableDblClick(this.preference.enableDblClick);
        this.pref.setEnablePersist(this.preference.enablePersist);
    },
    saveCatalog     : function() {
        this.database.write(this.preference.catalog,this.preference.storage);
    },
    save         : function() {
        this.savePreference();
        this.saveCatalog();
    },
    editCatalog  : function() {
        var r = this.app.editCatalog(this.preference.catalog,true,true);
        if(r.changed) {
            this.preference.catalog = r;
            this.saveCatalog();
        }
    }
}

function WebSaverGlobalSave() {
    var ws = getWebSaverGlobal();
    ws.save();
}
function WebSaverGlobalInit() {
    WebSaverGlobal.init();
    WebSaverGlobal.statusBar.init();
    WebSaverContextMenu.init();
    window.addEventListener("unload",WebSaverGlobalSave,false);
}

function def_string(value) {return value ? value : "";}
function def_array(value) {return value ? value : new Array();}
function def_number(value) {return value ? value : 0;}
window.addEventListener("load",WebSaverGlobalInit,false);
