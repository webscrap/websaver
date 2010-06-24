
WebSaverGlobal.database = {
    os  :   xrLiN.os,
    slash : xrLiN.os == "Linux" ? "/" : "\\",
    io   : null,
    root : function(label,storage,directory,catalogs,topics) {
        var r = new WebSaverGlobal.database.catalog(label,storage,directory,catalogs,topics);
        r.update = function() {
            for(var i=0;i<this.catalogs.length;i++)
            {
                this.catalogs[i].update();
            }
        };
//        r.directory = directory;
        r.path = "/";
        return r;
    },
    updateCatalog : function(catalog,what,index) {
        if(!what || what==1) {
            if(index>=0) {
                if(index<catalog.catalogs.length) 
                    WebSaverGlobal.database.connectCatalog(catalog,catalog.catalogs[index]);
            }
            else {
                for(var i=0;i<catalog.catalogs.length;i++) {
                    var node = catalog.catalogs[i];
                    WebSaverGlobal.database.connectCatalog(catalog,node);
                    node.update();
                }
            }
        }
        if(!what || what==2) {
            if(index>=0) {
                if(index<catalog.topics.length) 
                    WebSaverGlobal.database.connectTopic(catalog,catalog.topics[index]);
            }
            else {
                for(var i=0;i<catalog.topics.length;i++) {
                    WebSaverGlobal.database.connectTopic(catalog,catalog.topics[i]);
                }
            }
        }
    },
    readCatalog : function(label,storage,directory) {
        return WebSaverGlobal.database.io.readCatalog(label,storage,directory);
    },
    readTopic : function(label,storage,directory) {
        return WebSaverGlobal.database.io.readTopic(label,storage,directory);
    },
    catalog : function (label,storage,directory,catalogs,topics) {
        this.label = def_string(label) ;
        this.topics = def_array(topics);
        this.catalogs = def_array(catalogs);
        this.storage = def_string(storage);
        this.directory = def_string(directory);
        this.rDirectory = null;
        this.changed = true;
        this.path = "";
        this.update = function() {
            return WebSaverGlobal.database.io.updateCatalog(this);
        },
        this.addCatalog = function(catalog) {
            if(catalog) {
                WebSaverGlobal.database.io.addCatalog(this,catalog);
            }
        };
        this.addTopic = function(topic) {
            if(topic) {
                WebSaverGlobal.database.io.addTopic(this,topic);
            }
        };
        return this;
    },
    filter : function(names,minw,maxw,minh,maxh) {
	this.names = names ? names : "img";
	this.minWidth = new Number(minw ? minw : 300);
	this.minHeight = new Number(minh ? minh : 300);
	this.maxWidth = new Number(maxw ? maxw : -1);
	this.maxHeight = new Number(maxh ? maxh : -1);
	return this;
    },
    topic : function(label,storage,rStorage,filter,items) {
	this.label = def_string(label);
	this.items = def_array(items);
	this.storage = def_string(storage);
        this.rStorage = def_string(rStorage);
	this.filter = filter ? filter : new WebSaverGlobal.database.filter;
        this.changed = true;
        this.path = "";
        this.update = function() {
            this.items = this.readItems();
        };
        this.readItems = function() {
            return WebSaverGlobal.database.io.readItems(this);
        };
        this.writeItems = function() {
            return WebSaverGlobal.database.io.writeItems(this);
        };
        this.addItem = function(item) {
            this.items.push(item);
        };
        this.getDataFolder = function() {
            return WebSaverGlobal.database.io.topicGetDataFolder(this);
        };
	return this;
    },
    item : function(label,type,data,extdata1,extdata2,refer,cdate) {
	this.label = def_string(label);
	this.type = def_string(type);
	this.data = def_string(data);
	this.extdata1 = def_string(extdata1);
	this.extdata2 = def_string(extdata2);
        this.refer = def_string(refer);
        this.date = def_string(cdate);
	return this;
    },
    read   : function(storage,directory,withData) {
        if(withData == null) withData = true;
//        if(!storage || storage == "") 
//            return new this.root();
//        else {
            var r = WebSaverGlobal.database.io.read(storage,directory,withData);
            r.path = "/";
            r.id = "root";
//            r.path = "/";
//            r.directory = directory;
//          r.rDirectory = directory;
//          r.update();
            return r;
    },
    write  : function(catalog,storage) {
        if(!storage || storage == "") 
            return true;
        else
            return WebSaverGlobal.database.io.write(catalog,storage);
    },
    isAbsFilename   : function(fn) {
        if(!fn) return false;
        if(this.os == "Linux") {
            return (fn[0]=="/");
        }
        else {
            if(fn.length<3) return false;
            return (fn.substr(1,2)==":\\");
        }
    },
    buildPath   : function(first,second) {
        if(!first) return second;
        if(!second) return first;
        if(this.isAbsFilename(second))
            return second;
        result = first + this.slash + second;
        var reg = new RegExp(this.slash + this.slash + "{2,}","g");
        result = result.replace(reg,this.slash);
        return result;
    },
    buildTopicStorage : function(catalog,topic) {
        var d = (catalog.rDirectory!=null) ? catalog.rDirectory : catalog;
        var f = (topic.storage) ? topic.storage : topic.label + ".xml";
        return this.buildPath(d,f);
    },
    buildTopicDirectory : function(catalog,topic) {
        var d = (catalog.rDirectory!=null) ? catalog.rDirectory : catalog;
        var l = (topic.directory) ? topic.directory : topic.label;
        return this.buildPath(d,l);
    },
    buildCatalogDirectory : function(pnode,catalog) {
        var d = (pnode.rDirectory!=null) ? pnode.rDirectory : pnode;
        var f = (catalog.directory) ? catalog.directory : catalog.label;
        return this.buildPath(d,f);
    },
    ingoreNode : function(node,nodeType,topic,critical,nc_filter,nc_item) {
        var rf = this.blacklistNode;
        if(rf(node,nodeType,topic,critical,nc_filter,nc_item)) {
//        xrLiN.debug.print("BlackList : " + critical);
            return true;
        }
        else {
            return false;
        }
    },
    blacklistNode : function(node,nodeType,topic,critical,nc_filter,nc_item) {
        if(!node) return true;
        if(!topic) return false;
        if(!nc_filter) {
            if(!topic.filter) return false;
            if(!topic.filter.names) return false;
            var names=topic.filter.names.split(" ");
            for(var i=names.length;i>0;i--) {
            	if(names[i-1] == nodeType) 
        		break;
            	if(i==1) return true;
            }
            if(nodeType == "img") {
                var f = topic.filter;
                if(f.minWidth > 0  && node.width < f.minWidth) return true;
                if(f.maxWidth > 0 && node.width > f.maxWidth) return true;
                if(f.minHeight > 0 && node.height < f.minHeight) return true;
                if(f.maxHeight > 0 && node.height > f.maxHeight) return true;
            }
        }
        if(!nc_item) {
            for(var i=0;i<topic.items.length;i++) {
                if(critical == topic.items[i].data)
                    return true;
            }
        }
        return false;
    },
    addItemsFromNodes : function(topic,nodes,doc,pFolder) {
        var refer = doc.location.href;
        var cdate = Date();
        var count;
        var checkfilter=false;
        if(nodes.length>1) checkfilter=true;
        for(var i=0;i<nodes.length;i++) {
            var node = nodes[i];
            var nodename = node.nodeName;
            nodename = nodename ? nodename.toLowerCase() : "text";
            var label="";
            var type="";
            var data="";
            var extdata1="";
            var extdata2="";
            switch (nodename) {
                case "img" :
                    type    =   "image";
                    data    =   node.src;
                    label   =   doc.title;
                    label   =   label + ' (' + node.width + 'x' + node.height + ')';
                    if(this.ingoreNode(node,nodename,topic,data,!checkfilter)) continue;
                    if(pFolder) this.persistImage(node.src,pFolder);
                    break;
                //case "a"    : 
                //    type    =   "link";
                 //   data    =   node.href;
                 //   label   =   (node.innerHTML) ? node.innerHTML : doc.title;
                 //   if(this.ingoreNode(node,nodename,topic,data,!checkfilter)) continue;
                 //   break;
                case "text" :
                    type    =   "text";
                    if(this.ingoreNode(node,nodename,topic,data,!checkfilter)) continue;
                    extdata1 = node.toString();
                    extdata1 = extdata1.replace(/\s*\n\s*\n\s*/,"\n","g");
                    //extdata1 = node.textContent;
                    //toString();
                    label   =   this.textInput(
                                    extdata1.substring(0,extdata1.indexOf("\n")),
                                    "Input the label,please"); 
                    if(!label)
                        continue;
                    data = label;
                    if(pFolder) this.persistText(label,extdata1,pFolder);
                    break;
                default :
                    continue;
            }
            var item = new this.item(label,type,data,extdata1,extdata2,refer,cdate); 
            count ++;
            topic.items.push(item);
        }
        return count;
    },
    persistImage : function(url,fdSaveIn) {
        var fName = url.substring(url.lastIndexOf("/")+1);
        if(!fName) fName = url;
        var cachekey = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
        var urifix = Components.classes['@mozilla.org/docshell/urifixup;1'].getService(Components.interfaces.nsIURIFixup);
        var persist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
        var uri = urifix.createFixupURI(url, 0);
        var hosturi = (uri.host.length > 0) ? urifix.createFixupURI(uri.host, 0) : null;
        try {
            var fileObject = xrLiN.fileIO.fileObject(fdSaveIn);
            if(!fileObject.exists())
                fileObject.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0770);
            if(!fName || fName.match(/\/$/)) {
                fileObject.createUnique(0,0660);
            }
            else {
                 fileObject.append(fName);
                if (fileObject.exists()) 
                    fileObject.createUnique(0,0660);
            }
            cachekey.data = url;
            persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_FROM_CACHE | Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_CLEANUP_ON_FAILURE;
            persist.saveURI(uri, cachekey, hosturi, null, null, fileObject);
            xrLiN.debug.print("Persist Url \"" + url + "\" to" +  fileObject.path);
        }
        catch(e) {
            alert(e);
        }
    },
    persistText : function(name,text,fdSaveIn) {
        var txtFileName = name + ".txt";
        var txtObject = xrLiN.fileIO.fileObject(fdSaveIn);
        if(!txtObject.exists())
            txtObject.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0770);
        txtObject.append(txtFileName);
        if (txtObject.exists()) 
            txtObject.createUnique(0,0660);
        try {
            var txtStream = xrLiN.fileIO.outputStream(txtObject);
            var txtOut = xrLiN.fileIO.textOutputStream(txtStream,"utf-8");
            txtOut.writeString(text);
            xrLiN.debug.print("Persist Text to " + txtObject.path);
            txtOut.close();
            txtStream.close();
        }
        catch(e) {
            alert(e);
        }
    },
    textInput : function(text,ptext) {
        var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                .getService(Components.interfaces.nsIPromptService);
        var check = {value:false};
        var result = { value : text };
        var title = ptext;
        var message = ptext;
        if(prompts.prompt(null,title,message,result,null,check)) {
            if (result.value == "" ) result.value = text;
        }
        else {
            result.value="";
        }
        return result.value;
    },
    getIndexOfCatalog : function(root,label) {
        for(var i=0;i<root.catalogs.length;i++) {
            if(root.catalogs[i].label == label)
                return i;
        }
        return -1;
    },
    getIndexOfTopic : function(root,label) {
        for(var i=0;i<root.topics.length;i++) {
            if(root.topics[i].label == label)
                return i;
        }
        return -1;
    },
    getNamespace : function(root,path) {
        var stack = new Array();
        var index = -1;
        if(!(path && root)) {
            return null;
        }
        if(root.changed) {
            root.update(); 
        }
        stack.push(root);
        var rel = path.substr(root.path.length);
        var parts = rel.split(/\/+/);
        var catalog = root;
        for(var i=0;i<parts.length - 1;i++) {
            if(!parts[i])
                continue;
            var idx = this.getIndexOfCatalog(catalog,parts[i]);
            if(idx<0) {
                break;
            }
            catalog = catalog.catalogs[idx];
            stack.push(catalog);
            if(catalog.changed) {
                catalog.update();
            }
        }
        if(rel.match(/\/$/)) {
            var idx = this.getIndexOfCatalog(catalog,parts[parts.length-1]);
            if(idx>0) {
                stack.push(catalog);
                catalog = catalog.catalogs[idx];
                if(catalog.changed) catalog.update();
            }
        }
        else {
            index = this.getIndexOfTopic(catalog,parts[parts.length-1]);
        }
        return {stack:stack,index:index};
    },
    getIdByPath : function (root,path) {
        var newLevel = Array();
        var topicIndex = -1;
        if(null == path) 
            path = "";
        if(path.indexOf("/" +  root.label + "/")==0) {
            path = path.substr(2 + root.label.length);
        }
        path = path.replace(/^\/+/,"");
        var isTopic=0;
        if(path.charAt(path.length - 1) != "/" ) { 
            isTopic=1;
        }
        else {
            path=path.replace(/\/+$/,"");
        }
        if(path.match(/^\s*$/)) {
            this.newLevel = new Array();
            return {level:newLevel,index:topicIndex};
        }
        var labels = path.split(/\/+/);
        var catalog = root;
        for(var i=0;i<labels.length-1;i++) {
            if(!labels[i])
                continue;
            var idx = this.getIndexOfCatalog(catalog,labels[i]);
            if(idx<0) {
                alert("Invalid path:" + path + "\nCatalog " + labels[i] + " not exists");
                return;
            }
            newLevel.push(idx);
            if(catalog.catalogs[idx]) 
                catalog = catalog.catalogs[idx];
            else
                catalog = null;
        }
        if(!isTopic) {
            var idx = this.getIndexOfCatalog(catalog,labels[labels.length-1]);
            if(idx<0) {
                alert("Invalid path:" + path + "\nCatalog " + labels[labels.length-1] + " not exists");
                return;
            }
            newLevel.push(idx);
        }
        else {
            var topicIndex = this.getIndexOfTopic(catalog,labels[labels.length-1]);
        }
        return {level:newLevel,index:topicIndex};
    },
    getChildByPath : function(root,path) {
        var id = this.getIdByPath(root,path);
        return this.getChildById(root,id);
    },
    getChildById : function(root,id) {
        if(!id)
            return null;
        var level = id.level;
        var idx = id.index;
        var result = root;
        for each (var i in level) {
            if(result.catalogs[i])
                result = result.catalogs[i];
            else 
                return null;
        }
        if(idx>=0) { 
            if(result.topics[idx]) {
                result = result.topics[idx];
            }
            else {
                return null;
            }
        }
        return result;
    },
    getPathById : function(root,id) {
        var level = id.level;
        var idx = id.index;
        var result = "/";
        //+ root.label + "/";
        var catalog = root;
        for(var i=0;i<level.length;i++) {
            catalog = catalog.catalogs[level[i]];
            result += catalog.label + "/";
        }
        if(idx>=0) 
            result += catalog.topics[idx].label;
        return result;
    },
}

