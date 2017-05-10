Ext.define('DockingPanel.DockPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dockpanel',

    layout: 'fit',

    supportedDocks: ['top', 'left', 'right', 'bottom', 'center'],
    allowSplitter: true,

    config: {
        emptyPanelConfig: {}
    },

    initComponent: function () {
        this.callParent(arguments);

        if (this.items.length === 0) {
            this.hide();
        }
    },

    getDockingContainer: function () {
        return this.up('dockcontainer');
    },

    supportsRegion: function (region) {
        if (this.region !== 'center')
            return false;

        return this.getDockingContainer().supportedRegions.indexOf(region) >= 0;
    },

    supportsDock: function (location) {
        if (this.down('emptydroppanel')) {
            return ['center'].indexOf(location) >= 0;
        }

        return this.supportedDocks.indexOf(location) >= 0;
    },

    movePanel: function (panel, destination, location) {
        Ext.suspendLayouts();

        if (destination.up('droptabpanel') && panel.up('droptabpanel')) {
            //if we move something out of an droptabpanel but want it to dock beside itself
            //we need the droptabpanels parent

            if (destination.up('droptabpanel').id === panel.up('droptabpanel').id) {
                if (panel.up('droptabpanel').items.length > 2) {
                    destination = destination.up('droptabpanel');
                }
            }
        }

        //If we move from any droptabpanel, we need to add a flex property
        if (panel.up('droptabpanel')) {
            if (!panel.flex) {
                panel.flex = 1;
            }
        }

        var panelConfig = panel.cloneConfig();

        var newDestination = this.removePanel(panel, destination, false);

        //TabPanel is going to be divided into hbox or vbox
        //so we need a new destination panel => the newly created vbox/hobx
        if (newDestination) {
            destination = newDestination;
        }

        if (panel.getController()) {
            panel.getController().destroy();
        }

        if (['center', 'left', 'top', 'bottom', 'right'].indexOf(location) >= 0) {
            this.addPanel(panelConfig, destination, location);
        } else if (['north', 'south', 'east', 'west'].indexOf(location) >= 0) {
            this.getDockingContainer().addPanel(panelConfig, location);
        }

        panel.destroy();

        Ext.resumeLayouts(true);
    },

    removePanel: function (panel, destination, destroy) {
        var owner = panel.ownerCt,
            newDestination = null,
            index = 0,
            ownerChildCount,
            nextSibling = null;

        if (owner) {
            index = owner.items.indexOf(panel);
            ownerChildCount = owner.items.length;

            if (index < ownerChildCount) {
                //Check if nextSibling is splitter, if so, remove it
                nextSibling = panel.nextSibling();

                if (nextSibling && nextSibling.getXType() === 'splitter') {
                    nextSibling.destroy();
                }
            }

            owner.remove(panel, destroy);

            if (owner.getXType() === 'droptabpanel') {
                //DropTabPanel has one item left, so we need to convert it
                if (owner.items.length === 1) {
                    var dropTabPanelConverted = this.convertTabLayoutToPanel(owner);

                    if (destination === panel) {
                        newDestination = dropTabPanelConverted;
                    }
                }
            }

            if (owner.layout.type === 'hbox' || owner.layout.type === 'vbox') {
                var childsLeft = owner.query('panel').length;

                //Check if its the last item in hbox,vbox and remove all remaining splitters
                if (childsLeft <= 1) {
                    var splitters = owner.query('splitter');

                    for (var i = 0; i < splitters.length; i++) {
                        splitters[i].destroy();
                    }

                    if (childsLeft === 0) {
                        if (owner.previousSibling() && owner.previousSibling().getXType() === 'splitter') {
                            owner.previousSibling().destroy();
                        }
                    }
                } else {
                    //Check if last item in box is splitter and remove it
                    if (owner.items.last().getXType() === 'splitter') {
                        owner.items.last().destroy();
                    }
                }
            }

            if (owner.items.length === 0) {
                if (owner.getXType() === 'dockpanel' && owner.region === 'center') {
                    //Create dummy drop panel
                    var newCenter = null;
                    var dockContainer = owner.up("dockcontainer");

                    if (dockContainer.items.length > 1) {
                        Ext.each(dockContainer.items.items, function (item) {
                            if (item.region !== null && item.region !== 'center' && item.xtype !== 'bordersplitter') {
                                newCenter = item;
                                return false;
                            }
                        });
                    }

                    if (newCenter) {
                        dockContainer.remove(owner, true);
                        dockContainer.remove(newCenter, false);

                        newCenter.region = 'center';

                        dockContainer.add(newCenter);
                    }
                    else {
                        owner.add(Ext.apply({
                            xtype: 'emptydroppanel'
                        }, this.getEmptyPanelConfig()));
                    }
                } else {
                    if (owner.ownerCt.items.length === 1)
                        this.removePanel(owner, destination, true);
                    else {
                        owner.destroy();
                    }
                }
            }
        }

        return newDestination;
    },

    addPanel: function (panel, destination, location) {
        var destinationOwner,
            originalDestination = destination,
            destinationLayout,
            positionToInsert = 0,
            positionInOwner = 0;

        if (destination.getXType() === 'emptydroppanel') {
            //destination = destination.ownerCt;
        }

        if (destination.up('droptabpanel') && location !== 'center') {
            destination = destination.ownerCt;
        }

        destinationOwner = destination.ownerCt;
        destinationLayout = destinationOwner.layout.type;

        if (!this.supportsDock(location)) {
            Ext.raise(location + ' is not supported here!');
        }

        if (location === 'left' || location === 'right') {
            if (destinationLayout !== 'hbox') {
                destinationOwner = this.convertLayout(destination, 'hbox');
            }

            positionInOwner = destinationOwner.items.indexOf(destination);
            if (positionInOwner !== -1) {
                positionToInsert = positionInOwner + (location === 'left' ? 0 : 1);
            } else {
                positionToInsert = (location === 'left' ? 0 : 1);
            }

            destinationOwner.insert(positionToInsert, panel);

            if (this.allowSplitter) {
                //if docked to the right, we need to insert the splitter left
                if (location === 'right') {
                    destinationOwner.insert(positionToInsert, {xtype: 'splitter'});
                } else {
                    destinationOwner.insert(positionToInsert + 1, {xtype: 'splitter'});
                }
            }
        } else if (location === 'top' || location === 'bottom') {
            if (destinationLayout !== 'vbox') {
                destinationOwner = this.convertLayout(destination, 'vbox');
            }

            positionInOwner = destinationOwner.items.indexOf(destination);
            if (positionInOwner !== -1) {
                positionToInsert = positionInOwner + (location === 'top' ? 0 : 1);
            } else {
                positionToInsert = (location === 'top' ? 0 : 1);
            }

            destinationOwner.insert(positionToInsert, panel);

            if (this.allowSplitter) {
                //if docked to the right, we need to insert the splitter left
                console.log(destinationOwner.id);
                if (location === 'top') {
                    destinationOwner.insert(positionToInsert + 1, {xtype: 'splitter'});
                } else {
                    destinationOwner.insert(positionToInsert, {xtype: 'splitter'});
                }
            }
        } else if (location === 'center') {
            if (originalDestination.getXType() === 'emptydroppanel') {

            } else if (destinationOwner.getXType() !== 'droptabpanel') {
                destinationOwner = this.convertLayout(destination, 'droptabpanel');
            }

            destinationOwner.insert(0, panel);

            if (destinationOwner.getXType() === 'droptabpanel') {
                destinationOwner.setActiveItem(panel);
            }
        }

        if (originalDestination.getXType() === 'emptydroppanel') {
            originalDestination.destroy();
        }
    },

    /**
     * Converts any given panel to an hbox or vbox container with the panel in it
     * @param panel
     * @param layout hbox or vbox
     * @returns Ext.container.Container
     */
    convertLayout: function (panel, layout) {
        var newContainer = {};

        if (!panel.flex) {
            panel.flex = 1;
        }

        if (layout === 'droptabpanel') {
            newContainer = {
                xtype: 'droptabpanel',
                flex: panel.flex
            };
        } else {
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

        if (layout === 'droptabpanel') {
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
    convertTabLayoutToPanel: function (tabPanel) {
        var lastTabItem = tabPanel.items.getAt(0);
        var index = tabPanel.ownerCt.items.indexOf(tabPanel);
        var config = lastTabItem.cloneConfig();

        tabPanel.remove(lastTabItem, true);

        if (!config.flex) {
            config.flex = 1;
        }

        return tabPanel.ownerCt.insert(index, config);
    }
});
