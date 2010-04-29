if (!xrLiN.zip) {
    xrLiN.zip = {
        CZip : Components.classes["@mozilla.org/libjar/zip-reader;1"],
        IZip : Components.interfaces.nsIZipReader, 
        IEntry : Components.interfaces.nsIZipEntry,
        getReader : function() {
            return this.CZip.createInstance(this.IZip);
        },
        getFiles : function(zipFile) {
            var result = new Array();
            try 
            {
                var zipFile = xrLiN.fileIO.fileObject(zipFile);
                var zipReader = this.getReader();
                zipReader.init(zipFile);
                zipReader.open();
                var it = zipReader.findEntries("*");
                while (it.hasMoreElements())
                {
                    var entry = it.getNext();
                    entry = entry.QueryInterface(this.IEntry);
                    result.push(entry.name);    
                }
                zipReader.close();
            }
            catch(e)
            {
                alert(e);
            }
            return result;
        }
    };
}

