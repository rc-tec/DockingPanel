Ext.define('DockingPanel.DockContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.dockcontainer',

    requires: [
        'DockingPanel.DockPanel',
        'DockingPanel.EmptyDropPanel'
    ],

    layout: {
        type: 'border',
        padding: 5
    },
    defaults: {
        split: true
    },

    supportedRegions: [
        'south', 'east', 'west', 'north'
    ],

    addPanel: function (panel, region) {
        var regionPanel = this.getDockPanelForRegion(region);

        if (regionPanel) {
            if (regionPanel.items.length > 0) {
                regionPanel.addPanel(panel, regionPanel.down('droppanel'), 'center');
            } else {
                //Create panel
                regionPanel.add(panel);
            }

            regionPanel.show();
        }
    },

    getDockPanelForRegion: function (region) {
        var regionPanel = this.down('dockpanel[region="' + region + '"]');

        if (!regionPanel) {
            regionPanel = this.createRegionDockPanel(region);
        }

        return regionPanel;
    },

    createRegionDockPanel: function (region) {
        var panel = {
            xtype: 'dockpanel',
            region: region,
            width: 200,
            height: 200,
            supportedDocks: ['center']
        };

        return this.add(panel);
    },

    getJson: function () {
        var properties = [
            'xtype', 'flex', 'itemId', 'width', 'height', 'html', 'extra', 'region', 'title'
        ], i, property;

        var _recRead = function (cmp) {
            if (cmp.xtype === 'bordersplitter')
                return false;

            var obj = {};

            for (i = 0; i < properties.length; i++) {
                property = properties[i];

                if (cmp[property]) {
                    obj[property] = cmp[property];
                }
            }

            if (cmp.layout) {
                obj.layout = {
                    type: cmp.layout.type,
                    align: cmp.layout.align
                };
            }

            if (cmp.items) {
                obj.items = [];

                for (var i = 0; i < cmp.items.getCount(); i++) {
                    newCmp = _recRead(cmp.items.getAt(i));

                    if (newCmp)
                        obj.items.push(newCmp);
                }
            }

            return obj;
        };

        var res = _recRead(this);
        return JSON.stringify(res);
    }
});
