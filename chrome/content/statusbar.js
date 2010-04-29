
WebSaverGlobal.statusBar = {
    window : null,
    document : null,
    element : null,
    defaultLabel : "WebSaver2",
    label: null,
    ws : null,
    init : function() {
        this.document = document;
        this.window = window;
        this.element = document.getElementById("WebSaverStatusBar");
        this.ws = getWebSaverGlobal();
        this.label = this.defaultLabel;
        this.message("Initializing...");
    },
    reset : function() {
        this.document.getElementById("WebSaverStatusBar").label=this.label;
    },
    message : function(msg) {
        this.element.label = msg;
        this.window.setTimeout("WebSaverGlobal.statusBar.reset()",1500);
        //var last = this. ws.pref.getLastTopicFile();
        //if(last) {
        //last = last.replace(/^.*\//g,"");
        //this.label = this.defaultLabel + "(" + last + ")";
        //}
    }
}
