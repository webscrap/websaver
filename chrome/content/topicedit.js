var topic;
var xr = getXrLiN();


function onLoad() {
    if(window.arguments.length>0) {
        topic = window.arguments[0];
        topic.changed = false;
        updateInfo();
        updateFilter();
    }
    else {
        window.close();
        return;
    }
}

function onDialogAccept() {
    topic.label = getValue("topicLabel");
    if(!topic.label) {
        alert("At least label is need!");
        return false;
    }
    topic.storage = getValue("topicStorage");
    topic.filter.names = getValue("filterNames");
    topic.filter.minWidth = getIntValue("filterMinWidth");
    topic.filter.maxWidth = getIntValue("filterMaxWidth");
    topic.filter.minHeight = getIntValue("filterMinHeight");
    topic.filter.maxHeight = getIntValue("filterMaxHeight");
    topic.changed = true;
    return topic;
}

function onDialogCancel() {
    topic.changed = false;
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
function getIntValue(id) {
    var value;
    try {
        value = new Number(getValue(id));
    }
    catch(e) {
        value = 0;
    }
    return value;
}
function updateInfo() {
    try {
        topicLabel = elements("topicLabel");
        topicLabel.appendItem(topic.label);
        var label=topic.label.replace(/[\*\?\!\/\\\]+|\[[^\[\]]*\]/g,"");
//        label = label.replace(/^\s+|\s+$/,"");
//        topicLabel.insertItemAt(0,label);
        label = label.replace(/\s*-[^-]*$|^\s+|\s+$/,"");
        topicLabel.insertItemAt(0,label);
        label = label.replace(/\s*-[^-]*$|^\s+|\s+$/,"");
        topicLabel.insertItemAt(0,label);
        topicLabel.value = label;
        label = label.replace(/\s*-[^-]*$|^\s+|\s+$/,"");
        topicLabel.insertItemAt(0,label);
        //topicLabel.value = topic.label;
//        var item = topicList.appendItem(topics[i].label);

//        setValue("topicLabel",topic.label);
        setValue("topicStorage",topic.storage);
    }
    catch(e) {
        alert(e);
        return false;
    }
    return true;
}

function updateFilter() {
    try {
        setValue("filterNames",topic.filter.names);
        setValue("filterMinWidth",topic.filter.minWidth);
        setValue("filterMaxWidth",topic.filter.maxWidth);
        setValue("filterMinHeight",topic.filter.minHeight);
        setValue("filterMaxHeight",topic.filter.maxHeight);
    }
    catch(e) {
        alert(e);
        return false;
    }
    return true;
}

function selectStorage() {
    var fn = xr.system.pickFile();
    if(fn) {
        setValue("topicStorage",fn);
    }
}

