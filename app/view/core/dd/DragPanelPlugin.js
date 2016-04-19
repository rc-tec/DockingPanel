Ext.define('dockingpanel.view.core.dd.DragPanelPlugin', {
    
    requires: [
        'dockingpanel.view.core.dd.DropTarget',
        'dockingpanel.view.core.DockPanelManager'
    ],
    
    constructor: function(cfg) {
        if (cfg === undefined) {
            cfg = {};
        }
        this._initCfg = cfg
        this._initDDdone = false;
        this._target = null;
        this._targetLocked = false;
    },
    init:function(c) {
        this._panCt = c;
        c.on('afterrender', this._initDD, this);
        c.on('destroy', this._destroy, this);
        if (this._initCfg.tabPanel === true) {
            //disable all panel listeners and lock them
            var len = c.items.getCount();
            var plg;
            for(var i = 0 ; i < len; i++) {
                plg = c.getComponent(i).getPlugin('dockingpanel.view.core.dd.DragPanelPlugin');
                plg.lockTarget();
            }
        }
    },
    
    lockTarget: function() {
        this._targetLocked = true;
        var tar = this.getTarget();
        if (tar !== null) {
            tar.disableTarget();
            tar.lockTarget();
        }
    },
    
    unlockTarget: function() {
        var tar = this.getTarget();
        if (tar !== null) {
            tar.unlockTarget();
            tar.enableTarget();
        }
        this._targetLocked = false;
    },
    
    getTarget: function() {
        return this._target;
    },
    
    pluginId: 'dockingpanel.view.core.dd.DragPanelPlugin',
    
    _destroy: function() {
        this._ddProxy.destroy();
        this._target.destroy();
    },
    
    _initDD: function() {
        if (this._initDDDone) {
            return;
        }
        this._initDDDone = true;
        this._ddProxy = Ext.create('Ext.dd.DDProxy', this._panCt.el, 'drag-panels', {
            isTarget: false
        });
        var target = Ext.create('dockingpanel.view.core.dd.DropTarget', this._panCt, {});
        //apply methods
        
        var tmpThis = this; 
        var me = this;
        
        var tmpBtn = null;
        var tabPos = -1;
        
        Ext.apply(this._ddProxy, {
            startDrag: function(x,y) {
                target.disableTarget();
                /*if (tmpThis._initCfg.tabPanel===true){
                    var len = tmpThis._panCt.tabBar.items.getCount();
                    var p = Ext.create('Ext.util.Point', x, y);
                    for(var i = 0; i < len; i++) {
                        if (tmpThis._panCt.tabBar.getComponent(i).getEl().getRegion().contains(p)) {
                            tmpBtn = tmpThis._panCt.tabBar.getComponent(i);
                            tabPos = i;
                            tmpBtn.disable();
                            break;
                        }
                    }
                }*/
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
                var dest = Ext.dd.DragDropMgr.getDDById(drop);
                if (dest.isEnabled()) {
                    dest.notifyEndDrag(this,e.getXY()[0], e.getXY()[1]);
                    target.enableTarget();
                    var destLoc = dest.getDestination();
                    if (destLoc !== null) {
                        var moveCt = me._panCt;
                        /*if (tabPos >= 0) {
                            moveCt = me._panCt.getComponent(tabPos);
                        }*/
                        
                        //special handling for toolbar drop
                        if (destLoc === 'toolbar') {
                            dest.getTargetCt().addPanel(moveCt);
                            dockingpanel.view.core.DockPanelManager.getDockPanelInstance(me._panCt.dockPanelHash).removePanel(moveCt, true);
                        } else {
                            if (dest.getTargetCt().dockPanelHash !== me._panCt.dockPanelHash) {
                                //<debug>
                                console.log('cannot move to different dock Panel instance');
                                //</debug>
                            } else {
                                dockingpanel.view.core.getDockPanelInstance(me._panCt.dockPanelHash).movePanel(dest.getTargetCt(), moveCt, destLoc);
                            }
                        }
                    }
                }
            },
            endDrag: function(e) {
                //dragging done
                var targets = Ext.dd.DragDropMgr.getRelated(this, true);
		        for(var i=0;i<targets.length;i++) {
		            targets[i].notifyEndDrag(this,e.getXY()[0], e.getXY()[1]);
		        }
                /*if ((tmpBtn !== null) && (!tmpThis._panCt.isDestroyed) && (tmpBtn.el !== undefined) && (tmpBtn.el.dom !== undefined)) {
                    tmpBtn.enable();
                }*/
                target.enableTarget();
            },
            scope: this
        });
        
        this._target = target;
        
        //check if the parent container is a tab, deactiavete the target
        /*if (this._panCt.ownerCt.layout.type === 'card') {
            this.lockTarget();
        }*/
        
        //if (this._initCfg.tabPanel !== true) {
	        if (this._panCt.header !== undefined) {
	            this._ddProxy.setHandleElId(this._panCt.header.id);    
	        }
        /*} else {
            this._ddProxy.setHandleElId(this._panCt.tabBar.id);
            this._ddProxy.addInvalidHandleClass('x-box-inner');
        }*/
    }
});