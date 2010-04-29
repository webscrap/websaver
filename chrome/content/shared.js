
function getWebSaverGlobal() {
    var win = window;
    var result;
    while(win) {
        result = win.WebSaverGlobal;
        if(result!=null) 
            return result;
        else
            win = win.opener;
    }
    return result;
}

function getXrLiN() {
    var win = window;
    var result;
    while(win) {
        result = win.xrLiN;
        if(result!=null) 
            return result;
        else
            win = win.opener;
    }
    return result;
}

