var managestore_load = 0;
var managestore_modified = false;

var topic;
var dom;
var xmlfile;
var curIndex;

var removed_items="_";

var savebutton;
var deleteallbutton;
var showallbutton;
var hideallbutton;

var CImageItem; //= createItemTemplate("image");
var CEmbedItem; //= createItemTemplate("embed");
var CLabelItem; //= createItemTemplate("label");

var xrLiN = getXrLiN();
var ws = getWebSaverGlobal();

var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
            .getService(Components.interfaces.nsIPromptService);

function selectTopic() {
    topic = ws.app.selectTopic(null,window);
    loadTopic();
}

function loadTopic() {
    if(!topic) return;
    topic.update();
//    topic.items = ws.database.readItems(topic.rStorage);
    if(topic.items.length<=0) return;
    onUnLoad();
    managestore_modified=false;
    removed_items = "_";

    savebutton.setAttribute("disabled",true);
    deleteallbutton.setAttribute("disabled",false);
    showallbutton.setAttribute("disabled",false);
    hideallbutton.setAttribute("disabled",false);
    var imageBox = document.getElementById("managestore_editurl");
    if (!imageBox) return;
    removeAllChild(imageBox);
    for (var i=0 ; i< topic.items.length ; i++) {
        var item = createItem(i,topic.items[i]);
        imageBox.appendChild(item);
    }
    cutLabels();
}

function onLoad() {
    if (managestore_load>0) return;
    managestore_load = 1;
    savebutton = document.getElementById("managestore_savebutton");
    deleteallbutton = document.getElementById("managestore_deleteallbutton");
    showallbutton = document.getElementById("managestore_showallbutton");
    hideallbutton = document.getElementById("managestore_hideallbutton");

    CImageItem = createItemTemplate("image");
    CEmbedItem = createItemTemplate("embed");
    CLabelItem = createItemTemplate("label");
    
}

function onUnLoad() {
    if (managestore_modified) {
        if (prompts.confirm(null,
                getString("managestore.confirm.title"),
                getString("managestore.confirm.savexml")))
            saveXml();
    }     
}

function clickOn(event,idx) {
    var evt = event || window.event;
    if (!evt) return;
    var btnCode = evt.button;
    curIndex = idx;
    switch(btnCode) {
        case 0  : 
            //Left clicked
            toggleItem(idx);
            break;
        case 1  : 
            //alert('Middle button clicked');
            break;
        case 2  : 
            var showmenu = document.getElementById("managestore_action_toggle");
            var curItem = document.getElementById("item"+idx);

            if (curItem.hidden) 
                showmenu.label = getString("managestore.action.show");
            else
                showmenu.label = getString("managestore.action.hide");

            var popupMenu = document.getElementById("managestore_image_action");
            popupMenu.showPopup(evt.target,evt.screenX,evt.screenY,'popup', null, null);
            break;
        default : 
            //alert('Unexpected code: ' + btnCode);
            break;
    }
}


function createItemTemplate(type) {
    var itemBox = document.createElement("groupbox");
    itemBox.setAttribute("id","itembox");
    itemBox.setAttribute("class","normalitem");
    itemBox.setAttribute("onmouseover","return mouseOver(this)");
    itemBox.setAttribute("onmouseout","return mouseLeft(this)");
    
    var titleBox = document.createElement("hbox");
    var desclabel = document.createElement("label");
    desclabel.setAttribute("id","desclabel");
    desclabel.setAttribute("class","text-link");
    desclabel.setAttribute("flex", 1);

    //Edit button
    var editbutton = document.createElement("image");
    editbutton.setAttribute("id","editbutton");
    editbutton.setAttribute("src","chrome://websaver2/skin/edit.png");
    editbutton.setAttribute("class","edit");
    editbutton.setAttribute("tooltiptext", getString("managestore.action.edit"));

    //delete button
    var delbutton = document.createElement("image");
    delbutton.setAttribute("id","delbutton");
    delbutton.setAttribute("src","chrome://websaver2/skin/delete.png");
    delbutton.setAttribute("class","delete");
    delbutton.setAttribute("tooltiptext", getString("managestore.action.delete"));

    titleBox.appendChild(desclabel);
    titleBox.appendChild(newSpacer());
    titleBox.appendChild(editbutton);
    titleBox.appendChild(delbutton);
    
    itemBox.appendChild(titleBox);

    var detailBox = document.createElement("vbox");
    detailBox.setAttribute("id","detailbox");
    detailBox.setAttribute("class","item");
    detailBox.setAttribute("hidden",true);
    
    var textBox = document.createElement("textbox")
    textBox.setAttribute("id","textbox");
    textBox.setAttribute("multiline",true);
    textBox.setAttribute("maxlength",32767);
    textBox.setAttribute("readonly",true);
    textBox.setAttribute("hidden",true);
    detailBox.appendChild(textBox);

    var secLine;
    switch (type) {
    case "image" :
        secLine = document.createElement("hbox");
        var image = document.createElement("image");
        image.setAttribute("id","image");
        image.setAttribute("onload",'return checkSize(this);');
        image.setAttribute("onmouseover","return mouseOver(this)");
        image.setAttribute("onmouseout","return mouseLeft(this)");
        image.setAttribute("class","normalitem");
        secLine.appendChild(newSpacer());
        secLine.appendChild(image);
        secLine.appendChild(newSpacer());
        break;
    case "embed" :
        secLine = document.createElement("hbox");
        var embed = document.createElementNS('http://www.w3.org/1999/xhtml','html:embed');
        try {
        for (var al=0;al<data.length;al +=2) {
            embed.setAttribute(data[al],data[al+1]);
        }
        } catch(e) {}
        embed.setAttribute("id","embed");
        secLine.appendChild(newSpacer());        
        secLine.appendChild(embed);
        secLine.appendChild(newSpacer());        
        break;
    default :
        secLine = document.createElement("label");
        secLine.setAttribute("id","label");
        secLine.setAttribute("class","text-link");
        break;
    }

    var referlabel = document.createElement("label");
    referlabel.setAttribute("id","referlabel");
    referlabel.setAttribute("class","text-link");

    var daylabel = document.createElement("label");
    daylabel.setAttribute("id","daylabel");

    detailBox.appendChild(secLine);
    detailBox.appendChild(referlabel);
    detailBox.appendChild(daylabel);
    itemBox.appendChild(detailBox);
    return itemBox;
}

