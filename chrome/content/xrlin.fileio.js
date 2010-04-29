if (!xrLiN.fileIO) {
    xrLiN.fileIO={
        outputStream : function(fileObject) {
            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
            foStream.init(fileObject,0x02|0x08|0x20,0644,0);
            return foStream;
        },
        textOutputStream : function(fos,charset) {
            if (!fos) return null;
            if (!charset) charset = "utf-8"; 
            var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
            os.init(fos, charset, 0, 0x0000);
            return os;
        },
    
        appendStream : function(fileObject) {
            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
            foStream.init(fileObject,0x02|0x10,0644,0);
            return foStream;
        },
    
        fileObject : function(filePath) {
            //filePath = filePath.replace(/\\/g,"/");
            var newFileObject = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            if (filePath && filePath != "" ) newFileObject.initWithPath(filePath);
            return newFileObject;
        },
    
        tmpFileObject : function(fileName) {
             var tmpFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
                if (fileName) tmpFile.append(fileName);
                try
                {
                    if (tmpFile.exists())
                        tmpFile.remove(false);
                     tmpFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
                }
                catch (e)
                {
                    tmpFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
                }
            return tmpFile;
        },
    
        writeLine : function (foStream,text) {
            return foStream.write(text + "\n",text.length +1);
        }
    };
}

