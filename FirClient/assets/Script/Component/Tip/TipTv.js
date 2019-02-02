const Game = require('../../Game');
const MoveSpeed = 70;
cc.Class({
    extends: cc.ArrayNode,

    properties: {
        info: { default: null, type: cc.RichText },
        width: { default: 0 },
        stopCallBack: { default: null }
    },
    onLoad: function () {
        this.width = this.info.node.parent.width;
    },
    //====================  这是分割线  ====================
    Play: function (opts, cb) {
        this.node.active = true;
        this.stopCallBack = cb;
        this.SetActive(opts.particles);
        this.info.string = opts.info;
        this.info.node.stopAllActions();
        this.info.node.x = this.width / 2;
        let distance = this.info.node.width + this.width;
        this.info.node.runAction(cc.sequence([
            cc.moveBy(distance / MoveSpeed, -distance, 0),
            cc.callFunc(this.onStopPlay, this)
        ]));
    },
    onStopPlay: function () {
        this.info.node.stopAllActions();
        this.node.active = false;
        Game.Tools.InvokeCallback(this.stopCallBack);
    },
});
