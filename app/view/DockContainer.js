Ext.define('dockingpanel.view.DockContainer', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dockcontainer',

    movePanel : function(panel, destination, location) {
        this.removePanel(panel, false);
        this.addPanel(panel, destination, location);
    },

    removePanel : function(panel, destroy) {
        var owner = panel.ownerCt;

        if(owner) {
            owner.remove(panel, destroy);

            if(owner.items.length === 0)
                owner.destroy();
        }
    },

    addPanel : function(panel, destination, location) {
        var destinationOwner = destination.ownerCt;
        var destinationLayout = destinationOwner.layout.type;

        if(location === "left" || location === "right") {
            if(destinationLayout !== "hbox") {
                destinationOwner = this.convertLayout(destination, "hbox");
            }

            destinationOwner.add(panel);
        }
        else if(location === "top" || location === "bottom") {
            if(destinationLayout !== "vbox") {
                destinationOwner = this.convertLayout(destination, "vbox");
            }

            destinationOwner.add(panel);
        }
        else if(location === "center") {
            console.error("tab not yet supported");
        }
    },

    /**
     * Converts any given panel to an hbox or vbox container with the panel in it
     * @param panel
     * @param layout hbox or vbox
     * @returns Ext.container.Container
     */
    convertLayout : function(panel, layout) {
        var newContainer = {
            xtype : 'container',
            layout : {
                type : layout,
                align: 'stretch'
            },
            flex : panel.flex
        };

        var panelOwner = panel.ownerCt;
        var position = panelOwner.items.indexOf(panel);

        panelOwner.remove(panel, false);
        newContainer = panelOwner.insert(position, newContainer);

        panel.flex = 1;
        newContainer.add(panel);

        return newContainer;
    }
});