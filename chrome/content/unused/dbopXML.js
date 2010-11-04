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
    topicFromNode	: function(node) {
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
        var result = new this.database.topic(tLabel,
                    tStorage,
                    null,
                    filter,
                    null);
        return result;
    },
    nodeFromTopic	: function(xmldoc,topic) {
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
    catalogFromNode	: function(node) {
        var label = node.getAttribute("label");
        var storage = node.getAttribute("storage");
        var directory = node.getAttribute("directory");
        var catalogs = new Array()
        var topics = new Array();
        var result = new this.database.catalog(label,storage,directory,topics,catalogs);
        for(var i=0;i<node.childNodes.length;i++) {
            var nodeName = node.childNodes[i].nodeName.toLowerCase();
            if(nodeName == "subcatalog") {
                catalogs.push(this.catalogFromNode(node.childNodes[i]));
            }
            else if(nodeName == "topic") {
            topics.push(this.topicFromNode(node.childNodes[i]));
            }
            else {
                continue;
            }
        }
        result.catalogs = catalogs;
//        result.rDirectory = rDirectory;
        result.topics = topics;
        return result;
    },
    nodeFromCatalog	: function(xmldoc,catalog) {
        var elm = xmldoc.createElement("SubCatalog");
        elm.setAttribute("label",catalog.label);
        elm.setAttribute("storage",catalog.storage);
        elm.setAttribute("directory",catalog.directory);
        for(var i=0;i<catalog.catalogs.length;i++)
            elm.appendChild(this.nodeFromCatalog(xmldoc,catalog.catalogs[i]));
        for(var i=0;i<catalog.topics.length;i++) 
            elm.appendChild(this.nodeFromTopic(xmldoc,catalog.topics[i]));
        return elm;
    },
    read	: function(storage,rDirectory,withData) {
        xrLiN.debug.print("Reading " + storage);
        var xmldoc = this.getXMLDoc(storage);
        if(xmldoc && xmldoc.documentElement.nodeName == "URLS") 
            return this.read1(storage,xmldoc);
        var label,directory,cdate;
        var catalogs = new Array();
        var topics = new Array();
        if(xmldoc) {
            var elm_desc = this.getFirstElement(xmldoc,"Description");
            if(elm_desc) {
                label = elm_desc.getAttribute("label");
                directory = elm_desc.getAttribute("directory");
    //            cdate = elm_desc.getAttribute("cdate");
            }
           if(withData) {
            for(var i=0;i<xmldoc.documentElement.childNodes.length;i++) {
                var node = xmldoc.documentElement.childNodes[i];
                var nodeName = node.nodeName.toLowerCase();
                if(nodeName == "subcatalog")  
                    catalogs.push(this.catalogFromNode(node));
                else if(nodeName == "topic") 
                    topics.push(this.topicFromNode(node));
                else 
                    continue;
            }
           }
      }
      xrLiN.debug.print("Get catalog:" + 
                catalogs.length + ", topic:" + topics.length);
      var result = new this.database.root(label,storage,directory,catalogs,topics);
//      result.rDirectory = rDirectory;
      //this.database.buildCatalogDirectory(rDirectory,result);
      xrLiN.debug.print(storage + " readed.");
      return result;
    },
    read1	: function(storage,rDirectory,xmldoc) {
        var label,directory,cdate;
        var catalogs = new Array();
        var topics = new Array();
        label = xrLiN.string.getBasename(storage);
        directory = xrLiN.string.getDirname(storage)  + "/" + label;
        xrLiN.debug.print("Get catalog:" + 
                catalogs.length + ", topic:" + topics.length);
        xrLiN.debug.print(storage + " readed.");
        var result = new this.database.root(label,storage,directory,catalogs,topics);
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
    		xmldoc.documentElement.appendChild(this.nodeFromCatalog(xmldoc,cur));
    	}
            for(var i=0;i<catalog.topics.length;i++) {
    		var cur = catalog.topics[i];
    		xmldoc.documentElement.appendChild(this.nodeFromTopic(xmldoc,cur));
    
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
    readItems	: function(rStorage) {
        xrLiN.debug.print("readItems ... " + rStorage);
        var xmldoc = this.getXMLDoc(rStorage);
        if(xmldoc && xmldoc.documentElement.nodeName == "URLS") 
            return this.readItems1(rStorage,xmldoc,true);
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
      xrLiN.debug.print(rStorage + " : items read.");
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
    writeItems	: function(items,storage) {
        if(!items) return false;
    	var xmldoc = this.createXMLDoc("Topic");
        for(var i=0;i<items.length;i++) {
    	    var cur = items[i];
            var elm_item = xmldoc.createElement("Item");
            elm_item.setAttribute("label",cur.label);
            elm_item.setAttribute("type",cur.type);
            elm_item.setAttribute("data",cur.data);
            elm_item.setAttribute("refer",cur.refer);
            elm_item.setAttribute("date",cur.date);
            this.writeExtData(xmldoc,elm_item,cur.extdata1,cur.extdata2);
    		xmldoc.documentElement.appendChild(elm_item);
    
        }
    	return this.writeXMLDoc(xmldoc,storage);
    }
}
    
