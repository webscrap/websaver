var catalog;
var xr = getXrLiN();


function onLoad() {
    if(window.arguments.length>0) {
        catalog = window.arguments[0];
        catalog.changed = false;
        updateInfo();
    }
    else {
        window.close();
        return;
    }
}

function onDialogAccept() {
    catalog.label = getValue("catalogLabel");
    if(!catalog.label) {
        alert("At least label is need!");
        return false;
    }
    catalog.directory = getValue("catalogDirectory");
    catalog.changed = true;
    return catalog;
}

function onDialogCancel() {
    catalog.changed = false;
}

function elements(id) {
    return document.getElementById(id);
}
function setValue(id,value) {
    elements(id).value = value;
}
function getValue(id) {
    return elements(id).value;
}
function updateInfo() {
    try {
        setValue("catalogLabel",catalog.label);
        setValue("catalogDirectory",catalog.directory);
    }
    catch(e) {
        alert(e);
        return false;
    }
    return true;
}

function selectDirectory() {
    var fn = xr.system.pickFolder();
    if(fn) {
        setValue("catalogDirectory",fn);
    }
}

