
xrLiN.window = function() {
    this.longName    = "xrLiN window related javascript library";
    this.version     = "0.1";
    this.getMainWindow = function() {
        return window.QueryInterface(
            Components.interfaces.nsIInterfaceRequestor).getInterface(
                Components.interfaces.nsIWebNavigation).QueryInterface(
                Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(
                Components.interfaces.nsIInterfaceRequestor).getInterface(
                Components.interfaces.nsIDOMWindow);
    }
    return this;
}
