if(!xrLiN.menu) {
    xrLiN.menu = {
        createMenu : function(id,label) {
            var result = document.createElement("menu");
            result.setAttribute("id",id);
            result.setAttribute("label",label);
            return result;
        },
        createMenuPopup : function(id,command) {
            var result = document.createElement("menupopup");
            result.setAttribute("id",id);
            if(command) result.setAttribute("oncommand", command + "; event.stopPropagation();");
            return result;
        },
        createMenuItem : function(id,label,tooltip,command,disabled,accesskey) {
            var item = document.createElement("menuitem");
            if(id) item.setAttribute("id",id);
            if(label) item.setAttribute("label", label);
            if(tooltip) item.setAttribute("tooltiptext", tooltip);
            if(command) item.setAttribute("oncommand", command + "; event.stopPropagation();");
            item.setAttribute("disabled", disabled);
            if(accesskey) item.setAttribute("accesskey", accesskey);
            return item;
        },
        createSeparator : function() {
            return document.createElement("menuseparator");
        },
        removeMenuItems : function(menu)
        {
            var children = menu.childNodes;
            for (var i = children.length - 1; i >= 0; i--)
            {
                this.removeMenuItems(children[i]);
                menu.removeChild(children[i]);
            }
        }
    };
}