function WS_DB_DumpRoot(root) {
    xrLiN.debug.print(root.label + ":=================Start=================");
    var dp = WS_DB_DebugPrint;
    dp(root,"label");
    dp(root,"storage");
    dp(root,"directory");
    xrLiN.debug.print("Topics:");
    for(var i=0;i<root.topics.length;i++) {
        WS_DB_DumpTopic(root.topics[i],"topic[" + i + "]");
    }
    xrLiN.debug.print("Catalogs:");
    for(var i=0;i<root.catalogs.length;i++)
        WS_DB_DumpCatalog(root.catalogs[i],"catalog[" + i + "]");
    xrLiN.debug.print(root.label + ":===================End=================");
}

function WS_DB_DumpCatalog(root,pre) {
    var dp = WS_DB_DebugPrint;
    dp(root,"label",pre);
    dp(root,"storage",pre);
    dp(root,"directory",pre);
    dp(root,"rDirectory",pre);
    xrLiN.debug.print("Topics:",pre);
    pre = pre ? pre : "";
    for(var i=0;i<root.topics.length;i++) {
        WS_DB_DumpTopic(root.topics[i],pre + "topic[" + i + "]");
    }
}

function WS_DB_DumpTopic(root,pre) {
    var dp = WS_DB_DebugPrint;
    dp(root,"label",pre);
    dp(root,"storage",pre);
    dp(root,"rStorage",pre);
}

