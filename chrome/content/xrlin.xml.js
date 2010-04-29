if (!xrLiN.XML) {
    xrLiN.XML={
        createDocument: function(URL,ROOTELM) {
            if (URL && URL != "") {
                try {
                    var req = new XMLHttpRequest();
                    req.open("GET",URL,false);
                    req.send(null);
                    var xmldoc = req.responseXML;
                    if (xmldoc.documentElement.nodeName == "parsererror")
                        return null;
                    return xmldoc;
                }
                catch (e) {
                    return null;
                }
            }
            else
                return document.implementation.createDocument("http://www.w3.org/1999/xhtml",ROOTELM,null);
        },
        serializeToStream : function (xmldoc,foStream) {
            var serializer = new XMLSerializer();
            serializer.serializeToStream(xmldoc, foStream, ""); 
        }
    };
}
