const Game = require('../../Game');
const PosYMin = -300;
const PosYMax = 500;
const MoveSpeed = 400;
cc.Class({
    extends: cc.GameComponent,

    properties: {
        info: { default: null, type: cc.RichText },
        playEndCallBack: { default: null }
    },
    Play: function (info, parent, cb) {
        let viewSize = cc.view.getVisibleSize();
        this.info.string = info;
        this.node.position = cc.p(viewSize.width / 2, Game.Tools.GetRandomInt(PosYMin, PosYMax));
        parent.addChild(this.node);
        let distance = viewSize.width + this.node.width;
        this.node.runAction(cc.sequence([
            cc.moveBy(distance / MoveSpeed, -distance, 0),
            cc.callFunc(function () {
                this.node.removeFromParent(false);
                Game.Tools.InvokeCallback(cb, this);
            }, this)
        ]));
    }
});
