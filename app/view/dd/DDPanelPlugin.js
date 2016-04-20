Ext.define('dockingpanel.view.dd.DDPanelPlugin', {

    requires: [
        'dockingpanel.view.dd.DropTarget'
    ],

    title: 'Drag & Drop ',

    panel : null,

    init: function(panel) {
        this.panel = panel;

        this.panel.on('afterrender', this.initDragDrop, this);
        this.panel.on('destroy', this.destroy, this);
    },

    destroy : function() {
        this._ddProxy.destroy();
        this._target.destroy();
    },

    initDragDrop: function() {
        var panelHeaderId = null;

        this.ddProxy = Ext.create('Ext.dd.DDProxy', this.panel.el, 'drag-panels', {
            isTarget: true
        });

        this.target = Ext.create('dockingpanel.view.dd.DropTarget', this.panel, {});

        panelHeaderId = this.getPanelHeaderId();

        if(panelHeaderId)
            this.ddProxy.setHandleElId(Ext.get(panelHeaderId));

        Ext.apply(this.ddProxy,
            {
                startDrag: function(e)
                {
                    this.target.disableTarget();
                }.bind(this),
                onDragEnter: function(e, id)
                {
                    Ext.dd.DragDropManager.getDDById(id).notifyEnter(this.panel, e.getXY()[0], e.getXY()[1]);
                }.bind(this),
                onDragOver: function(e, id)
                {
                    Ext.dd.DragDropManager.getDDById(id).notifyOver(this.panel, e.getXY()[0], e.getXY()[1]);
                }.bind(this),
                onDragOut: function(e, id)
                {
                    Ext.dd.DragDropManager.getDDById(id).notifyOut(this.panel, e.getXY()[0], e.getXY()[1]);
                }.bind(this),
                onDragDrop: function(e, id)
                {
                    var dest = Ext.dd.DragDropManager.getDDById(id);
                    if (dest.isEnabled()) {
                        dest.notifyEndDrag(this,e.getXY()[0], e.getXY()[1]);
                        this.target.enableTarget();
                        var destLoc = dest.getDestination();
                        if (destLoc !== null) {
                            Ext.getCmp(dest.id).up("dockpanel").movePanel(Ext.getCmp(this.panel.id), Ext.getCmp(dest.id), destLoc);
                        }
                    }
                }.bind(this),
                endDrag: function(e, id)
                {
                    var targets = Ext.dd.DragDropManager.getRelated(this.panel, true);

                    for(var i = 0; i < targets.length; i++) {
                        targets[i].notifyEndDrag(this.panel,  e.getXY()[0], e.getXY()[1]);
                    }

                    this.target.enableTarget();
                }.bind(this)
            }
        );
    },

    getPanelHeaderId : function() {
        if(this.panel.down("tabbar"))
            return this.panel.down("tabbar").id;

        if(this.panel.header)
            return this.panel.header.id;

        return false;
    }
});

