
var catalog;
var storage;
var type = "file";
var fEditCatalog = true;
var fEditTopic = true;
var ref_cat;
var xr = getXrLiN();
var ws = getWebSaverGlobal();
var focusOn = 0;
var handler;
var favourite;


function onLoad()
{
    var len = window.arguments.length;
    if(len>0) {
        ref_cat = window.arguments[0];
            if(len>1) {
                fEditCatalog = window.arguments[1];
                if(len>2)
                    fEditTopic = window.arguments[2]; 
            }
    }
    else {
        window.close();
        return false;
    }

    if(!ref_cat) 
        ref_cat = ws.preference.catalog;
    if(ref_cat) {
        catalog = ref_cat;
        catalog.changed = false;
    }
    var lastTopic = ws.pref.getLastTopicFile();
    var mList = document.getElementById("menuList");
    var cList = document.getElementById("catalogList");
    var tList = document.getElementById("topicList");
/*    for(var i=0;i<catalog.catalogs.length;i++) {
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
    handler.onTopicSelected = notifyChanged;
    handler.onCatalogSelected = notifyChanged;



    handler.init();
    handler.jumpTo(lastTopic);
    updateInfo();
}
function onFocus(idx) {
    focusOn = idx;
}

function updateInfo() {
    setValue("catalogLabel",catalog.label);
    setValue("catalogStorage",catalog.storage);
    setValue("catalogDirectory",catalog.directory);
    setValue("catalogRDirectory",catalog.rDirectory);
}

function onDialogAccept()
{
    catalog.label = getValue("catalogLabel");
    catalog.storage = getValue("catalogStorage");
    catalog.directory = getValue("catalogDirectory");









    catalog.changed = true;
    ref_cat = catalog;
}

function elements(id) {
    return document.getElementById(id);
}
function getValue(id) {
    var elm = elements(id);
    var result = elm.value;//.getAttribute("value");
    return result;
}

function setValue(id,value) {
    if(value == null) return;
    elements(id).value=value;


}

function onDialogCancel()
{

}

function getLocalizedMessage(msg)
{
    return document.getElementById("websaver2.locale").getString(msg);
}

     
function selectStorage() {
    var fn = xrLiN.system.pickFile();
    if(fn) {
        setValue("catalogStorage",fn);
        catalog = new ws.database.root();
        try {
        catalog = ws.database.read(fn);
        }
        catch(e) {
        }
        catalog.storage = fn;
        updateInfo();
        handler.catalog = catalog;
        handler.refresh();
    }
}

function selectDirectory() {
    var fn= xr.system.pickFolder();
    if(fn) {
        setValue("catalogDirectory",fn);
        catalog.directory = fn;
    }
}

function addCatalog() {
    var p_cat = handler.getCatalog();
    var result = openEditCatalog(new ws.database.catalog());
    if(result.changed) {
        p_cat.addCatalog(result);



        handler.refresh();
    }
}
function quote(text) {
    return "\"" + text + "\"";
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

function editItem() {
    if(focusOn == 2)
        editTopic();
    else if(focusOn == 1)
        editCatalog();
}
function editTopic() {
    var p_cat = handler.getCatalog();
    var current = handler.getTopic(p_cat);
    if(!(p_cat && current)) return;
    current = ws.app.editTopic(current,window);
    if(!current.changed) return;
    var idx = handler.getTopicIndex();
    p_cat.update(2,idx);
    handler.setTopicList(p_cat);
}

function addTopic() {
    var p_cat = handler.getCatalog();
    if(!p_cat) return;
    var result = new ws.database.topic();
    result = ws.app.editTopic(result,window);
    if(!result.changed) return;
    p_cat.addTopic(result);
    handler.setTopicList(p_cat);
}

function deleteItem() {
    if(focusOn != 2 && focusOn != 1) return;
    p_cat = handler.getCatalog();
    if(focusOn == 1) {
        var idx = handler.getCatalogIndex();
        p_cat.catalogs.splice(idx,1);
        handler.refresh();
    }
    else {
        var idx = handler.getTopicIndex();
        p_cat.topics.splice(idx,1);
        handler.setTopicList(p_cat); 
    }
}

function editCatalog() {
    var p_cat = handler.getCatalog();
    var idx = handler.getCatalogIndex();
    cat = p_cat.catalogs[idx];
    if(!cat) return;
    cat = openEditCatalog(cat);
    if(cat.changed) {
        p_cat.update(1,idx);
        cat.update();
        handler.refresh();
    }
}

function openEditCatalog(cat) {
    window.openDialog(
        "chrome://websaver2/content/catalogedit.xul",
        Date(),
        "chrome,modal,resizable=true",
        cat);
    return cat;
}

function notifyChanged(node) {
    var topic_lbl = document.getElementById("selectedLabel");
    if(!node) {
        topic_lbl.setAttribute("value","Nothing selected!");
    }
    else {
        topic_lbl.setAttribute("value",  node.path );
    }    
}


