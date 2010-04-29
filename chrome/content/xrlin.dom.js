if(!xrLiN.dom) {
    xrLiN.dom = {
        getNode : function(id) { 
            var node = document.getElementById(id);
            if(node) return node;
            xrLiN.debug.print("Element \""+id+"\" not found!");
            return null;
        },
        setValue : function(id,value) {
            var node = this.getNode(id);
            if(node)
                node.value = value;
        },
        getValue : function(id) {
            var node = this.getNode(id);
            if(node)
                return node.value;
            else
                return null;
        }
    }
}
