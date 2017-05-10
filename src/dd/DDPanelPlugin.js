Ext.define('DockingPanel.dd.DDPanelPlugin', {

    requires: [
        'DockingPanel.dd.DropTarget'
    ],

    title: 'Drag & Drop ',

    panel: null,
    isInitialized: false,

    init: function (panel) {
        this.panel = panel;

        this.panel.on('afterlayout', this.initDragDrop, this);
        this.panel.on('destroy', this.destroy, this);
    },

    destroy: function () {
        if (this._ddProxy)
            this._ddProxy.destroy();

        if (this._target)
            this._target.destroy();
    },

    initDragDrop: function () {
        if (this.isInitialized) {
            return;
        }

        var dd;

        this.ddProxy = Ext.create('Ext.dd.DDProxy', this.getDragId(), 'drag-panels', {
            isTarget: true
        });
        this.target = Ext.create('DockingPanel.dd.DropTarget', this.panel, {});
        this.ddProxy.setHandleElId(this.getPanelHeaderId());

        Ext.apply(this.ddProxy,
            {
                startDrag: function (e) {
                    if (!this.panel.up('droptabpanel')) {
                        this.target.disableTarget();
                    }
                }.bind(this),
                onDragEnter: function (e, id) {
                    dd = Ext.dd.DragDropManager.getDDById(id);

                    if (dd) {
                        dd.notifyEnter(this.panel, e.getXY()[0], e.getXY()[1]);
                    }
                }.bind(this),
                onDragOver: function (e, id) {
                    dd = Ext.dd.DragDropManager.getDDById(id);

                    if (dd) {
                        dd.notifyOver(this.panel, e.getXY()[0], e.getXY()[1]);
                    }
                }.bind(this),
                onDragOut: function (e, id) {
                    dd = Ext.dd.DragDropManager.getDDById(id);

                    if (dd) {
                        dd.notifyOut(this.panel, e.getXY()[0], e.getXY()[1]);
                    }
                }.bind(this),
                onDragDrop: function (e, id) {
                    dd = Ext.dd.DragDropManager.getDDById(id);

                    if (dd.isEnabled()) {
                        dd.notifyEndDrag(this, e.getXY()[0], e.getXY()[1]);
                        this.target.enableTarget();
                        var destLoc = dd.getDestination();
                        if (destLoc !== null) {
                            Ext.getCmp(dd.id).up('dockpanel').movePanel(Ext.getCmp(this.panel.id), Ext.getCmp(dd.id), destLoc);
                        }
                    }
                }.bind(this),
                endDrag: function (e, id) {
                    var targets = Ext.dd.DragDropManager.getRelated(this.panel, true);

                    for (var i = 0; i < targets.length; i++) {
                        targets[i].notifyEndDrag(this.panel, e.getXY()[0], e.getXY()[1]);
                    }

                    this.target.enableTarget();
                }.bind(this),
                clickValidator: Ext.Function.createInterceptor(this.ddProxy.clickValidator, this.clickValidator, this, false)
            }
        );

        this.isInitialized = true;
    },

    clickValidator: function () {
        return true;
    },

    getPanelHeaderId: function () {
        if (this.panel.up('droptabpanel')) {
            return this.panel.tab.id;
        }

        if (this.panel.header)
            return this.panel.header.id;

        return this.panel.id;
    },

    getDragId: function () {
        return this.panel.tab ? this.panel.tab.el.id : this.panel.el.id;
    }
});

