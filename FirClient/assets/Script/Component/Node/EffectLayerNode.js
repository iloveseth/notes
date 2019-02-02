const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,
    ctor: function () {
        this.leftCloudCloseAction = null;
        this.rightCloudCloseAction = null;
        this.leftCloudOpenAction = null;
        this.rightCloudOpenAction = null;
    },
    properties: {
        node_mask: { default: null, type: cc.Node },
        node_leftCloud: { default: null, type: cc.Node },
        node_rightCloud: { default: null, type: cc.Node },
        widget_tipparent: { default: null, type: cc.Widget },
        widget_tv: { default: null, type: cc.Widget },
        close: { default: false }
    },
    onLoad: function () {
        Game.NotificationController.On(Game.Define.EVENT_KEY.EFFECT_CLOUDMASK, this, this.onPlayCloudMask);
    },
    start: function () {
        this.node_mask.active = false;
        let viewSize = cc.view.getFrameSize();
        let canvas = cc.director.getScene().getChildByName('Canvas');
        this.node.width = canvas.width;
        this.node.height = canvas.height;
        this.node.x = canvas.width / 2;
        this.node.y = canvas.height / 2;
        this.node.scale = canvas.scale;
        if ((viewSize.height / viewSize.width) >= 2) {
            //要有刘海了吧 
            // 上面往下顶
            this.widget_tv.top = 44;
        }
        this.widget_tipparent.updateAlignment();
        this.widget_tv.updateAlignment();
        this.node_leftCloud.width = this.node.width;
        this.node_rightCloud.width = this.node.width;
        this.node_leftCloud.x = -this.node.width / 2;
        this.node_rightCloud.x = this.node.width / 2;
        this.leftCloudCloseAction = cc.sequence([
            cc.callFunc(function () {
                this.node_leftCloud.x = -this.node.width / 2;
            }, this),
            cc.moveTo(0.5, this.node.width / 2, 0)
        ]);
        this.rightCloudCloseAction = cc.sequence([
            cc.callFunc(function () {
                this.node_rightCloud.x = this.node.width / 2;
            }, this),
            cc.moveTo(0.5, -this.node.width / 2, 0)
        ]);
        this.leftCloudOpenAction = cc.moveTo(0.5, -this.node.width / 2, 0);
        this.rightCloudOpenAction = cc.sequence([
            cc.moveTo(0.5, this.node.width / 2, 0),
            cc.callFunc(function () {
                this.node_mask.active = false;
            }, this)
        ]);
    },
    onDestroy: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.EFFECT_CLOUDMASK, this, this.onPlayCloudMask);
    },
    //====================  回调函数  ====================
    onPlayCloudMask: function (mode) {
        if (mode == cc.WrapMode.Normal && this.close) {
            return;
        }
        if (mode == cc.WrapMode.Reverse && !this.close) {
            return;
        }
        this.close = mode == cc.WrapMode.Normal;
        this.node_leftCloud.stopAllActions();
        this.node_rightCloud.stopAllActions();
        if (this.close) {
            this.node_mask.active = true;
            this.node_leftCloud.runAction(this.leftCloudCloseAction);
            this.node_rightCloud.runAction(this.rightCloudCloseAction);
        } else {
            this.node_leftCloud.runAction(this.leftCloudOpenAction);
            this.node_rightCloud.runAction(this.rightCloudOpenAction);
        }
    },
});
