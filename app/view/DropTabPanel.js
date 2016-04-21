Ext.define('dockingpanel.view.DropTabPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.droptabpanel',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.dd.DragDropManager',
        'Ext.util.Point',
        'Ext.util.Region',
        'Ext.util.Positionable',

        'dockingpanel.view.dd.DropTarget'
    ],

    initComponent: function(cfg) {
        //var ddPlugin = Ext.create('dockingpanel.view.dd.DDPanelPlugin');
        var reorderPlugin = Ext.create("dockingpanel.view.TabPanel.TabReorderer");

        if(this.plugins) {
            //this.plugins.push(ddPlugin);
            this.plugins.push(reorderPlugin);
        }
        else {
            this.plugins = [reorderPlugin];
        }

        this.callParent(arguments);
    },

    getDockingPanel : function() {
        return this.up("dockpanel");
    }
});

