var old_storage;
var old_directory;

var xr = getXrLiN();
var ws = getWebSaverGlobal();

function onLoad()
{
    setValue("catalogStorage", ws.preference.storage); 
    setValue("defaultFolder",ws.preference.directory);
    setValue("enableDClick",ws.preference.enableDblClick);
    setValue("enablePersist",ws.preference.enablePersist);
    old_storage = ws.preference.storage;
    old_directory = ws.preference.directory;
}

function onDialogAccept()
{
    ws.preference.storage = getValue("catalogStorage");
    ws.preference.directory = getValue("defaultFolder");
    ws.preference.enableDblClick = getValue("enableDClick");
    ws.preference.enablePersist = getValue("enablePersist");
    ws.savePreference();
    if(ws.preference.storage != old_storage ||
        ws.preference.directory != old_directory)
            ws.preference.catalog = ws.database.read(
                ws.preference.storage,
                ws.preference.directory);
    return true;
}

function elements(id) {
    var result = document.getElementById(id);
    if(!result) {
        alert("Element (" + id + ") not found!");
    }
    return result;
}

function getValue(id) {
    var elm = elements(id);
    if(elm) {
        var result;
        if(elm.nodeName=="checkbox") {
            result = elm.hasAttribute("checked");
        } 
        else {
            result = elm.value;
        }
        return result;
    }
}

function setValue(id,value) {
    var result = elements(id);
    if(result) {
        if(result.nodeName == "checkbox") {
            result.setAttribute("checked",value);
        }
        else {
            result.value=value;
        }
    }
}

function onDialogCancel()
{
}

function getLocalizedMessage(msg)
{
    return document.getElementById("websaver2.locale").getString(msg);
}

function selectStorage(create) {
    var fn = create ? xr.system.saveFile() : xr.system.openFile();
    if(fn) {
        setValue("catalogStorage",fn);
    }
}
function selectFolder() {
    var fn = xr.system.pickFolder();
    if(fn) {
        setValue("defaultFolder",fn);
    }
}
function editCatalog() {
    ws.editCatalog();
}
