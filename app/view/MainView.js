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
                    height : 200,
                    supportedDocks : ['center']
                },
                {
                    xtype : 'dockpanel',
                    region : 'south',
                    height : 200,
                    supportedDocks : ['center'],
                    items : [
                        {
                            xtype: 'droppanel',
                            flex: 1,
                            html: 'Left Box',
                            layout: 'fit',
                            title : 'South'
                        }
                    ]
                },
                {
                    xtype : 'dockpanel',
                    region : 'west',
                    width : 200,
                    supportedDocks : ['center'],
                    items : [
                        {
                            xtype: 'droppanel',
                            flex: 1,
                            html: 'Left Box',
                            layout: 'fit',
                            title : 'West'
                        }
                    ]
                },
                {
                    xtype : 'dockpanel',
                    region : 'east',
                    width : 200,
                    supportedDocks : ['center'],
                    items : [
                        {
                            xtype: 'droppanel',
                            flex: 1,
                            html: 'Left Box',
                            layout: 'fit',
                            title : 'East'
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
                            layout: 'fit',
                            title : 'Most Left'
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
                                    flex: 1,
                                    title : 'Top'
                                },
                                {
                                    xtype: 'droppanel',
                                    html: 'Bottom Box',
                                    flex: 1,
                                    title : 'Bottom'
                                }
                            ]
                        },
                        {
                            xtype: "droptabpanel",
                            flex: 1,
                            layout:
                            {
                                type: "card"
                            },
                            items: [
                                {
                                    xtype: "droppanel",
                                    title : "Erster Eintrag",
                                    flex: 1,
                                    layout:
                                    {
                                        type: "autocontainer"
                                    },
                                    items: []
                                },
                                {
                                    xtype: "droppanel",
                                    title : "Zweiter Eintrag",
                                    flex: 1,
                                    layout:
                                    {
                                        type: "autocontainer"
                                    },
                                    items: []
                                }]
                        },
                        {
                            xtype: 'droppanel',
                            flex: 1,
                            html: 'Right Box',
                            title : 'Most Right'
                        }
                    ]
                }
            ]
        }
    ]
});
