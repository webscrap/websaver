if(!xrLiN.debug) {
    if(xrLiN.enableDebug) {
        xrLiN.debug = {
            consoleService : Components.classes["@mozilla.org/consoleservice;1"],
            consoleInterface : Components.interfaces.nsIConsoleService,
            console : null,
            init : function() {
                this.console = this.consoleService.getService(this.consoleInterface);
                this.print("xrLiN.debug initialized.");
                return true;
            },
            print : function(text) {
                this.console.logStringMessage(text);
                return this;
            }
        };
        xrLiN.debug.init();
    }
    else {
        xrLiN.debug = {
            print : function() {return this;}
        };
    }
}

