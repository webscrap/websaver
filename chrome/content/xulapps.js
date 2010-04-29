const WebSaverBaseUrl = 
        "chrome://websaver2/content/";
const WebSaverMainUrl = 
        WebSaverBaseUrl + "websaver.xul";
const WebSaverSelectTopicUrl = 
        WebSaverBaseUrl + "seltopic.xul";
const WebSaverCatalogEditorUrl =
        WebSaverBaseUrl + "cataedit3.xul";
const WebSaverTopicEditorUrl =
        WebSaverBaseUrl + "topicedit.xul";
const WebSaverOptionsUrl = 
        WebSaverBaseUrl + "options.xul";
const WebSaverManagerUrl = 
        WebSaverBaseUrl + "managestore.xul";
const WebSaver_Func_SaveTopic = 
    "saveTopic";

const WebSaver_Func_EditTopic = 
    "editTopic";

WebSaverGlobal.app = {
    editTopic : function(topic,win) {
        var op = win ? win : window;
        op.openDialog(
            WebSaverTopicEditorUrl,
            Date(),
            "chrome,resizable=yes,modal,centerscreen",
            topic);
        return topic;
    },
    editCatalog : function(fileOrCatalog,fa,fb,win) {
        var op = win ? win : window;
        op.openDialog(
            WebSaverCatalogEditorUrl,
            Date(),
            "chrome,resizable=yes,modal,centerscreen",
            fileOrCatalog,fa,fb);
        return fileOrCatalog;
    },
    selectTopic : function(doc,win) {
        var opener = win ? win : window;
        var passback = {value:null};
        opener.openDialog(
            WebSaverSelectTopicUrl,
            Date(),
            "chrome,modal,resizable=yes,centerscreen",
            doc,
            passback);
        return passback.value;
    },
    openOptions : function(win) {
        var op = win ? win : window;
        op.openDialog(
            WebSaverOptionsUrl,
            "WebSaverOptions",
            "chrome,resizable=yes,modal,centerscreen"
            );
    },
    openManager : function(win) {
        var opener = win ? win : window;
        opener.open(
            WebSaverManagerUrl,
            Date(),
            "chrome,resizable=yes,centerscreen"
            );
    }
}

