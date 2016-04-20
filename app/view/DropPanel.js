Ext.define('dockingpanel.view.DropPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.droppanel',

    requires: [
        'dockingpanel.view.dd.DDPanelPlugin'
    ],

    title: 'Drag & Drop ',

    initComponent: function(cfg) {
        var plugin = Ext.create('dockingpanel.view.dd.DDPanelPlugin');

        if(this.plugins)
            this.plugins.push(plugin);
        else
            this.plugins = [plugin];

        this.callParent(arguments);
    },

    getDockingPanel : function() {
        return this.up("dockpanel");
    }
});

