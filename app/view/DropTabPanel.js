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
        var plugin = Ext.create('dockingpanel.view.dd.DDPanelPlugin');

        if(this.plugins)
            this.plugins.push(plugin);
        else
            this.plugins = [plugin];

        this.callParent(arguments);
    }

});

