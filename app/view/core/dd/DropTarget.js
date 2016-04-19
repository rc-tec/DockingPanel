Ext.define('dockingpanel.view.core.dd.DropTarget', {
    extend: 'Ext.dd.DDTarget',
    
    requires: [
        'Ext.util.Point',
        'Ext.util.Region'
    ],
    
    constructor: function(targetCt, config) {
        this._targetCt = targetCt;
        this._el = targetCt.el;
        this.callParent([this._el.id, 'drag-panels', config]);
        
        //create proxy elements
        this._elProxy = this._el.createProxy({tag:'div', cls:'x-target-splitbox'}, Ext.getBody());
        this._posProxy = this._el.createProxy({tag:'div', cls:'x-target-highlighter'}, Ext.getBody());
        this._splitBox = {};
        this._destination = null;
    },
    
    destroy: function() {
        this._elProxy.destroy();
        this._posProxy.destroy();
        this.callParent(arguments);
    },
    
    _targetEnabled: true,
    _locked: false,
    
    /**
     * Disables this as drop target
     */
    disableTarget: function() {
        if (this._locked) {
            return false;
        }
        this._targetEnabled = false;
        return true;
    },
    
    /**
     * Return the target container
     * @return {Ext.panel.Panel}
     */
    getTargetCt: function() {
        return this._targetCt;
    },
    
    lockTarget: function() {
        this._locked = true;
    },
    
    unlockTarget: function() {
        this._locked = false;
    },
    
    /**
     * Return true if this target drop is active
     * @return {boolean}
     */
    isEnabled: function() {
        return this._targetEnabled;
    },
    
    /**
     * Enables this as drop target
     */
    enableTarget: function() {
        if (this._locked) {
            return false;
        }
        this._targetEnabled = true;
        return true;
    },
    
    /**
     * Return the destination location in the target container. could be:
     *  - null
     *  - left
     *  - top
     *  - bottom
     *  - right
     * @return {String}
     */
    getDestination: function() {
        return this._destination;
    },
    
    notifyEnter: function(dd, x, y) {
        if (this._targetEnabled) { 
            //console.log('enter on:' + this._targetCt.id);
            var elPos = this._el.getBox();
	        this._elProxy.setLocalXY(elPos.x + (elPos.width/2) - 55, elPos.y + (elPos.height/2) - 55);
	        this._splitBox.x = elPos.x + (elPos.width/2) - 55;
	        this._splitBox.y = elPos.y + (elPos.height/2) - 55;
	        this._splitBox.top = Ext.create('Ext.util.Region', this._splitBox.y+3, this._splitBox.x+71, this._splitBox.y+35, this._splitBox.x+39);
	        this._splitBox.left = Ext.create('Ext.util.Region', this._splitBox.y+39, this._splitBox.x+35, this._splitBox.y+71, this._splitBox.x+3);
	        this._splitBox.bottom = Ext.create('Ext.util.Region', this._splitBox.y+75, this._splitBox.x+71, this._splitBox.y+107, this._splitBox.x+39);
	        this._splitBox.right = Ext.create('Ext.util.Region', this._splitBox.y+39, this._splitBox.x+107, this._splitBox.y+71, this._splitBox.x+75);
	        //this._splitBox.tab = Ext.create('Ext.util.Region', this._splitBox.y+39, this._splitBox.x+71, this._splitBox.y+71, this._splitBox.x+39);
	        this._elProxy.show();    
        }
    },
    notifyOver: function(dd, x, y) {
        //top
        if (this._targetEnabled) {
            var p = Ext.create('Ext.util.Point', x, y);
	        var elPos = this._el.getBox();
	        if (this._splitBox.top.contains(p)) {
                this._destination = 'top';
	            this._posProxy.setBounds(elPos.x, elPos.y, elPos.width, elPos.height/2);
	            this._posProxy.show();
	        } else if (this._splitBox.left.contains(p)) {
                this._destination = 'left';
	            this._posProxy.setBounds(elPos.x, elPos.y, elPos.width/2, elPos.height);
	            this._posProxy.show();
	        } else if (this._splitBox.bottom.contains(p)) {
                this._destination = 'bottom';
	            this._posProxy.setBounds(elPos.x, elPos.y + (elPos.height/2), elPos.width, elPos.height/2);
	            this._posProxy.show();
	        } else if (this._splitBox.right.contains(p)) {
                this._destination = 'right';
	            this._posProxy.setBounds(elPos.x + (elPos.width/2), elPos.y, elPos.width/2, elPos.height);
	            this._posProxy.show();
	        } /*else if (this._splitBox.tab.contains(p)) {
                this._destination = 'center';
	            this._posProxy.setBounds(elPos.x, elPos.y, elPos.width, elPos.height);
	            this._posProxy.show();
	        } */else {
                this._destination = null;
	            this._posProxy.hide();
	        }
        }
    },
    notifyOut: function(dd, x, y) {
        if (this._targetEnabled) {
            this._elProxy.hide();    
        }
    },
    notifyEndDrag : function(dd, x, y){
        if (this._targetEnabled) {
	        this._posProxy.hide();
	        this._elProxy.hide();
        }
    }
});