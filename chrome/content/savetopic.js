
WebSaverGlobal.topicSaver = {
    saveTopic : function(cMenu,doc,type,path) {
        xrLiN.debug.print("topicSaver Processing saveTopic()");
        var selects = this.getSelection(type,cMenu); 
        var total = selects.length;
        var topic;
        if(total<1) return false;
        if(path) { 
            var catalog = WebSaverGlobal.preference.catalog;
            topic = WebSaverGlobal.database.getChildByPath(catalog,path);
//            var id = WebSaverGlobal.database.getIdByPath(catalog,path);
//            topic = WebSaverGlobal.database.getChildById(catalog,id);
        }
        if(!topic) topic = WebSaverGlobal.app.selectTopic(doc,null);
        if(!topic) return false;
        topic.update();
//        topic.items = WebSaverGlobal.database.readItems(topic.rStorage);
        var o_count = topic.items.length;
        var persist = WebSaverGlobal.preference.enablePersist;
        var pFolder = persist ? topic.getDataFolder() : null;
        xrLiN.debug.print("saveTopic in " + pFolder);
        WebSaverGlobal.database.addItemsFromNodes(
                topic,
                selects,
                doc,
                pFolder
            );
        var n_count = topic.items.length;
        if(o_count != n_count) topic.writeItems();//WebSaverGlobal.database.writeItems(topic.items,topic.rStorage);
        this.message(topic,total,n_count - o_count);
        return true;
    },
    message : function(topic,total,saved) {
        var ignored = total - saved;
        var msg;
        if(ignored <= 0 && saved <= 0) 
            msg = "Nothing to do!";
        else if(saved>0 && ignored>0) 
                msg = saved + " saved, " + ignored + " ignored.";
        else if(saved>0)
            msg = saved + " saved.";
        else
            msg = ignored + " ignored.";
        WebSaverGlobal.statusBar.message(topic.label + ":" + msg);
    },
    getGoodElements : function(node,filter_yes,filter_no) {
        var res = new Array();
        for(var i=0;i<node.childNodes.length;i++) {
            var nn = node.childNodes[i];
            if(!nn.nodeName) {
                continue;
            }
            nn = nn.nodeName.toLowerCase();
            if(nn == "img" ) {//|| nn == "a") {
                res.push(node.childNodes[i]);
            }
            else if(node.childNodes[i].childNodes.length>0) {
                res = res.concat(this.getGoodElements(node.childNodes[i],filter_yes,filter_no));
            }
        }
        return res;
    },
    getSelection : function(type,cmenu) {
        type = type.toUpperCase();
        var ELMS = new Array();
        switch(type) {
        case "ALL" :
            var doc = cmenu.target.ownerDocument;
            ELMS = ELMS.concat(this.getGoodElements(doc));
            break;
        case "TARGET" :
            ELMS.push(cmenu.target);
            break;
        case "SELECT" :
            var sel = cmenu.target.ownerDocument.defaultView.getSelection();
            var range = sel.getRangeAt(0);
            var rangedoc = range.cloneContents();
            ELMS = ELMS.concat(sel,this.getGoodElements(rangedoc));
            //ELMS.push(cmenu.target.ownerDocument.defaultView.getSelection());
            break;
        default :
            break;
        }
        return ELMS;
    },
    getString : function(msg) {
        return document.getElementById("websaver.locale").getString(msg);
    }
}


