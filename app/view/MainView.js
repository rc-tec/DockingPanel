Ext.define('dockingpanel.view.MainView', {
    extend: 'Ext.panel.Panel',

    requires: [
        'dockingpanel.view.DockContainer'
    ],

    layout: {
        type: 'fit'
    },

    items: [
        {
            xtype : 'dockcontainer',
            items : [
                {
                    xtype : 'dockpanel',
                    region : 'north',
                    height : 200
                },
                {
                    xtype : 'dockpanel',
                    region : 'south',
                    height : 200,
                    items : [
                        {
                            xtype: 'droppanel',
                            flex: 1,
                            html: 'Left Box',
                            layout: 'fit'
                        }
                    ]
                },
                {
                    xtype : 'dockpanel',
                    region : 'west',
                    width : 200,
                    items : [
                        {
                            xtype: 'droppanel',
                            flex: 1,
                            html: 'Left Box',
                            layout: 'fit'
                        }
                    ]
                },
                {
                    xtype : 'dockpanel',
                    region : 'east',
                    width : 200,
                    items : [
                        {
                            xtype: 'droppanel',
                            flex: 1,
                            html: 'Left Box',
                            layout: 'fit'
                        }
                    ]
                },
                {
                    xtype : 'dockpanel',
                    region : 'center',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },

                    items: [
                        {
                            xtype: 'droppanel',
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
                                    xtype: 'droppanel',
                                    html: 'Top Box',
                                    flex: 1
                                },
                                {
                                    xtype: 'droppanel',
                                    html: 'Bottom Box',
                                    flex: 1
                                }
                            ]
                        },
                        {
                            xtype: 'droppanel',
                            flex: 1,
                            html: 'Right Box'
                        }
                    ]
                }
            ]
        }
    ]
});
