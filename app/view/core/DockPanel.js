Ext.define('dockingpanel.view.core.DockPanel', {
    extend: 'Ext.container.Container',
    layout: 'fit',
    
    alias : 'widget.dockpanel_old',
    
    
    requires: [
        'Ext.resizer.Splitter',
        'dockingpanel.view.core.DockPanelManager',
        'dockingpanel.view.core.dd.DragPanelPlugin',
        'Ext.dd.DragDropManager'
    ],
    
    //parent storage
    _baseInsertRefCnt: null,
    _lastInsertRefPanel: null,
    _firstAdd: false,
    _dockPanelHash: null,
    
    _placeHolder: null,
    placeHolderHtml: 'no Panel loaded',
    
    _layoutSilence: false,
    
    constructor: function(cfg) {
        if (cfg.placeHolderHtml !== undefined) {
            this.placeHolderHtml = cfg.placeHolderHtml;
        }
        this.callParent(arguments);
        //this.addEvents('layoutchanged');
        //set this because of ExtJS 4.2.0 dragOut flattering
        Ext.dd.DragDropManager.notifyOccluded = true;
        //<debug>
        globalDock = this;
        //</debug>
    },
    
    initComponent: function(){
        //TODO: specify dockData (width, height)
        this.items = {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        };
        this.callParent(arguments);
        this._dockPanelHash = dockingpanel.view.core.DockPanelManager.generateInstanceId(this);
        this.initPanelRefs();   
    },
    
    initPanelRefs: function() {    
        this._baseInsertRefCnt = this.getComponent(0);
        //add temporary container
        this._placeHolder = this._baseInsertRefCnt.add({
            xtype: 'container',
            layout: 'fit',
            flex: 1,
            html: this.placeHolderHtml
        });
        this._firstAdd = false;
    },
    
    _clearPlaceholder: function() {
        if (this._placeHolder !== null) {
            this._baseInsertRefCnt.remove(this._placeHolder, true);
            this._placeHolder = null;
        }
    },
    
    getLayoutJson: function() {
        var _recRead = function(cmp) {
            //<debug>
            console.log('recRead');
            console.log(cmp.xtype);
            //</debug>
            var obj = {};
            obj.xtype = cmp.xtype;
            obj.flex = cmp.flex;
            
            if(cmp.itemId)
                obj.itemId = cmp.getItemId();
                
            if(cmp.module)
            {
                obj.module = {};
                obj.module.Description = cmp.module.Description;
                obj.module.Title = cmp.module.Title;
                obj.module.ModuleId = cmp.module.ModuleId;
                obj.module.ModuleTypeId = cmp.module.ModuleTypeId;
            }
                
            
            if (obj.xtype === 'container') {
                //<debug>
                console.log(cmp.layout.type);
                //</debug>
                obj.layout = cmp.layout.type;
                obj.items = [];
                for(var i = 0; i < cmp.items.getCount(); i++) {
	                obj.items.push(_recRead(cmp.getComponent(i)));
	            }
            }
            return obj;
        };
        var res = _recRead(this.getComponent(0));
        return JSON.stringify(res);
    },

    /**
     * Loads a Json layout configuration
     */
    loadLayoutJson: function(data, initPanelCb, initPanelCbScope) {
        var hash = this._dockPanelHash;
        if (initPanelCbScope === undefined) {
            initPanelCbScope = this;
        }
        var _recLoad = function(data) {
            var obj = {};
            obj.xtype = data.xtype;
            
            if(data.module)
                obj.module = data.module;
            
            if(data.itemId)
                obj.itemId = data.itemId;
            
            if (data.flex !== undefined) {
                obj.flex = data.flex;    
            }
            if (obj.xtype === 'container') {
                //do more
                obj.layout = {
                    type: data.layout,
                    align: 'stretch'
                };
                obj.items = [];
                for(var i = 0; i < data.items.length; i++) {
                    obj.items.push(_recLoad(data.items[i]));
                }
                
                if(data.itemId)
                    obj.itemId = data.itemId;
            } else if (obj.xtype === 'splitter') {
                obj.autoShow = true;
            } else {
                //are real classes
                //obj.layout = 'fit';
                obj.dockPanelHash = hash;
                if (initPanelCb !== undefined) {
                    initPanelCb.call(initPanelCbScope, obj);    
                }
            }
            
            return obj;
        };
        
        var baseRef = {
            baseParent: null,
            basePanel: null
        };
        var searchBase = function(cmp) {
            if (cmp.xtype === 'container') {
                for(var i = 0; i < cmp.items.getCount(); i++) {
                    searchBase(cmp.getComponent(i));
                    if (baseRef.baseParent !== null) {
                        return;
                    }
                }
            } else if (cmp.xtype !== 'splitter') {
                //add this as base
                baseRef.baseParent = cmp.ownerCt;
                baseRef.basePanel = cmp;
            }
        };
        
        if (!this._firstAdd) {
            var cfgObj = _recLoad(data);
            this._clearPlaceholder();
            this.remove(this._baseInsertRefCnt, true);
            this.add(cfgObj);
            this._firstAdd = true;
            //search base Reference
            searchBase(this.getComponent(0));
            this._baseInsertRefCnt = baseRef.baseParent;
            this._lastInsertRefPanel = baseRef.basePanel;
        } else {
             //<debug>
            console.warn('cannot load configuration to an already created dock panel!');
            //</debug>
        }
    },
    
    getDockPanelHash: function() {
        return this._dockPanelHash;
    },
    
    /**
     * @private
     * @param {} ct
     * @param {} panel
     * @param {} destroy
     */
    _removeBoxPanel: function(ct, panel, destroy) 
    {
        if(destroy)
            this.fireEvent("beforePanelRemove", panel);
        
        var pos = ct.items.indexOf(panel);
        if (ct.items.getCount() > 1) {
            //remove split
            var split = null;
            
            if (pos === (ct.items.getCount()-1)) 
            {
                split = ct.getComponent(pos - 1);
            } 
            else 
            {
                split = ct.getComponent(pos + 1);
            }
            ct.remove(split, true);
        }
        ct.remove(panel, destroy);
        
        if(destroy)
            this.fireEvent("afterPanelRemove", panel);
    },
    
    /**
     * @private
     * @param {} ct
     * @param {} panel
     * @param {} loc
     * @param {} pos
     * @return {}
     */
    _addBoxPanel: function(ct, panel, loc, pos) {
        var split = {
            xtype: 'splitter',
            autoShow: true
        };
        if (pos === undefined) {
            //get last position
            if (loc === 'top' || loc === 'left') {
                pos = 0;
            } else {
                pos = ct.items.getCount() - 1;    
            }
            //<debug>
            console.log('calculate box Position: %o', pos);
            //</debug>
        } else {
            //<debug>
            console.log('set to box position: %o', pos);
            //</debug>
        }
        //TODO: recalculate size
        var splitBase = ct.getComponent(pos);
        var newSize = 0, bSize = 0;
        var inserted = null;
        switch(loc) {
            case 'left':
                bSize = splitBase.getWidth();
                newSize = Math.floor(bSize/2) - 5;
                //splitBase.setWidth(newSize);
                splitBase.flex = newSize;
                //panel.width = bSize - 5 - newSize;
                panel.flex = bSize - 5 - newSize;
                ct.insert(pos, split);
                inserted = ct.insert(pos, panel);
                break;
            case 'right':
                bSize = splitBase.getWidth();
                newSize = Math.floor(bSize/2) - 5;
                //splitBase.setWidth(newSize);
                splitBase.flex = newSize;
                //panel.width = bSize - 5 - newSize;
                panel.flex = bSize - 5 - newSize;
                inserted = ct.insert(pos+1, panel);
                ct.insert(pos+1, split);
                break;
            case 'top':
                bSize = splitBase.getHeight();
                newSize = Math.floor(bSize/2) - 5;
                //splitBase.setHeight(newSize);
                splitBase.flex = newSize;
                //panel.height = bSize - 5 - newSize;
                panel.flex = bSize - 5 - newSize;
                ct.insert(pos, split);
                inserted = ct.insert(pos, panel);
                break;
            case 'bottom':
                bSize = splitBase.getHeight();
                newSize = Math.floor(bSize/2) - 5;
                //splitBase.setHeight(newSize);
                splitBase.flex = newSize;
                //panel.height = bSize - 5 - newSize;
                panel.flex = bSize - 5 - newSize;
                inserted = ct.insert(pos+1, panel);
                ct.insert(pos+1, split);
                break;
        }
        return inserted;
    },
    
    /**
     * @private
     * @param {} parent
     * @param {} ct
     * @param {} loc
     * @return {}
     */
    _convertContainer: function(parent, ct, loc) {
        console.log('_convertContainer');
        console.log('Parent: %o, Ct: %o, layout: %o', parent,ct,loc);
        var newCont = null;
        switch(loc) {
            case 'top':
            case 'bottom':
                newCont = {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    }
                };
                break;
            case 'left':
            case 'right':
                newCont = {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    }
                };
                break;
            case 'center':
                //<debug>
                console.log('convert to tab not Implemented yet');
                //</debug>
                break;
        }
        var sizeInfo = ct.getSize();
        var oldPos = parent.items.indexOf(ct);
        parent.remove(ct, false);
        switch(parent.layout.type) {
            case 'hbox':
                //newCont.width = sizeInfo.width;
                newCont.flex = ct.flex;
                break;
            case 'vbox':
                //newCont.height = sizeInfo.height;
                newCont.flex = ct.flex;
                break;
            case 'tab':
                //<debug>
                console.warn('That case could not be happen: convert parent tab layout!');
                //</debug>
                break;
        }
        var newInst = parent.insert(oldPos, newCont);
        ct.flex = 1;
        newInst.add(ct);
        return newInst;
    },
    
    /**
     * @private
     * @param {} panel
     * @param {} loc
     */
    _addPanel: function(panel, loc, refObj) {
        var refLayout = refObj.baseParent.layout.type;
        //<debug>
        console.log('_addPanel');
        console.log('refLayout: %o', refLayout);
        //</debug>
        var pos = refObj.baseParent.items.indexOf(refObj.basePanel);
        if (refLayout === 'hbox') {
            //current layout is hbox
            //calculate position
            if (loc === 'left' || loc === 'right') {
                //just simply insert the new panel
                refObj.basePanel = this._addBoxPanel(refObj.baseParent, panel, loc, pos);
            } else {
                //convert layout
                refObj.baseParent = this._convertContainer(refObj.baseParent, refObj.basePanel, loc);
                pos = refObj.baseParent.items.indexOf(refObj.basePanel);
                if (loc === 'center') {
                    //<debug>
	                console.log('insert center not implemented yet');
	                //</debug>    
                } else {
                    refObj.basePanel = this._addBoxPanel(refObj.baseParent, panel, loc, pos);    
                }   
            }
        } else if (refLayout === 'vbox') {
            //curent layout is vbox
            if (loc === 'top' || loc === 'bottom') {
                //just simply insert the new panel
                refObj.basePanel = this._addBoxPanel(refObj.baseParent, panel, loc, pos);
            } else {
                //convert layout
                refObj.baseParent = this._convertContainer(refObj.baseParent, refObj.basePanel, loc);
                pos = refObj.baseParent.items.indexOf(refObj.basePanel);
                if (loc === 'center') {
                    //<debug>
                    console.log('insert center not implemented yet');
                    //</debug>    
                } else {
                    refObj.basePanel = this._addBoxPanel(refObj.baseParent, panel, loc, pos);    
                }
            }
        } else {
            //must be card
            //<debug>
		    console.log('not Implemented yet');
		    //</debug>
        }
    },
    
    /**
     * @public
     * @param {} panel
     * @param {} destroy
     */
    removePanel: function(panel, destroy) {
        if (destroy === undefined) {
            destroy = true;
        }
        var parentCt = panel.ownerCt;
        panel.un('destroy', this._panelDestroyHandler, this);
        if (parentCt.layout.type === 'hbox' || parentCt.layout.type === 'vbox') {
            this._removeBoxPanel(parentCt, panel, destroy);
        } else {
            //<debug>
            console.log('not Implemented yet');
            //</debug>
        }
        if (parentCt.items.getCount() === 1) {
            var recycle = parentCt.getComponent(0);
            var newParent = parentCt.ownerCt;
            var newPos = newParent.items.indexOf(parentCt);
            if (newParent !== this) {
	            //<debug>
	            console.log('Redefine with newParent: %o, newPos: %o', newParent, newPos);
	            //</debug>
	            parentCt.remove(recycle, false);
	            newParent.remove(parentCt, true);
	            newParent.insert(newPos, recycle);
            }
        } else if (parentCt.items.getCount() === 0) {
            //<debug>
            console.log('Add empty page');
            //</debug>
            this.initPanelRefs();
        }
        this.fireLayoutEvent();
    },
    
    /**
     * @public
     * @param {} destinationPanel
     * @param {} panel
     * @param {} loc
     */
    movePanel: function(destinationPanel, panel, loc) {
        if (loc === 'center') {
            //<debug>
            console.warn('tab position not Implemented yet');
            //</debug>
            return;
        }
        this._layoutSilence = true;
        this.removePanel(panel, false);
        this._layoutSilence = false;
        this._addPanel(panel, loc, {
            baseParent: destinationPanel.ownerCt,
            basePanel: destinationPanel
        });
        this.fireLayoutEvent();
    },
    
    fireLayoutEvent: function() {
        if (!this._layoutSilence) {
            this.fireEvent('layoutchanged');    
        }
    },
    
    _panelDestroyHandler: function() {
        console.log('destroy must be implemented');
    },
    
    removeAll: function() {
        this.getComponent(0).removeAll(true);
        this.initPanelRefs();
    },
    
    addPanelTo: function(panel, destinationPanel, loc) {
        this._clearPlaceholder();
        if (!this._firstAdd) {
            //<debug>
            console.warn('Not implemented yet');
            //</debug>
        } else {
            var ref = {
                baseParent: destinationPanel.ownerCt,
                basePanel: destinationPanel
            };
            this._addPanel(panel, loc, ref);
            ref.basePanel.on('destroy', this._panelDestroyHandler, this);
        }
    },
    
    /**
     * Add a new panel to the specifed location
     * @public
     * @param {} panel
     * @param {} loc
     */
    addPanel: function(panel, loc) {
        this._clearPlaceholder();
        //TODO: modify this for add to dock panel
        if (!this._firstAdd) {
            //first insert
            panel.flex = 1;
            this._lastInsertRefPanel = this._baseInsertRefCnt.add(panel);
            this._firstAdd = true;
        } else {
            if (loc === 'center') {
	            //<debug>
	            console.warn('tab position not Implemented yet');
	            //</debug>
	            return;
	        }
            //add as hbox
            var ref = {
                baseParent: this._baseInsertRefCnt,
                basePanel: this._lastInsertRefPanel
            };
            this._addPanel(panel, loc, ref);
            this._baseInsertRefCnt = ref.baseParent;
            this._lastInsertRefPanel = ref.basePanel;
        }
        //attach destroy listener
        this._lastInsertRefPanel.on('destroy', this._panelDestroyHandler, this);
        this.fireLayoutEvent();
    }
});