if(!xrLiN.pref) {
    xrLiN.pref = {
        Name        : "xrLiN Preferences Javascript Library",
        CPref       : Components.classes["@mozilla.org/preferences-service;1"],
        IService    : Components.interfaces.nsIPrefBranch,
        IString     : Components.interfaces.nsISupportsString,
        CString     : Components.classes["@mozilla.org/supports-string;1"],
        Service     : null,
        getService : function() {
            return xrLiN.pref.Service;
        },
        init : function() {
            xrLiN.pref.Service = xrLiN.pref.CPref.getService(xrLiN.pref.IService);
        },
        newString   : function() {
           return xrLiN.pref.CString.createInstance(xrLiN.pref.IString); 
        },
        getStringPref: function(prefname) {
           var str = xrLiN.pref.newString();
           try {str = xrLiN.pref.Service.getComplexValue(prefname,xrLiN.pref.IString);}
           catch (e) {
            xrLiN.debug.print("Error! getStringPref() : " + e);
            return null;
            }
           return str.data;
        },
        setStringPref   : function(prefname,value) {
           var str = xrLiN.pref.newString(); 
           str.data = value;
           try { xrLiN.pref.Service.setComplexValue(prefname,xrLiN.pref.IString,str);}
           catch (e) {
               xrLiN.debug.print("Error! setStringPref() : " + e);
               return false;
            }
           return true;
        },
        setBoolPref :
            function(prefname,value) {
                try {
                    xrLiN.pref.Service.setBoolPref(prefname,value);
                }
                catch(e){
                    xrLiN.debug.print("Error! setBoolPref() : " + e);
                }
            },
        getBoolPref :
            function(prefname) {
                try {
                    return xrLiN.pref.Service.getBoolPref(prefname);
                }
                catch(e) {
                    xrLiN.debug.print("Error! getBoolPref() : " + e);
                    return null;
                }
            },
        setIntPref :
            function(prefname,value) {
                try {
                    xrLiN.pref.Service.setIntPref(prefname,value);
                }
                catch(e){
                    xrLiN.debug.print("Error! setIntPref() : " + e);
                }
            },
        getIntPref :
            function(prefname) {
                try {
                    return xrLiN.pref.Service.getIntPref(prefname);
                }
                catch(e) {
                    xrLiN.debug.print("Error! getIntPref() : " + e);
                    return null;
                }
            }
    }
    xrLiN.pref.init();
};

