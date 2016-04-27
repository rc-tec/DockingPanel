Ext.define('DockingPanel.DropTabPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.droptabpanel',

    requires: [
        'DockingPanel.dd.DropTarget',
        'DockingPanel.dd.DDPanelPlugin'
    ],

    initComponent: function(cfg) {
        //var ddPlugin = Ext.create('DockingPanel.dd.DDPanelPlugin');
        //var reorderPlugin = Ext.create("dockingpanel.view.TabPanel.TabReorderer");

        if(this.plugins) {
            //this.plugins.push(ddPlugin);
        }
        else {
            //this.plugins = [ddPlugin];
        }

        this.callParent(arguments);
    },

    getDockingPanel : function() {
        return this.up("dockpanel");
    }
});

