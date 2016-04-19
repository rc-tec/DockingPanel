Ext.define('dockingpanel.view.MainView', {
    extend: 'Ext.panel.Panel',

    requires: [
        'dockingpanel.view.DockContainer',
        'Ext.plugin.Viewport'
    ],

    layout: {
        type: 'fit'
    },

    items: [{

        xtype : 'dockcontainer',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },

        items: [
            {
                xtype: 'dockpanel',
                flex: 1,
                html: 'Left Box',
                layout: 'fit'
            },
            {
                xtype : 'panel',
                flex : 1,
                layout : {
                    type : 'vbox',
                    align : 'stretch'
                },
                items : [
                    {
                        xtype: 'dockpanel',
                        html: 'Top Box',
                        flex: 1
                    },
                    {
                        xtype: 'dockpanel',
                        html: 'Bottom Box',
                        flex: 1
                    }
                ]
            },
            {
                xtype: 'dockpanel',
                flex: 1,
                html: 'Right Box'
            }
        ]
    }]
});
