
var flatview_load = 0;
var elms = new Array();
var pageCount=1;
var pageCur=1;
var pageSize=12;
var elmCount=0;
var columSize=2;
var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
            .getService(Components.interfaces.nsIPromptService);

function selectTopic() {
    var topic = ws.app.selectTopic(document,null);
    if(topic) 
        loadTopic(topic);
}

function getElements() {
	  var websaver2_folders = websaver2_options.loadFolderData();
    var defaultPath = websaver2_options.defaultDirectory();
    var result = new Array();
    for (var i = 0 ; i < websaver2_folders.length ; i++) {
        var foldername = websaver2_folders[i][0];
        var folderpath = websaver2_folders[i][1];
        if (folderpath == "") folderpath = defaultPath;
				folderpath = folderpath.replace(/\\/g,"\/") +  '/' +
                escape(escape(foldername)) + '.xml'; 
        result.push({title:foldername,path:folderpath});
    }
    return result;
}

function getElementInfo() {
		elms = getElements();
		elmCount = elms.length;
		pageCount = elmCount / pageSize;
		if(pageCount<1) pageCount=1;
}

function getFilename(idx) {
	if(!elms[idx]) return false;
	var result = elms[idx].path;
	// + "/" + elms[idx].title);
	//alert(result);
	return result;
}

function getThumbSrc(idx) {
		var dom;
	  try {
    dom = xrLiN.XML.createDocument("file:///"+ getFilename(idx));
    //dom = xrLiN.XML.createDocument(xmlpath);
    }
    catch(ex) {
        alert(ex);
        return false;
    }
    if (!dom) return false; 
    var dom_items = dom.getElementsByTagName("ITEM");
    for (var i=0 ; i< dom_items.length ; i++) {
    		if(dom_items[i].getAttribute("type")=="image") {
    			var URL =	dom_items[i].getAttribute("url");
    			if(URL) return URL;
    		}
    }
    return false;
}

function setTextboxPage() {
		var txt = document.getElementById("flatview_textbox_page");
		txt.setAttribute("value",pageCur + " of " + pageCount);
		return true;
}

function createColum() {
	var columBox = document.createElement("hbox");
	columBox.setAttribute("flex","0");
	columBox.setAttribute("style","overflow:none");
	columBox.setAttribute("Class","flatview_columbox");
	columBox.setAttribute("id","columbox");
	columBox.setAttribute("height","300px");
	columBox.style.border="1px solid #FFFFFF";
	return columBox;		
}

function resizeColum(box) {
		alert(box);
		if(!box) return false;
		box.height = box.width*1.5;
		alert(box.height);
		alert(box.width);
		return true;
}

function createElementBox(idx) {
	var elmBox = document.createElement("vbox");
	elmBox.setAttribute("flex","0");
	elmBox.setAttribute("class","flatview_elmbox");
	elmBox.setAttribute("id","elm_" + idx);
	
	var thumbBox = document.createElement("image");
	thumbBox.setAttribute("flex","0");
	thumbBox.setAttribute("class","flatview_thumb");
	thumbBox.setAttribute("id","thumb_" + idx);
	thumbBox.setAttribute("src",getThumbSrc(idx));
  thumbBox.setAttribute("onload",'return checkSize(' + idx +');');
	
	var labelBox = document.createElement("label");
	labelBox.setAttribute("value",elms[idx].title);
	labelBox.setAttribute("flex","0");
	labelBox.setAttribute("class","flatview_label");
	labelBox.setAttribute("id","label_" + idx);
	
	elmBox.appendChild(thumbBox);
	elmBox.appendChild(labelBox);
	return elmBox;
	
}

function loadPage(idx) {
		if(idx<1 || idx>pageCount) {
				alert("Invalid page number, which should be 1-" + pageCount);
				return false; 
		}
		var pageBox = document.getElementById("flatview_content");
		if(!pageBox) {
				alert("Element which ID is \"flatview_content\",is not found!\n");
				return false;
		}
		while(pageBox.childNodes.length>0) {
				pageBox.removeChild(pageBox.childNodes[0]);
		}
		var pStart = pageSize*(idx-1);
		var pEnd = pStart + pageSize;
		if(pEnd>elmCount-1) pEnd = elmCount;
		for(var i=pStart;i<pEnd;i=i+columSize) {
				var colum = createColum();
				pageBox.appendChild(colum);
				for(var j=i;j<i+columSize && j<pEnd;j++) {
				colum.appendChild(createElementBox(j));
			}
		}
		pageCur = idx;
}

