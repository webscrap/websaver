if (!xrLiN.system) {
    xrLiN.system = {
        IFilePicker : Components.interfaces.nsIFilePicker,
        CFilePicker : Components.classes["@mozilla.org/filepicker;1"],
        pickFolder : function() {
                var fp = this.CFilePicker.createInstance(this.IFilePicker);
                fp.init(window, "Select Folder", this.IFilePicker.modeGetFolder);
                var res = fp.show();
                if (res == this.IFilePicker.returnOK)
                    return fp.file.path;
                return null;
        },
        saveFile : function() {
                var fp = this.CFilePicker.createInstance(this.IFilePicker);
                fp.appendFilters(this.IFilePicker.filterAll);
                fp.init(window, "Save File", this.IFilePicker.modeSave);
                var res = fp.show();
                if (res == this.IFilePicker.returnOK)
                    return fp.file.path;
                return null;
        },
        openFile : function() {
                var fp = this.CFilePicker.createInstance(this.IFilePicker);
                fp.appendFilters(this.IFilePicker.filterAll);
                fp.init(window, "Open File", this.IFilePicker.modeOpen);
                var res = fp.show();
                if (res == this.IFilePicker.returnOK)
                    return fp.file.path;
                return null;
        },
        pickFile : function() {
                var fp = this.CFilePicker.createInstance(this.IFilePicker);
                fp.appendFilters(this.IFilePicker.filterAll);
                fp.init(window, "Pick File", this.IFilePicker.modeSave | this.IFilePicker.modeOpen);
                var res = fp.show();
                if (res == this.IFilePicker.returnOK)
                    return fp.file.path;
                return null;
        }
    };
}
