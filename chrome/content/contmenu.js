/*
dependent on
    websaver2var.js
    websaver2app.js
    xrlin.system.js
*/
var WebSaverContextMenu = {
    init : function()
    {
        document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", WebSaverContextMenu.initContextMenu, false);

        if (WebSaverGlobal.preference.enableDblClick)
            window.addEventListener("dblclick", WebSaverContextMenu.onDblClick, false);
    },
    onDblClick : function(event)
    {
        var target = event.originalTarget;
        if(!target) return;
        if(!target.nodeName) return;
        if(target.nodeName.toLowerCase()!="img") return;
        var fakemenu = {target:event.originalTarget};
        WebSaverContextMenu.loadMain(fakemenu,target.ownerDocument,"TARGET",WebSaverGlobal.pref.getLastTopicFile());
    },

    initContextMenu : function()
    {
        gContextMenu.showItem("websaver2_menu_target", 
                gContextMenu.onImage||gContextMenu.onLink);
        gContextMenu.showItem("websaver2_menu_select", 
                gContextMenu.isContentSelected);
    },
   
    menuClick : function(type) {
        this.loadMain(gContextMenu,gContextMenu.target.ownerDocument,type,null);
    },
    loadMain : function(cmenu,ownDoc,type,file) {
        WebSaverGlobal.topicSaver.saveTopic(
            cmenu,
            ownDoc,
            type,
            file
            );
    }
};
