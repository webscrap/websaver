if(!xrLiN.utils) {
xrLiN.utils = {
    orNull:
    function(arg) {
        return arg ? arg : null;
    },
    orEmpty:
    function(arg) {
        return arg ? arg : "";
    },
    orZero:
    function(arg) {
        return arg ? arg : 0;
    },
    orArray:
    function(arg) {
        return arg ? arg : new Array();
    },
    orAnything:
    function(arg,any) {
        return arg ? arg : any;
    },
    deleteIndex:
    function(arr,index) {
        if(arr.length<index)
            return arr;
        return arr.splice(index,1);
    },
    deleteItem:
    function(arr,item) {
        var idx;
    },
}
}
