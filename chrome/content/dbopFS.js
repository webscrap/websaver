WebSaverGlobal.database.io = {
    database : WebSaverGlobal.database,
    getXMLDoc	: function(storage) {
    	var xmldoc;
    	if (storage && storage != "") {
            var url = "file:///" + storage;
            url = url.replace("\\","/","g");
          try {
              var req = new XMLHttpRequest();
              req.open("GET",url,false);
              req.send(null);
              if(req.responseXML.documentElement.nodeName != "parsererror")
              	xmldoc = req.responseXML;
          }
          catch (e) {
                xrLiN.debug.print(url + ":" + e);
                xmldoc = null;
          }
       }
       return xmldoc;
    },
    createXMLDoc	: function(RootElm) {
    	return document.implementation.createDocument(
    		"http://www.w3.org/1999/xhtml",RootElm,null
    		);
    },
    writeXMLDoc	: function(xmldoc,storage) {
    	try {
    		var serializer = new XMLSerializer();
    		var fileObject = Components.classes["@mozilla.org/file/local;1"].createInstance(
    			Components.interfaces.nsILocalFile);
    	  fileObject.initWithPath(storage);
    		var foStream =  Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(
    			Components.interfaces.nsIFileOutputStream);
    	  foStream.init(fileObject,0x02|0x08|0x20,0644,0);
    	  serializer.serializeToStream(xmldoc, foStream, "UTF-8"); 
              foStream.close();
    	}
    	catch(e) {
    		alert("Error occur,when trying to serialize to storage\n" + e); 
    		return false;
    	}
    	return true;
    },
    topicFromNode	: function(node,parentCatalog,recur) {
        var tLabel = node.getAttribute("label");
        var tStorage = node.getAttribute("storage");
        var filter;
        var elm_filter = this.getFirstElement(node,"Filter");
        if(elm_filter) {
            var fn = elm_filter.getAttribute("names");
            var minw = elm_filter.getAttribute("minWidth");
            var maxw = elm_filter.getAttribute("maxWidth");
            var minh = elm_filter.getAttribute("minHeight");
            var maxh = elm_filter.getAttribute("maxHeight");
            filter = new this.database.filter(fn,minw,maxw,minh,maxh);
        }
        var topic = new this.database.topic(tLabel,
                    tStorage,
                    null,
                    filter,
                    null);
        topic.path = (topic.label.indexOf("/")>=0) ? topic.label : parentCatalog.path + topic.label;
        topic._parentpath = parentCatalog._fullpath;
        topic._itemspath = WebSaverGlobal.database.buildPath(topic._parentpath,topic.label);
        //alert(topic._itemspath);
        topic._fullpath = tStorage ? tStorage : WebSaverGlobal.database.buildPath(topic._parentpath,topic.label + '.xml');
        return topic;
    },
    nodeFromTopic	: function(xmldoc,topic,recur) {
        var elm_topic = xmldoc.createElement("Topic");
        elm_topic.setAttribute("label",topic.label);
        elm_topic.setAttribute("storage",topic.storage);
        var elm_filter = xmldoc.createElement("Filter");
        elm_filter.setAttribute("id","filter");
        elm_filter.setAttribute("names",topic.filter.names);
        elm_filter.setAttribute("minWidth",topic.filter.minWidth);
        elm_filter.setAttribute("maxWidth",topic.filter.maxWidth);
        elm_filter.setAttribute("minHeight",topic.filter.minHeight);
        elm_filter.setAttribute("maxHeight",topic.filter.maxHeight);
        elm_topic.appendChild(elm_filter);
        return elm_topic;
    },
    catalogFromNode	: function(node,parentCatalog,recur) {
        var label = node.getAttribute("label");
        var storage = node.getAttribute("storage");
        var directory = node.getAttribute("directory");
        var catalogs = new Array()
        var topics = new Array();
        var catalog = new this.database.catalog(label,storage,directory,topics,catalogs);
        catalog.path = (catalog.label.indexOf("/")>=0) ? catalog.label : parentCatalog.path + catalog.label;
        if(!catalog.path.match(/\/$/)) 
            catalog.path += "/";
        catalog._parentpath = parentCatalog._fullpath;
        catalog._fullpath = directory ? directory :  WebSaverGlobal.database.buildPath(parentCatalog._fullpath,catalog.label);
        if(recur) {
            for(var i=0;i<node.childNodes.length;i++) {
                var nodeName = node.childNodes[i].nodeName.toLowerCase();
                if(nodeName == "subcatalog") {
                    catalogs.push(this.catalogFromNode(node.childNodes[i]),catalog);
                }
                else if(nodeName == "topic") {
                topics.push(this.topicFromNode(node.childNodes[i]),catalog);
                }
                else {
                    continue;
                }
            }
        }
        catalog.catalogs = catalogs;
        catalog.topics = topics;
        return catalog;
    },
    nodeFromCatalog	: function(xmldoc,catalog,recur) {
        var elm = xmldoc.createElement("SubCatalog");
        elm.setAttribute("label",catalog.label);
        elm.setAttribute("storage",catalog.storage);
        elm.setAttribute("directory",catalog.directory);
        if(recur) {
            for(var i=0;i<catalog.catalogs.length;i++)
                elm.appendChild(this.nodeFromCatalog(xmldoc,catalog.catalogs[i]));
            for(var i=0;i<catalog.topics.length;i++) 
                elm.appendChild(this.nodeFromTopic(xmldoc,catalog.topics[i]));
        }
        return elm;
    },
    updateCatalog : function(catalog) {
        if(catalog._updated) {
            return catalog;
        }
        var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(
    			Components.interfaces.nsILocalFile);
    	dir.initWithPath(catalog._fullpath);
        var entries = dir.directoryEntries;
        catalog.catalogs = new Array();
        catalog.topics = new Array();
        while(entries.hasMoreElements()) {
            var elm = entries.getNext();
            elm.QueryInterface(Components.interfaces.nsIFile);
            var name = elm.leafName;
            if(elm.isDirectory()) {
                var new_cat = new WebSaverGlobal.database.catalog(name,"",elm.path);
                catalog.addCatalog(new_cat);
            }
            else if(elm.leafName.match(/\.xml$/)) {
                var path = elm.path;
                name = name.replace(/\.xml$/,"");
                path = path.replace(/\.xml$/,"");
                var new_top = new WebSaverGlobal.database.topic(name,"",elm.path);
                catalog.addTopic(new_top);
            }
        }
        xrLiN.debug.print("WebSaver:" + catalog._fullpath + ": get catalogs " + catalog.catalogs.length + ", topics " + catalog.topics.length);
        catalog._updated = 1;
        return catalog;
    },
    delCatalog : function(parentCatalog,catalog) {
        //To-do
    },
    delTopic : function(parentCatalog,topic) {
        //To-do
    },
    addCatalog : function(parentCatalog,catalog) {
        catalog.path = (catalog.label.indexOf("/")>=0) ? catalog.label : parentCatalog.path + catalog.label;
        if(!catalog.path.match(/\/$/)) 
            catalog.path += "/";
        catalog._parentpath = parentCatalog._fullpath;
        catalog._fullpath = WebSaverGlobal.database.buildPath(parentCatalog._fullpath,catalog.label);
        parentCatalog.catalogs.push(catalog);
        return catalog;
    },
    addTopic : function(parentCatalog,topic) {
        topic.path = (topic.label.indexOf("/")>=0) ? topic.label : parentCatalog.path + topic.label;
        topic._parentpath = parentCatalog._fullpath;
        topic._itemspath = WebSaverGlobal.database.buildPath(topic._parentpath,topic.label);
        //alert(topic._itemspath);
        topic._fullpath = WebSaverGlobal.database.buildPath(topic._parentpath,topic.label + '.xml');
        parentCatalog.topics.push(topic);
        return topic;
    },
    topicGetDataFolder : function(topic) {
        return topic._itemspath;
    },
    readCatalog : function(label,storage,directory) {
        var catalog = new WebSaverGlobal.database.catalog(label,storage,directory);
        catalog._fullpath = directory;
        catalog.rDirectory = "";
        return this.updateCatalog(catalog);
        return catalog;
    },
    writeCatalog : function(label,storage,directory) {
        //TO-DO
    },
    read	: function(storage,fullpath,withData) {
        xrLiN.debug.print("Reading " + storage);
        var xmldoc = this.getXMLDoc(storage);
        var label,directory;
        var catalogs = new Array();
        var topics = new Array();
        var result = new this.database.root(label,storage,fullpath,catalogs,topics);
        result.path = "/";
        if(xmldoc) {
            var elm_desc = this.getFirstElement(xmldoc,"Description");
            if(elm_desc) {
                result.label = elm_desc.getAttribute("label");
                result.directory = elm_desc.getAttribute("directory");
                if(result.directory && (!fullpath))
                {
                    result._fullpath = directory;
                }
                else
                {
                    result._fullpath = fullpath;
                }
            }
            for(var i=0;i<xmldoc.documentElement.childNodes.length;i++) {
                var node = xmldoc.documentElement.childNodes[i];
                var nodeName = node.nodeName.toLowerCase();
                if(nodeName == "subcatalog")  
                    catalogs.push(this.catalogFromNode(node,result,false));
                else if(nodeName == "topic") 
                    topics.push(this.topicFromNode(node,resulti,false));
                else 
                    continue;
            }
      }
      result.catalogs = catalogs;
      result.topics = topics;
      xrLiN.debug.print("Get catalog:" + 
                catalogs.length + ", topic:" + topics.length);
//      result.rDirectory = rDirectory;
      //this.database.buildCatalogDirectory(rDirectory,result);
      xrLiN.debug.print(storage + " readed.");
      return result;
    },
    write	: function(catalog,storage) {
        if(!catalog) return false;
    	var xmldoc = this.createXMLDoc("Catalog");
            var elm_desc = xmldoc.createElement("Description");
            elm_desc.setAttribute("id","metadata");
            elm_desc.setAttribute("label",catalog.label);
            elm_desc.setAttribute("storage",catalog.storage);
            elm_desc.setAttribute("directory",catalog.directory);
    	xmldoc.documentElement.appendChild(elm_desc);
    	for(var i=0;i<catalog.catalogs.length;i++) {
    		var cur = catalog.catalogs[i];
    		xmldoc.documentElement.appendChild(this.nodeFromCatalog(xmldoc,cur,false));
    	}
            for(var i=0;i<catalog.topics.length;i++) {
    		var cur = catalog.topics[i];
    		xmldoc.documentElement.appendChild(this.nodeFromTopic(xmldoc,cur,false));
    
            }
    	return this.writeXMLDoc(xmldoc,storage);
    },
    getFirstElement	: function(xmldoc,tagname) {
        var elms = xmldoc.getElementsByTagName(tagname);
        if(elms.length<1) return null;
        return elms[0];
    },
    getExtData : function(node){
    	var result = new Array();
    	for(var i=0;i<node.childNodes.length;i++) {
    		var cn = node.childNodes[i];
    		if(cn.nodeName.toLowerCase() == "#cdata-section") {
    				result.push(cn.textContent);
    		}
    	}
    	return result;
    },
    writeExtData : function(xmldoc,node) {
    	for(var i=2;i<arguments.length;i++) {
    			var cn = xmldoc.createCDATASection(arguments[i]);
    			if(cn) node.appendChild(cn);
    	}
    },
    readItems	: function(topic) {
        xrLiN.debug.print("readItems ... " + topic._fullpath);
        var xmldoc = this.getXMLDoc(topic._fullpath);
        if(xmldoc && xmldoc.documentElement.nodeName == "URLS") 
            return this.readItems1(topic._fullpath,xmldoc,true);
        var items = new Array();
        if(xmldoc) {
  	    var elm_items = xmldoc.getElementsByTagName("Item");
      	    for(var i=0;i<elm_items.length;i++) {
  	        var elm_item = elm_items[i];
                var iLabel  = elm_item.getAttribute("label");
                var iType   = elm_item.getAttribute("type");
                var iData   = elm_item.getAttribute("data");
                var iExtData = this.getExtData(elm_item);
                var iExt1 = iExtData[0] ? iExtData[0] : elm_item.getAttribute("extdata1");
                var iExt2	= iExtData[1] ? iExtData[1] : elm_item.getAttribute("extdata2");
                var iRefer  = elm_item.getAttribute("refer");
                var iDate   = elm_item.getAttribute("date");
		    items.push(new this.database.item(
                    iLabel,
                    iType,
                    iData,
                    iExt1,
                    iExt2,
                    iRefer,
                    iDate)
                )
            }
        }
      xrLiN.debug.print("Get " + items.length + " items");
      xrLiN.debug.print(topic._fullpath + " : items read.");
      return items;
    },
    readItems1	: function(storage,xmldoc) {
        xrLiN.debug.print("readItems1..." + storage);
        var items = new Array();
        var elm_items = xmldoc.getElementsByTagName("ITEM");
        for(var i=0;i<elm_items.length;i++) {
      	    var elm_item = elm_items[i];
            var iLabel  = elm_item.getAttribute("desc");
            var iType   = elm_item.getAttribute("type");
            var iData   = elm_item.getAttribute("url");
            var iExt1   = elm_item.getAttribute("data");
            var iExt2   = elm_item.getAttribute("text");
            var iRefer  = elm_item.getAttribute("refer");
            var iDate   = elm_item.getAttribute("date");
        	items.push(new this.database.item(
                iLabel,
                iType,
                iData,
                iExt1,
                iExt2,
                iRefer,
                iDate
               ));
        }
        xrLiN.debug.print("get " + items.length + " items");
        xrLiN.debug.print(storage + " : items read.");
        return items;
    },
    writeItems	: function(topic) {
    	var xmldoc = this.createXMLDoc("Topic");
        for(var i=0;i<topic.items.length;i++) {
    	    var cur = topic.items[i];
            var elm_item = xmldoc.createElement("Item");
            elm_item.setAttribute("label",cur.label);
            elm_item.setAttribute("type",cur.type);
            elm_item.setAttribute("data",cur.data);
            elm_item.setAttribute("refer",cur.refer);
            elm_item.setAttribute("date",cur.date);
            this.writeExtData(xmldoc,elm_item,cur.extdata1,cur.extdata2);
    		xmldoc.documentElement.appendChild(elm_item);
    
        }
    	return this.writeXMLDoc(xmldoc,topic._fullpath);
    }
}
    
