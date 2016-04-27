Ext.define('DockingPanel.DockPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dockpanel',

    layout : 'fit',

    supportedDocks : ['top', 'left', 'right', 'bottom', 'center'],

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

    supportsDock : function(location) {
        if(this.down("emptydroppanel")) {
            return ['center'].indexOf(location) >= 0;
        }

        return this.supportedDocks.indexOf(location) >= 0;
    },

    movePanel : function(panel, destination, location) {
        if (destination.up("droptabpanel") && panel.up("droptabpanel")) {
            //if we move something out of an droptabpanel but want it to dock beside itself
            //we need the droptabpanels parent
            if(panel.up("droptabpanel").items.length > 2) {
                destination = destination.up("droptabpanel");
            }
        }

        var newDestination = this.removePanel(panel, false);

        //TabPanel is going to be divided into hbox or vbox
        //so we need a new destination panel => the newly created vbox/hobx
        if(newDestination) {
            destination = newDestination;
        }

        if(["center", "left", "top", "bottom", "right"].indexOf(location) >= 0) {
            this.addPanel(panel.cloneConfig(), destination, location);
        }
        else if(["north", "south", "east", "west"].indexOf(location) >= 0) {
            this.getDockingContainer().addPanel(panel.cloneConfig(), location);
        }
    },

    removePanel : function(panel, destroy) {
        var owner = panel.ownerCt,
            newDestination = null;

        if(owner) {
            owner.remove(panel, destroy);

            if(owner.getXType() === "droptabpanel") {
                if(owner.items.length === 1) {
                    //Move item to owners parent
                    newDestination = this.convertTabLayoutToPanel(owner);
                }
            }

            if(owner.items.length === 0) {
                if(owner.getXType() === "dockpanel" && owner.region === "center") {
                    //Create dummy drop panel
                    owner.add({
                        xtype : 'emptydroppanel'
                    });
                }
                else {
                    if(owner.ownerCt.items.length === 1)
                        this.removePanel(owner, true);
                    else {
                        owner.destroy();
                    }
                }
            }
        }

        return newDestination;
    },

    addPanel : function(panel, destination, location) {
        var destinationOwner,
            originalDestination = destination,
            destinationLayout,
            positionToInsert = 0,
            positionInOwner = 0;

        if(destination.getXType() === 'emptydroppanel') {
            //destination = destination.ownerCt;
        }

        if(destination.up("droptabpanel") && location !== 'center')
        {
            destination = destination.ownerCt;
        }

        destinationOwner = destination.ownerCt;
        destinationLayout = destinationOwner.layout.type;

        if(!this.supportsDock(location)) {
            Ext.raise(location + " is not supported here!");
        }

        if(location === "left" || location === "right") {
            if(destinationLayout !== "hbox") {
                destinationOwner = this.convertLayout(destination, "hbox");
            }

            positionInOwner = destinationOwner.items.indexOf(destination);
            if(positionInOwner!==-1){
                positionToInsert = positionInOwner + (location === "left" ? 0 : 1);
            } else {
                positionToInsert = (location === "left" ? 0 : 1)
            }

            destinationOwner.insert(positionToInsert, panel);
        }
        else if(location === "top" || location === "bottom") {
            if(destinationLayout !== "vbox") {
                destinationOwner = this.convertLayout(destination, "vbox");
            }

            positionInOwner = destinationOwner.items.indexOf(destination);
            if(positionInOwner!==-1) {
                positionToInsert = positionInOwner + (location === "top" ? 0 : 1);
            } else {
                positionToInsert = (location === "top" ? 0 : 1)
            }

            destinationOwner.insert(positionToInsert, panel);
        }
        else if(location === "center") {
            if(originalDestination.getXType() === "emptydroppanel") {

            }
            else if (destinationOwner.getXType() !== "droptabpanel") {
                destinationOwner = this.convertLayout(destination, "droptabpanel");
            }

            destinationOwner.insert(0, panel);
            destinationOwner.setActiveItem(panel);
        }

        if(originalDestination.getXType() === "emptydroppanel") {
            originalDestination.destroy();
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
                flex: panel.flex
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
        if(layout === "droptabpanel") {
            panel = newContainer.add(panel.cloneConfig());
            newContainer.setActiveItem(panel);
        } else {
            newContainer.add(panel);
        }

        return newContainer;
    },

    /**
     * Converts Tab Entry to normal panel
     *
     * @param tabPanel
     */
    convertTabLayoutToPanel : function(tabPanel) {
        var lastTabItem = tabPanel.items.getAt(0);
        var index = tabPanel.ownerCt.items.indexOf(tabPanel);

        tabPanel.remove(lastTabItem, false);

        return tabPanel.ownerCt.insert(index, lastTabItem.cloneConfig());
    }
});