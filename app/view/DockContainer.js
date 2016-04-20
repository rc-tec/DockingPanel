Ext.define('dockingpanel.view.DockContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.dockcontainer',

    requires: [
        'dockingpanel.view.DockPanel'
    ],

    layout: {
        type: 'border',
        padding: 5
    },
    defaults: {
        split: true
    },

    supportedRegions : [
        'south', 'east', 'west', 'north'
    ],

    addPanel : function(panel, region) {
        var regionPanel = this.getDockPanelForRegion(region);

        if(regionPanel.items.length > 0) {
            regionPanel.addPanel(panel, regionPanel.items.getAt(0), 'center');
        }
        else {
            //Create panel
            regionPanel.add(panel);
        }

        regionPanel.show();
    },

    getDockPanelForRegion : function(region) {
        var regionPanel = this.down('dockpanel[region="'+region+'"]');
        
        if(!regionPanel) {
            console.error("region '" + region + "' not found");
            return false;
        }

        return regionPanel;
    },
});