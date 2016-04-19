Ext.define('dockingpanel.view.DockPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dockpanel',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.dd.DragDropManager',
        'Ext.util.Point',
        'Ext.util.Region',
        'Ext.util.Positionable',

        'dockingpanel.view.DropTarget'
    ],

    title: 'Drag & Drop',

    init: function(c){

    },

    initComponent: function(ctl) {

        var me = this;

        this._posProxy = {};
        this._splitBox = {};

        //var target = Ext.create('Ext.dd.DDTarget', ctl, 'drag-panels');

        Ext.apply(this, {
            html: 'docker',
            listeners: {
                afterrender: function() {

                    this._ddProxy = Ext.create('Ext.dd.DDProxy', this.el, 'drag-panels', {
                        isTarget: true
                    });

                    var target = Ext.create('dockingpanel.view.DropTarget', this, {});

                    this._ddProxy.setHandleElId(Ext.get(this.header.id));

                    Ext.apply(this._ddProxy, {
                        startDrag: function(e) {
                            target.disableTarget();
                            //console.log('startDrag');
                        },
                        onDrag: function(e) {
                            //console.log('onDrag');
                        },
                        onDragEnter: function(e, id) {
                            //console.log('onDragEnter');
                            Ext.dd.DragDropManager.getDDById(id).notifyEnter(this,  e.getXY()[0], e.getXY()[1]);
                        },
                        onDragOver: function(e, id) {

                            //console.log('onDragOver');
                            Ext.dd.DragDropManager.getDDById(id).notifyOver(this,  e.getXY()[0], e.getXY()[1]);
                        },
                        onDragOut: function(e, id) {
                            //console.log('onDragOut');
                            //Ext.dd.DragDropManager.getDDById(id).notifyOut(this,  e.getXY()[0], e.getXY()[1]);
                        },
                        onDragDrop: function(e, id) {
                            var dest = Ext.dd.DragDropManager.getDDById(id);
                            if (dest.isEnabled()) {
                                dest.notifyEndDrag(this,e.getXY()[0], e.getXY()[1]);
                                target.enableTarget();
                                var destLoc = dest.getDestination();
                                if (destLoc !== null) {
                                    Ext.getCmp(dest.id).up("dockcontainer").movePanel(Ext.getCmp(this.id), Ext.getCmp(dest.id), destLoc);
                                }
                            }
                        },
                        onInvalidDrop: function() {

                        },
                        endDrag: function(e, id) {
                            var targets = Ext.dd.DragDropManager.getRelated(this, true);

                            for(var i = 0; i < targets.length; i++) {
                                targets[i].notifyEndDrag(this,  e.getXY()[0], e.getXY()[1]);
                            }

                            target.enableTarget();
                        },
                        scope : this
                    });

                }.bind(this)
            }

        });

        this.callParent(arguments);
    },


});

