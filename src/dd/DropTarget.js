Ext.define('DockingPanel.dd.DropTarget', {
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

        this._posProxy = this._el.createProxy({tag: 'div', cls: 'x-target-highlighter'}, this._el);

        this._regionProxyNorth = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-north'}, this._el);
        this._regionProxyWest = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-west'}, this._el);
        this._regionProxyEast = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-east'}, this._el);
        this._regionProxySouth = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-south'}, this._el);

        this._splitBoxProxyBackground = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-bg'}, this._el);
        this._splitBoxProxyTop = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-top'}, this._el);
        this._splitBoxProxyLeft = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-left'}, this._el);
        this._splitBoxProxyRight = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-right'}, this._el);
        this._splitBoxProxyBottom = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-bottom'}, this._el);
        this._splitBoxProxyCenter = this._el.createProxy({tag: 'div', cls: 'x-target-splitbox-center'}, this._el);

        this._splitBoxNorth = false;
        this._splitBoxSouth = false;
        this._splitBoxEast = false;
        this._splitBoxWest = false;
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

    getPositionForRegionProxy : function(region, targetBox, offset) {
        var posX = 0,
            posY = 0,
            proxyOffset = 50,
            baseX = targetBox.x,
            baseY = targetBox.y;

        //Top and north are always centerd ON x
        if(region === "south" || region == "north") {
            posX = (targetBox.width / 2) - 16;
        }

        //East and west are always centered on y
        if(region === "east" || region == "west") {
            posY = (targetBox.height / 2) - 16 + (offset / 2);
        }

        if(region === "south") {
            posY = targetBox.height - proxyOffset;
        }
        else if(region === "north") {
            posY = proxyOffset;
        }
        else if(region === "east") {
            posX = targetBox.width - proxyOffset;
        }
        else if(region === "west") {
            posX = proxyOffset;
        }

        return {
            x : posX,
            y : posY,
            region : Ext.create('Ext.util.Region', baseY + posY, baseX + posX + 32, baseY + posY + 32, baseX + posX)
        };
    },

    notifyEnter: function (id, x, y) {
        if (!this._targetEnabled)
            return;

        var elPos = this._el.getBox(),
            elClass = Ext.getCmp(this._el.id),
            headerHeight = 0,
            splitBoxX, splitBoxY,
            isTabPanel = elClass.up("droptabpanel") ? true : false;
        
        if(this._targetCt.header)
            headerHeight = this._targetCt.header.getHeight();

        splitBoxX = (elPos.width / 2) - 55;
        splitBoxY = ((elPos.height / 2) - 55) + (headerHeight / 2);

        this._splitBoxProxyBackground.setLocalXY(splitBoxX, splitBoxY);
        this._splitBoxProxyTop.setLocalXY(splitBoxX + 39, splitBoxY + 3);
        this._splitBoxProxyRight.setLocalXY(splitBoxX + 75, splitBoxY + 39);
        this._splitBoxProxyBottom.setLocalXY(splitBoxX + 39, splitBoxY + 75);
        this._splitBoxProxyLeft.setLocalXY(splitBoxX + 3, splitBoxY + 39);
        this._splitBoxProxyCenter.setLocalXY(splitBoxX + 39, splitBoxY + 39);

        if(elClass.getDockingPanel().supportsDock("top")) {
            this._splitBoxProxyTop.removeCls("inactive");
        }
        else {
            this._splitBoxProxyTop.addCls("inactive");
        }

        if(elClass.getDockingPanel().supportsDock("right")) {
            this._splitBoxProxyRight.removeCls("inactive");
        }
        else {
            this._splitBoxProxyRight.addCls("inactive");
        }

        if(elClass.getDockingPanel().supportsDock("bottom")) {
            this._splitBoxProxyBottom.removeCls("inactive");
        }
        else {
            this._splitBoxProxyBottom.addCls("inactive");
        }

        if(elClass.getDockingPanel().supportsDock("left")) {
            this._splitBoxProxyLeft.removeCls("inactive");
        }
        else {
            this._splitBoxProxyLeft.addCls("inactive");
        }

        if(elClass.getDockingPanel().supportsDock("center")) {
            this._splitBoxProxyCenter.removeCls("inactive");
        }
        else {
            this._splitBoxProxyCenter.addCls("inactive");
        }

        this._splitBox.x = elPos.x + splitBoxX;
        this._splitBox.y = elPos.y + splitBoxY;
        this._splitBox.top = Ext.create('Ext.util.Region', this._splitBox.y + 3, this._splitBox.x + 71, this._splitBox.y + 35, this._splitBox.x + 39);
        this._splitBox.left = Ext.create('Ext.util.Region', this._splitBox.y + 39, this._splitBox.x + 35, this._splitBox.y + 71, this._splitBox.x + 3);
        this._splitBox.bottom = Ext.create('Ext.util.Region', this._splitBox.y + 75, this._splitBox.x + 71, this._splitBox.y + 107, this._splitBox.x + 39);
        this._splitBox.right = Ext.create('Ext.util.Region', this._splitBox.y + 39, this._splitBox.x + 107, this._splitBox.y + 71, this._splitBox.x + 75);
        this._splitBox.center = Ext.create('Ext.util.Region', this._splitBox.y + 35, this._splitBox.x + 75, this._splitBox.y + 75, this._splitBox.x + 35);

        if(elClass.getDockingPanel().supportsRegion("north")) {
            this._splitBoxNorth = this.getPositionForRegionProxy("north", elPos, headerHeight);

            this._regionProxyNorth.setLocalXY(this._splitBoxNorth.x, this._splitBoxNorth.y);
            this._regionProxyNorth.show();
        }
        else {
            this._splitBoxNorth = false;
        }

        if(elClass.getDockingPanel().supportsRegion("east")) {
            this._splitBoxEast = this.getPositionForRegionProxy("east", elPos, headerHeight);

            this._regionProxyEast.setLocalXY(this._splitBoxEast.x, this._splitBoxEast.y);
            this._regionProxyEast.show();
        }
        else {
            this._splitBoxEast = false;
        }

        if(elClass.getDockingPanel().supportsRegion("west")) {
            this._splitBoxWest = this.getPositionForRegionProxy("west", elPos, headerHeight);

            this._regionProxyWest.setLocalXY(this._splitBoxWest.x, this._splitBoxWest.y);
            this._regionProxyWest.show();
        }
        else {
            this._splitBoxWest = false;
        }

        if(elClass.getDockingPanel().supportsRegion("south")) {
            this._splitBoxSouth = this.getPositionForRegionProxy("south", elPos, headerHeight);

            this._regionProxySouth.setLocalXY(this._splitBoxSouth.x, this._splitBoxSouth.y);
            this._regionProxySouth.show();
        }
        else {
            this._splitBoxSouth = false;
        }

        this._splitBoxProxyBackground.show();
        this._splitBoxProxyTop.show();
        this._splitBoxProxyRight.show();
        this._splitBoxProxyBottom.show();
        this._splitBoxProxyLeft.show();
        this._splitBoxProxyCenter.show();
    },

    notifyOver: function (id, target_x, target_y) {
        if (!this._targetEnabled)
            return;

        var elClass = Ext.getCmp(this._el.id),
            headerHeight = 0,
            elPos = this._el.getBox(),
            p= Ext.create('Ext.util.Point', target_x, target_y - (headerHeight / 2)),
            box = {},
            isTabPanel = elClass.up("droptabpanel");

        if(this._targetCt.header)
            headerHeight = this._targetCt.header.getHeight();

        //Check for Left/Top/Right/Bottom/Tab
        if (elClass.getDockingPanel().supportsDock("top") && this._splitBox.top.contains(p))
        {
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
        else if (elClass.getDockingPanel().supportsDock("left") && this._splitBox.left.contains(p))
        {
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
        else if (elClass.getDockingPanel().supportsDock("bottom") && this._splitBox.bottom.contains(p))
        {
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
        else if (elClass.getDockingPanel().supportsDock("right") && this._splitBox.right.contains(p))
        {
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
        else if (elClass.getDockingPanel().supportsDock("center") && this._splitBox.center.contains(p))
        {
            this._destination = 'center';
            box = {
                x: elPos.x,
                y: elPos.y,
                width: elPos.width,
                height: elPos.height
            };
            this._posProxy.setBox(box);
            this._posProxy.show();
        }
        else
        {
            //Check for North/South/East/West
            if (this._splitBoxNorth && this._splitBoxNorth.region.contains(p))
            {
                this._destination = 'north';

                box = {
                    x: elPos.x,
                    y: elPos.y,
                    width: elPos.width,
                    height: elPos.height / 3
                };

                this._posProxy.setBox(box);
                this._posProxy.show();
            }
            else if (this._splitBoxSouth && this._splitBoxSouth.region.contains(p))
            {
                this._destination = 'south';

                box = {
                    x: elPos.x,
                    y: elPos.y + (elPos.height / 3) * 2,
                    width: elPos.width,
                    height: elPos.height / 3
                };

                this._posProxy.setBox(box);
                this._posProxy.show();
            }
            else if (this._splitBoxWest && this._splitBoxWest.region.contains(p))
            {
                this._destination = 'west';

                box = {
                    x: elPos.x,
                    y: elPos.y,
                    width: elPos.width / 3,
                    height: elPos.height
                };

                this._posProxy.setBox(box);
                this._posProxy.show();
            }
            else if (this._splitBoxEast && this._splitBoxEast.region.contains(p))
            {
                this._destination = 'east';

                box = {
                    x: elPos.x + (elPos.width / 3) * 2,
                    y: elPos.y,
                    width: elPos.width / 3,
                    height: elPos.height
                };

                this._posProxy.setBox(box);
                this._posProxy.show();
            }
            else
            {
                this._destination = null;
                this._posProxy.hide();
            }
        }
    },

    notifyOut: function (dd, x, y) {
        if (this._targetEnabled) {
            this._splitBoxProxyBackground.hide();
            this._splitBoxProxyTop.hide();
            this._splitBoxProxyRight.hide();
            this._splitBoxProxyBottom.hide();
            this._splitBoxProxyLeft.hide();
            this._splitBoxProxyCenter.hide();
            this._regionProxyNorth.hide();
            this._regionProxySouth.hide();
            this._regionProxyEast.hide();
            this._regionProxyWest.hide();
        }
    },

    notifyEndDrag: function (dd, x, y) {
        if (this._targetEnabled) {
            this._posProxy.hide();
            this._splitBoxProxyBackground.hide();
            this._splitBoxProxyTop.hide();
            this._splitBoxProxyRight.hide();
            this._splitBoxProxyBottom.hide();
            this._splitBoxProxyLeft.hide();
            this._splitBoxProxyCenter.hide();
            this._regionProxyNorth.hide();
            this._regionProxySouth.hide();
            this._regionProxyEast.hide();
            this._regionProxyWest.hide();
        }
    }
});