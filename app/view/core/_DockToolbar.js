Ext.define('dockingpanel.view.core.DockToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    
    initComponent: function() {
        this.callParent(arguments);
        //init dd
        this.on('afterrender', this._initDD, this);
        this._currentButton = null;
    },
    
    _targetEnabled: true,
    
    alias: 'widget.docktoolbar',
    height: 35,
    id : 'dockToolbar',
    vertical : false,
    
    defaults : {
        cls: 'x-docktoolbar-button'
    },
    
    addPanel: function(pan) {
        var title = pan.title;
        this.add({
            iconCls: 'x-app',
            text: title,
            tooltip: title,
            ref : pan.initialConfig
        });
    },
    
    addObject : function(obj)
    {
        var title = obj.title;
        this.add({
            text: title,
            tooltip: title,
            ref : obj
        });
    },
    
    _initDD: function() {
        var proxy = Ext.create('Ext.dd.DDProxy', this.el, 'drag-panels', {
            isTarget: false
        });
        
        var target = Ext.create('Ext.dd.DDTarget', this.el.id, 'drag-panels');
        
        this._posProxy = this.el.createProxy({tag:'div', cls:'x-target-highlighter', style: 'z-index:10'}, Ext.getBody());
        var me = this;
        
        Ext.apply(target, {
            isEnabled: function() {
                return me._targetEnabled;
            },
            disableTarget: function() {
		        me._targetEnabled = false;
		        return true;
		    },
            enableTarget: function() {
                me._targetEnabled = true;
                return true;
            },
            getTargetCt: function() {
                return me;
            },
            getDestination: function() {
                return 'toolbar';
            },
            notifyEnter: function(dd, x, y) {
		        if (me._targetEnabled) {
		            var elPos = me.el.getBox();
                    me._posProxy.setBox(elPos);
                    me._posProxy.setLeftTop(elPos.x, elPos.y);
		            me._posProxy.show();    
		        }
		    },
            notifyOver: Ext.emptyFn,
		    notifyOut: function(dd, x, y) {
		        if (me._targetEnabled) {
		            me._posProxy.hide();    
		        }
		    },
		    notifyEndDrag : function(dd, x, y){
		        if (me._targetEnabled) {
		            me._posProxy.hide();
		        }
		    }
        });
        
            
        Ext.apply(proxy, {
            _resizeProxy: function() {
                if (this.resizeFrame) {
                    Ext.fly(this.getDragEl()).setSize(500, 200);
                }
            },
            startDrag: function(x, y) {
                target.disableTarget();
                //search button
                var len = me.items.getCount();
                var p = Ext.create('Ext.util.Point', x, y);
                for(var i = 0; i < len; i++) {
                    if (me.getComponent(i).getEl().getRegion().contains(p)) {
                        me._currentButton = me.getComponent(i)
                        break;
                    }
                }
            },
            onDragEnter: function(e, drop) {
                Ext.dd.DragDropMgr.getDDById(drop).notifyEnter(this, e.getXY()[0], e.getXY()[1]);
            },
            onDragOut: function(e, drop) {
                Ext.dd.DragDropMgr.getDDById(drop).notifyOut(this, e.getXY()[0], e.getXY()[1]);
            },
            onDragOver: function(e, drop) {
                Ext.dd.DragDropMgr.getDDById(drop).notifyOver(this, e.getXY()[0], e.getXY()[1]);
            },
            onDragDrop: function(e ,drop) {
                //TODO: this code is copied from Drop Target, please refactor it...
                var dest = Ext.dd.DragDropMgr.getDDById(drop);
                if (dest.isEnabled()) {
                    dest.notifyEndDrag(this,e.getXY()[0], e.getXY()[1]);
                    target.enableTarget();
                    var destLoc = dest.getDestination();
                    if (destLoc !== null) {
                        me.fireEvent('createPanelInstance', dest.getTargetCt(), destLoc, me._currentButton);
                        /*var addCt = Ext.create('Ext.panel.Panel', {
				            layout: 'fit',
				            html: 'This is the content of modul :' + that._currentButton.tooltip,
				            title: that._currentButton.tooltip,
				            plugins: [Ext.create('JTec.dock4.dd.DragPanelPlugin', that.dockPanel)]
				        });
                        that.dockPanel._addPanel(dest.getTargetCt(), addCt, destLoc);*/
                        me.remove(me._currentButton);
                        me._currentButton.destroy();
                        me._currentButton = null;
                    }
                }
            },
            endDrag: function(e) {
                var targets = Ext.dd.DragDropMgr.getRelated(this, true);
                for(var i=0;i<targets.length;i++) {
                    targets[i].notifyEndDrag(this,e.getXY()[0], e.getXY()[1]);
                }
            }
        });
        proxy.setHandleElId(me.id);
        proxy.addInvalidHandleClass('x-box-inner');
    }
});
    