function onLoad() {
    if (flatview_load>0) return;
        flatview_load = 1;
   	getElementInfo();
   	loadPage(1);
   	setTextboxPage();
}

function button_left_click() {
		if (pageCur==1) 
			return loadPage(pageCount);
		else
			return loadPage(pageCur - 1);
}

function button_right_click() {
		if (pageCur==pageCount) 
			return loadPage(1);
		else
			return loadPage(pageCur + 1);
}







function initSelectMenu(id) {
    var websaver2_folders = websaver2_options.loadFolderData();
    var folderbox = document.getElementById(id);
    removeAllChild(folderbox);
    var defaultPath = websaver2_options.defaultDirectory();
    for (var i = 0 ; i < websaver2_folders.length ; i++) {
        var foldername = websaver2_folders[i][0];
        var folderpath = websaver2_folders[i][1];
        if (folderpath == "") folderpath = defaultPath;
        var fdbutton = document.createElement("menuitem");
        fdbutton.setAttribute("class","new");
        fdbutton.setAttribute("flex","1");
        fdbutton.setAttribute("label",foldername);
        fdbutton.setAttribute("oncommand", 
            'return loadXml("' + 
                folderpath.replace(/\\/g,"\/") + 
                '/' +
                escape(escape(foldername)) + '.xml' + '");'); 
        folderbox.appendChild(fdbutton);
    }
}
function onUnLoad() {
//    if (managestore_modified) {
//        if (prompts.confirm(null,
//                getString("managestore.confirm.title"),
//                getString("managestore.confirm.savexml")))
//            saveXml();
//    }     
//    xrLiN.pref.setStringPref("extensions.websaver2.managestore.lastxml",xmlfile);
}
function loadXml(xmlpath) {
    onUnLoad();
    //alert(xmlpath);
    try {
    dom = xrLiN.XML.createDocument("file:///"+ xmlpath);
    //dom = xrLiN.XML.createDocument(xmlpath);
    }
    catch(ex) {
        alert(ex);
        return;
    }
    if (!dom) return; 
    managestore_modified=false;
    xmlfile = xmlpath.replace(/\//g,"\\");
    removed_items = "_";
    //END

    savebutton.setAttribute("disabled",true);
    deleteallbutton.setAttribute("disabled",false);
    showallbutton.setAttribute("disabled",false);
    hideallbutton.setAttribute("disabled",false);
    showallbutton.setAttribute("disabled",false);

    window.document.title=unescape(unescape(dom.documentURI));
    var dom_items = dom.getElementsByTagName("ITEM");
    var imageBox = document.getElementById("managestore_editurl");
    if (!imageBox) return;
    removeAllChild(imageBox);
    for (var i=0 ; i< dom_items.length ; i++) {
        var item = createItem(i,dom_items[i]);
        /*
        var type = urls[i].getAttribute("type");
        if (type == "image")
            var item = createImageItem(i,urls[i]);
        else
            var item = createLinkItem(i,urls[i]);
        */
        imageBox.appendChild(item);
    }
    cutLabels();
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

function createItem(i,URL) {
    var url     = URL.getAttribute("url");
    var desc    = URL.getAttribute("desc");
    var day     = URL.getAttribute("date");
    var refer   = URL.getAttribute("refer");  
    var type    = URL.getAttribute("type");
    var data    = URL.getAttribute("data");
    var text    = URL.getAttribute("text");
    if (!data) data = "";
    data = data.split("|");
    if (!text) text = "";

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


function checkSize(idx) {
		var colum = document.getElementById("columbox");
		if(!colum) colum = document;
		var image = document.getElementById("thumb_" + idx);
    var maxWidth = new Number(colum.boxObject.width) / columSize * 0.8;
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
    var count = dom.getElementsByTagName("ITEM").length;
    for (var i = 0 ; i<count; i++) {
        showItem(i);    
    }
}
function hideAll() {
    var count = dom.getElementsByTagName("ITEM").length;
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

