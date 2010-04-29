
function CatalogHandler(catalog,menuList,catalogList,topicList) {

this.catalog = catalog;
this.menuList = menuList;
this.catalogList = catalogList;
this.topicList = topicList;

this.onTopicSelected = null;
this.onTopicDblClick = null;
this.onCatalogSelected = null;
this.onRefresh = null;
this.focusOn = 0;
this.stack = new Array();

this.popCatalog = function() {
    if(this.stack.length) {
        this.catalog = this.stack.pop();
    }
};
this.pushCatalog = function(idx) {
    var select = this.catalog.catalogs[idx];
    if(select.changed) {
        select.update();
        select.changed=false;
    }
    this.stack.push(this.catalog);
    this.catalog = select;
};

this.init = function() {
    this.catalog.update();
    this.catalog.path = "/";
    var me = this;
    this.menuList.addEventListener("command",function() { me.menuSelect(me);},false);
    this.topicList.addEventListener("select",function() { me.topicSelect(me);},false);
    this.catalogList.addEventListener("select",function() { me.catalogSelect(me);},false);
    this.refresh();
};

this.getTopicIndex = function() {
    return topicList.selectedIndex;
}

this.getCatalogIndex = function() {
    return catalogList.selectedIndex -1;
}

this.getTopic = function(cat) {
    var idx = topicList.selectedIndex;
    if(idx>=0) return cat.topics[idx];
    return null;
};

this.getCatalog = function() {
    var r = this.catalog;
    return r;
};

this.getCatalogPath = function() {
    var catalog = this.getCatalog();
    return catalog.path;
};

this.refresh = function() {
    var cat = this.catalog;
    var menuList = this.menuList;
    clearNode(menuList);
    var lbl = cat.path;
    menuList.appendItem(lbl);
    menuList.setAttribute("label",lbl);
    this.setCatalogList(cat);
    this.setTopicList(cat);
};

this.setCatalogList = function(cata) {
    var me = this;
    var catas = cata.catalogs;
    var catalogList = this.catalogList;
    clearNode(catalogList);
    var item = catalogList.appendItem("..");
    if(this.stack.length>0) {
        item.addEventListener("dblclick",function(){me.popCatalog();me.refresh();},false);
    }
    else {
        item.disabled=true;
    }
    for(var i=0;i<catas.length;i++) {
        catas[i].path = cata.path + catas[i].label + '/';
        var item = catalogList.appendItem(catas[i].label);
        item.addEventListener(
            "dblclick",
            function(){
                me.cataClick(me);
            },
            false);
    }
    if(this.onRefresh) 
        this.onRefresh();
};


this.setTopicList = function(cata) {
    var topics = cata.topics;
    var topicList = this.topicList;
    clearNode(topicList);
    var me = this;
    for(var i=0;i<topics.length;i++) {
        var item = topicList.appendItem(topics[i].label);
        topics[i].path = cata.path + topics[i].label;
        item.addEventListener("dblclick",function() {me.topicClick(me)},false);
    }
    if(this.onRefresh) 
        this.onRefresh();
};

this.cataClick=function(hd) {
    var idx = hd.catalogList.selectedIndex;
    var item = hd.catalogList.getItemAtIndex(idx);
    if(item) {
        var lbl = item.label ? item.label : item.getAttribute("label");
        if(lbl == "..") {
            hd.popCatalog();
            hd.refresh();
        }
        else if(lbl.match(/\//)) { 
            hd.jumpTo(lbl);
        }
        else {
            if(idx == 0) 
                hd.popCatalog();
            else  {
                hd.pushCatalog(idx-1);
            }
            hd.refresh();
        }
        return;
    }
    if(idx < 0) return;
    if(idx == 0) 
        hd.popCatalog();
    else 
        hd.pushCatalog(idx-1);
    hd.refresh();
};

this.topicClick = function(hd) {
    if(hd.onTopicDblClick) {
        var topic = hd.getTopic(hd.getCatalog());
        if(topic)
            hd.onTopicDblClick(topic);
    }
};

this.menuSelect = function(hd) {
    var lbl = hd.menuList.getAttribute("label");
    hd.jumpTo(lbl);


};

this.topicSelect = function(hd) {
    hd.focusOn = 2;
    if(hd.onTopicSelected) {
        var topic =hd.getTopic(hd.getCatalog());
        if(topic)
            hd.onTopicSelected(topic);
    }
};

this.catalogSelect = function(hd) {
    hd.focusOn = 1;
    if(hd.onCatalogSelected) {
        var idx = catalogList.selectedIndex;
        if(idx>0) {
            var cat = hd.catalog;
            cat = cat.catalogs[idx-1];
            if(cat) 
                hd.onCatalogSelected(cat);
        }
        else {
            hd.onCatalogSelected(null);
        }
    }
};


this.selectTopic = function(idx) {
    try {
        topicList.selectedIndex=idx;
    }
    catch(e) {
    }
};

this.scrollTo = function(idx) {
    try {
        topicList.scrollToIndex(idx);
        topicList.selectedIndex=idx;
    }
    catch(e) {
    }

};

this.jumpTo = function(path) {
    var ns = ws.database.getNamespace(this.catalog,path);
    if(ns) {
        this.stack = ns.stack;
        this.popCatalog();
        this.refresh();
        if(ns.index>=0)
            this.scrollTo(ns.index);
    }
};

this.copySelectedTo = function(root) {
    var focusOn = this.focusOn;
    if(focusOn != 2 && focusOn != 1) {
        return null;
    }
    var p_cat = this.getCatalog();
    if(!p_cat) {
        return null;
    }
    var r = null;
    if(focusOn == 1) {
        var cat = p_cat.catalogs[this.getCatalogIndex()];

        r = new ws.database.catalog(cat.path);
        r.path = cat.path;
        if(root) 
            root.catalogs.push(r);
    }
    else if(focusOn == 2) {
        var topic = this.getTopic(p_cat);
        if(topic) {
            r = new ws.database.topic();
            r.label = topic.path;
            r.storage = topic.rStorage;
            r.rStorage = topic.rStorage;
            r.items = topic.items;
            r.filters = topic.filters;
            r.path = topic.path;
            if(root)
                root.topics.push(r);
        }
    }
    return r;
};

return this;
}


function clearNode(node) {
    for(var i=node.childNodes.length-1;i>=0;i--) 
        node.removeChild(node.childNodes[i]);
    return node;
}


