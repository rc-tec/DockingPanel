Ext.define('dockingpanel.view.DockPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dockpanel',

    layout : 'fit',

    initComponent : function() {
        this.callParent(arguments);

        if(this.items.length === 0) {
            this.hide();
        }
    },

    getDockingContainer : function() {
        return this.up("dockcontainer");
    },

    supportsRegion : function(region) {
        if(this.region !== "center")
            return false;

        return this.getDockingContainer().supportedRegions.indexOf(region) >= 0;
    },

    movePanel : function(panel, destination, location) {
        this.removePanel(panel, false);

        if(["center", "left", "top", "bottom", "right"].indexOf(location) >= 0) {
            this.addPanel(panel, destination, location);
        }
        else if(["north", "south", "east", "west"].indexOf(location) >= 0) {
            this.getDockingContainer().addPanel(panel, location);
        }
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
        var positionToInsert = 0;

        if(location === "left" || location === "right") {
            if(destinationLayout !== "hbox") {
                destinationOwner = this.convertLayout(destination, "hbox");
            }

            positionToInsert = destinationOwner.items.indexOf(destination) + (location === "left" ? 0 : 1);

            destinationOwner.insert(positionToInsert, panel);
        }
        else if(location === "top" || location === "bottom") {
            if(destinationLayout !== "vbox") {
                destinationOwner = this.convertLayout(destination, "vbox");
            }

            positionToInsert = destinationOwner.items.indexOf(destination) + (location === "top" ? 0 : 1);

            destinationOwner.insert(positionToInsert, panel);
        }
        else if(location === "center") {
            if(destinationOwner.getXType() !== "droptabpanel") {
                destinationOwner = this.convertLayout(destination, "droptabpanel");
            }

            destinationOwner.add(panel);
        }
    },

    /**
     * Converts any given panel to an hbox or vbox container with the panel in it
     * @param panel
     * @param layout hbox or vbox
     * @returns Ext.container.Container
     */
    convertLayout : function(panel, layout) {
        var newContainer = {};

        if(layout === "droptabpanel") {
            newContainer = {
                xtype: 'droptabpanel',
                flex: panel.flex,
                plugins : [ Ext.create("dockingpanel.view.TabPanel.TabReorderer") ]
            };
        }
        else {
            newContainer = {
                xtype: 'container',
                layout: {
                    type: layout,
                    align: 'stretch'
                },
                flex: panel.flex
            };
        }

        var panelOwner = panel.ownerCt;
        var position = panelOwner.items.indexOf(panel);

        panelOwner.remove(panel, false);
        newContainer = panelOwner.insert(position, newContainer);

        panel.flex = 1;
        newContainer.add(panel);

        if(layout === "droptabpanel") {
            newContainer.setActiveItem(panel);
        }

        return newContainer;
    }
});