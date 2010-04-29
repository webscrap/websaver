if (!xrLiN) {
    var xrLiN = { 
        consoleService : Components.classes["@mozilla.org/consoleservice;1"],
        consoleInterface : Components.interfaces.nsIConsoleService,
        console : null,
        utils:          null,
	fileIO:	        null, 
	pref:		null,
	XML:		null,
	system:	        null,
	window:	        null,
        debug:          null,
        zip:            null,
        string:         null,
        menu:           null,
        dom:            null,
        os:             null,
        version:        "200802010001",
        author:         "xiaoranzzz@myplace.hell",
        enableDebug:    true,
        init    : function() {
            this.os=Components.classes["@mozilla.org/xre/app-info;1"].
                        getService(Components.interfaces.nsIXULRuntime).OS;
            xrLiN.debug.init();
            xrLiN.debug.print("xrLiN(" + this.os + ") initialized.");
        },
        debug : {
            init    : function() {
                if(!xrLiN.console) {
                    xrLiN.console = 
                        xrLiN.consoleService.getService(
                            xrLiN.consoleInterface);
                }
            },
            print   : function(text) {
                if(xrLiN.enableDebug)
                    xrLiN.console.logStringMessage(text);
                return xrLiN.debug;
            }
        },
        getService : function(serviceName) {
            var result = xrLiN[serviceName];
            if(!result) {
                throw("xrLiN." + serviceName + " not available!");
                return null;
            }
            else {
                result.init();
                return result;      
            }
        }
    }
    xrLiN.init();
}

    