function getElementById(itemBox,id) {
    for (var i=0;i<itemBox.childNodes.length;++i) {
        if (itemBox.childNodes[i].id == id) 
            return itemBox.childNodes[i];
    }
    for (var i=0;i<itemBox.childNodes.length;++i) {
        if (!itemBox.childNodes[i].hasChildNodes) continue;
        var result = getElementById(itemBox.childNodes[i],id);
        if (result) return result;
    }
    return null;
}

function createItem(i,item) {
    var url     = item.data;
    var desc    = item.label;
    var day     = item.date;
    var refer   = item.refer;
    var type    = item.type;
    var text    = item.extdata1;

    var itemBox;
    switch(type) {
        case "image" :
            itemBox = CImageItem.cloneNode(true);
            break;
        case "embed" :
            itemBox = CEmbedItem.cloneNode(true);
            break;
        default :
            itemBox = CLabelItem.cloneNode(true);
    }
   
    itemBox.setAttribute("id","itemBox" + i);

    var desclabel = getElementById(itemBox,"desclabel");
    desclabel.setAttribute("onclick",'return clickOn(event,' + i + ');');
    desclabel.setAttribute("value", i +1 + "." + desc);
    desclabel.setAttribute("tooltiptext", url);
    //Edit button
    var editbutton = getElementById(itemBox,"editbutton");
    //delete button
    var delbutton = getElementById(itemBox,"delbutton");
    delbutton.setAttribute("onclick",'return deleteItem(' + i + ');');

    var detailBox = getElementById(itemBox,"detailbox");
    detailBox.setAttribute("id","item" + i);
    
    if ( text != "" ) {
        text = text.replace(/(\\n)+/g,'\n');
        var textBox = getElementById(itemBox,"textbox");
        textBox.setAttribute("value",text);
        textBox.setAttribute("hidden",false);
        textBox.setAttribute("rows",text.split('\n').length + text.length/120);
    }

    switch (type) {
    case "image" :
        var image = getElementById(itemBox,"image");
        image.setAttribute("id","image" + i);
        image.setAttribute("src",url);
        image.setAttribute("tooltiptext",url);
        image.setAttribute("onclick", 'clickItem(event,' + i + ',"' + url + '");');
        break;
    case "embed" :
        var embed = getElementById(itemBox,"embed");
        try {
        for (var al=0;al<data.length;al +=2) {
            embed.setAttribute(data[al],data[al+1]);
        }
        } catch(e) {}
        embed.setAttribute("id","embed" + i);
        embed.setAttribute("src",url);
        embed.setAttribute("onclick", 'clickItem(event,' + i + ',"' + url + '");');
        break;
    default :
        var secLine = getElementById(itemBox,"label");
        secLine.setAttribute("value",url);
        secLine.setAttribute("onclick", 'clickItem(event,' + i + ',"' + url + '");');
        break;
    }

    var referlabel = getElementById(itemBox,"referlabel");
    referlabel.setAttribute("onclick",'return openURL("' +refer + '");');
    referlabel.setAttribute("value", "Refer to " + refer);

    var daylabel = getElementById(itemBox,"daylabel");
    daylabel.setAttribute("value","Save at " + day);

    return itemBox;
}
function mouseOver(element) {
    element.setAttribute("class","overitem");
}
function mouseLeft(element) {
    element.setAttribute("class","normalitem");
}
function checkSize(image) {
    var maxWidth = new Number(document.width);
    maxWidth = maxWidth * 0.94;
    var iWidth = new Number(image.boxObject.width);
    var iHeight = new Number(image.boxObject.height);
    if (iWidth < maxWidth) return; 
    var f = new Number(maxWidth/iWidth);
    iWidth *= f;
    iHeight *= f;
    image.style.width = iWidth + "px";
    image.style.height = iHeight + "px";
    /*
    idx = image.id.replace(/image/g,'');
    hideItem(idx);
    //showItem(idx);
    */

}
function cutLabels() {
    var MAXLENGTH=120;
    var labels = document.getElementsByTagName("label");
    for (var i=0;i<labels.length;i++) {
       var value = labels[i].getAttribute("value");
       if (value.length > MAXLENGTH) {
            value = value.substr(0,MAXLENGTH) + '...';
            labels[i].setAttribute("value",value);
       }
    }
}
function newSeparator() {
    var result = document.createElement("separator");
    result.setAttribute("class","groove-thin");
    return result;
}
function newSpacer() {
    var result = document.createElement("spacer");
    result.flex = "1";
    return result;
}
function getCurItem(idx) {
    if (idx == null) idx = curIndex;
    if (idx == null) return null;
    return dom.getElementsByTagName("ITEM")[idx];
}
function clickItem(event,idx,url) {
 var evt = event || window.event;
    if (!evt) return;
    var btnCode = evt.button;
    curIndex = idx;
    switch(btnCode) {
        case 0  : 
            toggleItem(idx);
            break;
        case 2  : 
            openURL(url);
            break;
        default : 
            //alert('Unexpected code: ' + btnCode);
            break;
    }   
}
function editItem(idx) {
    var curItem = getCurItem(idx);
    alert("Not implemented yet.");
}
function viewItem(idx) {
    var curItem = getCurItem(idx);
    if (curItem)
        openURL(curItem.getAttribute("url"));
}
function referItem(idx) {
    var curItem = getCurItem(idx);
    if (curItem)
        openURL(curItem.getAttribute("refer"));
}
function hideItem(idx) {
    if (idx == null) idx = curIndex;
    if (idx == null) return;
    var item = document.getElementById("item"+idx);
    item.hidden=1;
}
function showItem(idx) {
    if (idx == null) idx = curIndex;
    if (idx == null) return;
    var item = document.getElementById("item"+idx);
    item.hidden=0;
}
function toggleItem(idx) {
    if (idx == null) idx = curIndex;
    if (idx == null) return;
    var curItem = document.getElementById("item" + idx);
    if (curItem.hidden) { 
        curItem.hidden=0;
        }
    else
        curItem.hidden=1;
}
function showAll() {
    var count = topic.items.length;
    for (var i = 0 ; i<count; i++) {
        showItem(i);    
    }
}
function hideAll() {
    var count = topic.items.length;
    for (var i = 0 ; i<count; i++) {
        hideItem(i);
    }
}
function addRemovedItem(idx) {
    removed_items += idx + "_";
}
function isRemoved(idx) {
    return removed_items.match("_" + idx + "_");
}
function deleteItem(idx) {
    if (idx==null) idx=curIndex;
    var itemBox = document.getElementById("itemBox" + idx);
    if (itemBox) { 
        if (savebutton) savebutton.setAttribute("disabled",false);
        itemBox.parentNode.removeChild(itemBox);
        addRemovedItem(idx);
        managestore_modified=true;
    }
}
function removeAllChild(ELM) {
    var childNodes = ELM.childNodes;
    for (var i=childNodes.length;i>0;)
        ELM.removeChild(childNodes[--i]);
}
function deleteAll() {
    var count = dom.getElementsByTagName("ITEM").length;
    for (var i = count-1 ; i>=0 ; i--) {
        deleteItem(i);
    }
}
function openXml() {
    var xmlfile = xrLiN.system.pickFile();
    if (xmlfile) loadXml(xmlfile);
}
function saveXml() {
    if (!dom) return;
    if (!xmlfile) return;
    savebutton.setAttribute("disabled",true);
    var items = dom.getElementsByTagName("ITEM");
    var count = items.length;
    while (count) {
        var i = --count;
        if (isRemoved(i))
            items[i].parentNode.removeChild(items[i]);
    }
    var xmlObject = xrLiN.fileIO.fileObject(xmlfile)
    var foStream = xrLiN.fileIO.outputStream(xmlObject);
    xrLiN.XML.serializeToStream(dom,foStream);
    foStream.close();
    managestore_modified=false;
}
function openURL(aURL)
{
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
    var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
    var win = windowManagerInterface.getMostRecentWindow("navigator:browser");
    if (!win) win = window;

    if (win)
    {
        var theTab = win.gBrowser.addTab(aURL);
        win.gBrowser.selectedTab = theTab;
        return;
    }
}
function getString(msg)
{
    return document.getElementById("websaver2.locale").getString(msg);
}

