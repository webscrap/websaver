const XRPREF = xrLiN.pref;

WebSaverGlobal.pref = {
    branch  : "extensions.websaver2.",
    getDirectory : function() {
        var result = XRPREF.getStringPref(this.branch + "directory");
        return result;
    },
    setDirectory : function(fn) {
        XRPREF.setStringPref(this.branch + "directory",fn);
    },
    getStorage : function() {
       var result = XRPREF.getStringPref(this.branch + "storage");
       return result;
    },
    setStorage : function(value) {
        XRPREF.setStringPref(this.branch + "storage",value);
    },
    getEnableDblClick : function() {
        return XRPREF.getBoolPref(this.branch + "enabledblclick");
    },
    setEnableDblClick : function(value) {
        XRPREF.setBoolPref(this.branch + "enabledblclick",value);
    },
    getEnablePersist : function() {
        return XRPREF.getBoolPref(this.branch + "enablepersist");
    },
    setEnablePersist : function(value) {
        XRPREF.setBoolPref(this.branch + "enablepersist",value);
    },
    getLastTopicFile : function() {
        return XRPREF.getStringPref(this.branch + "lastTopicFile"); 
    },
    setLastTopicFile : function(value) {
        XRPREF.setStringPref(this.branch + "lastTopicFile",value);
    },
    getLastCatalogLabel : function() {
        return XRPREF.getStringPref(this.branch + "lastCatalogLabel"); 
    },
    setLastCatalogLabel : function(value) {
        XRPREF.setStringPref(this.branch + "lastCatalogLabel",value);
    }

}
