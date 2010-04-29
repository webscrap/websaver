var catalog;

var passback;
var doc;

var xr = getXrLiN();
var ws = getWebSaverGlobal();

var handler;

function onLoad() {
    catalog = ws.preference.catalog;

    var lastTopic = ws.pref.getLastTopicFile();
    if(window.arguments.length>0) {
        doc = window.arguments[0];
        if(window.arguments.length>1)
            passback = window.arguments[1];
    }

    var mList = document.getElementById("menuList");
    var cList = document.getElementById("catalogList");
    var tList = document.getElementById("topicList");
    /*
    for(var i=0;i<catalog.catalogs.length;i++) {
        if(catalog.catalogs[i].label == "Favourite") {
            favourite = catalog.catalogs[i];
            break;
        }
    }
    if(!favourite) {
        favourite = new ws.database.catalog("Favourite");
        catalog.catalogs.push(favourite);
    }
    */
    handler = new CatalogHandler(catalog,mList,cList,tList);
    handler.onTopicDblClick = topicSelected;
    handler.onTopicSelected = notifyChanged;
    handler.onCatalogSelected = notifyChanged;
    handler.init();
    //handler.setByTopicStorage(lastTopic);
    handler.jumpTo(lastTopic);
}


function topicSelected(tp) {
    onDialogAccept();
    window.close();
}
function notifyChanged(node) {
    var topic_lbl = document.getElementById("topicLabel");
    if(!node) {
        topic_lbl.setAttribute("value","Nothing selected");
    }
    else {
       var lbl = (node.path) ? node.path : node.label;
        topic_lbl.setAttribute("value",  lbl );
        window.title = node.path;
    }    
}

function onDialogAccept() {
    var cat = handler.getCatalog();
    var topic;;
    var elm_list = document.getElementById("topicList");
    var idx = elm_list.selectedIndex;
    if(idx>=0) 
        topic=cat.topics[idx];
    else if(cat.topics.length>1)
        topic=cat.topics[0];
    if(!topic) {
        alert("Select a topic,please");
        return false;
    }
    
    arrayMoveTop(cat.topics,idx);
    var fn = topic.rStorage;
    if(passback!=null) passback.value = topic;

    ws.pref.setLastTopicFile(topic.path);
    return true;
}

function arrayMoveTop(arr,idx) {
    if(idx>=arr.length) return;
    var tmp = arr[idx];
    for(var i=idx;i>0;i--) {
        arr[i]=arr[i-1];
    }
    arr[0]=tmp;
}

function onDialogCancel() {
		if(passback!=null) passback.value = null;
}

function newTopic() {
    var topic = new ws.database.topic();
    topic.changed = false;
    if(doc)
        topic.label = doc.title;
    ws.app.editTopic(topic,window);
    if(topic.changed && topic.label) {
        var cat = handler.getCatalog();
        cat.addTopic(topic);
        handler.refresh();
        var idx = cat.topics.length - 1;
        handler.selectTopic(idx);
        handler.scrollTo(idx);
        ws.preference.catalog = catalog;
        ws.saveCatalog();
    }
}

function quote(text) {
    return '"' + text + '"';
}
function toFavourite() {
    handler.jumpTo("/Favourite/");
}

function addFavourite() {
    var selected = handler.copySelectedTo(favourite);
    if(selected) {
        alert(quote(selected.label) + " Added to " + quote("Favourite"));
    }
    else {
        alert("No item selected\n");
    }
    return;
}
