Ext.define('dockingpanel.view.core.DockPanelManager', {
    singleton: true,
    
    constructor: function() {
        console.log('instante');
    },
    
    _hashMap: {},
    
    generateInstanceId: function(dockPanel) {
        var h = Ext.id();
        if (this._hashMap[h] !== undefined) {
            throw new Error("hash ID already exists");
        }
        this._hashMap[h] = dockPanel;
        return h;
    },
    
    getDockPanelInstance: function(h) {
        if (this._hashMap[h] === undefined) {
            //<debug>
            console.log('No dockpanel exists for hash ' + h);
            //</debug>
            return null;
        }
        return this._hashMap[h];
    }
});