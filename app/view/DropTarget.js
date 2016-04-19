Ext.define('dockingpanel.view.DropTarget', {
    extend: 'Ext.dd.DDTarget',

    requires: [
        'Ext.util.Point',
        'Ext.util.Region'
    ],


    _locked: false,
    _targetEnabled: true,
    _destination: null,

    constructor: function (targetCt, config) {
        this._targetCt = targetCt;
        this._el = targetCt.el;
        this._splitBox = {};

        this.callParent([this._el.id, 'drag-panels', config]);

        this._elProxy = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox'}, this._el);
        this._posProxy = this._el.createProxy({tag: 'div', cls: 'x-target-highlighter'}, this._el);

    },

    destroy: function () {
        this._posProxy.destroy();

        this.callParent(arguments);
    },

    disableTarget: function () {
        if (this._locked) {
            return false;
        }

        this._targetEnabled = false;
        return true;
    },

    getTargetCt: function () {
        return this._targetCt;
    },

    lockTarget: function () {
        this._locked = true;
    },

    unlockTarget: function () {
        this._locked = false;
    },

    isEnabled: function () {
        return this._targetEnabled;
    },

    enableTarget: function () {
        if (this._locked) {
            return false;
        }

        this._targetEnabled = true;

        return true;
    },

    getDestination: function () {
        return this._destination;
    },

    notifyEnter: function (id, x, y) {
        if (!this._targetEnabled)
            return;

        var elPos = this._el.getBox();

        var elClass = Ext.getCmp(this._el.id);

        if (elClass.up("docktabpanel")) {
            this._elProxy.addCls("center");
        } else {
            this._elProxy.removeCls("center");
        }

        var headerHeight = this._targetCt.header.getHeight();

        this._elProxy.setLocalXY((elPos.width / 2) - 55, ((elPos.height / 2) - 55) + (headerHeight / 2));
        this._splitBox.x = elPos.x + (elPos.width / 2) - 55;
        this._splitBox.y = elPos.y + (elPos.height / 2) - 55;
        this._splitBox.top = Ext.create('Ext.util.Region', this._splitBox.y + 3, this._splitBox.x + 71, this._splitBox.y + 35, this._splitBox.x + 39);
        this._splitBox.left = Ext.create('Ext.util.Region', this._splitBox.y + 39, this._splitBox.x + 35, this._splitBox.y + 71, this._splitBox.x + 3);
        this._splitBox.bottom = Ext.create('Ext.util.Region', this._splitBox.y + 75, this._splitBox.x + 71, this._splitBox.y + 107, this._splitBox.x + 39);
        this._splitBox.right = Ext.create('Ext.util.Region', this._splitBox.y + 39, this._splitBox.x + 107, this._splitBox.y + 71, this._splitBox.x + 75);

        this._splitBox.center = Ext.create('Ext.util.Region', this._splitBox.y + 35, this._splitBox.x + 75, this._splitBox.y + 75, this._splitBox.x + 35);

        this._elProxy.show();
    },

    notifyOver: function (id, target_x, target_y) {
        if (!this._targetEnabled)
            return;

        var headerHeight = this._targetCt.header.getHeight();
        var elPos = this._el.getBox(); //Ext.get(Ext.fly(id)).getBox();
        var p = Ext.create('Ext.util.Point', target_x, target_y - (headerHeight / 2));
        var box = {};

        if (this._splitBox.top.contains(p)) {
            if (!this._elProxy.hasCls('center')) {
                this._destination = 'top';
                box = {
                    x: elPos.x,
                    y: elPos.y,
                    width: elPos.width,
                    height: (elPos.height / 2) + (headerHeight / 2)
                };
                this._posProxy.setBox(box);
                this._posProxy.show();
            }
        } else if (this._splitBox.left.contains(p)) {
            if (!this._elProxy.hasCls('center')) {
                this._destination = 'left';
                box = {
                    x: elPos.x,
                    y: elPos.y,
                    width: elPos.width / 2,
                    height: elPos.height
                };
                this._posProxy.setBox(box);
                this._posProxy.show();
            }
        } else if (this._splitBox.bottom.contains(p)) {
            if (!this._elProxy.hasCls('center')) {
                this._destination = 'bottom';
                box = {
                    x: elPos.x,
                    y: elPos.y + ((elPos.height / 2)) + (headerHeight / 2),
                    width: elPos.width,
                    height: (elPos.height / 2) - (headerHeight / 2)
                };
                this._posProxy.setBox(box);
                this._posProxy.show();
            }
        } else if (this._splitBox.right.contains(p)) {
            if (!this._elProxy.hasCls('center')) {
                this._destination = 'right';
                box = {
                    x: elPos.x + (elPos.width / 2),
                    y: elPos.y,
                    width: elPos.width / 2,
                    height: elPos.height
                };
                this._posProxy.setBox(box);
                this._posProxy.show();
            }
        } else if (this._splitBox.center.contains(p)) {
            this._destination = 'center';
            box = {
                x: elPos.x,
                y: elPos.y,
                width: elPos.width,
                height: elPos.height
            };
            this._posProxy.setBox(box);
            this._posProxy.show();
        } else {
            this._destination = null;
            this._posProxy.hide();
        }
    },

    notifyOut: function (dd, x, y) {
        if (this._targetEnabled) {
            this._elProxy.hide();
        }
    },

    notifyEndDrag: function (dd, x, y) {
        if (this._targetEnabled) {
            this._posProxy.hide();
            this._elProxy.hide();
        }
    }
});