xrLiN.debug.print("Initializing xrLiN.string");
if(!xrLiN.string) {
    xrLiN.string = {
        getFilename :
            function(fn) {
                var m = fn.match(/[\\\/]([^\\\/]*)$/);
                if(m) 
                    return m[1];
                else
                    return fn;
            },
        getBasename :
            function(fn) {
                fn = this.getFilename(fn);
                var m = fn.match(/(.*)\.[^\.]*$/);
                return m ? m[1] : fn;
            },
        getDirname :
            function(fn) {
                var m = fn.match(/(.*)[\/\\][^\/\\]*$/);
                return m ? m[1] : ".";
            }
    }
}
