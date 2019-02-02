const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        infoRichText: { default: null, type: cc.RichText },
        endcb: { default: null }
    },
    // 放回池中了
    unuse: function () {
    },
    //从池中拿出来了
    reuse: function (cb) {
        this.endcb = cb;
        this.node.scaleX = 0;
        this.node.scaleY = 0;
        this.node.x = 0;
        this.node.y = 0;
        this.node.opacity = 255;
    },
    //====================  这是分割线  ====================
    Fly: function (info) {
        this.infoRichText.string = info;
        this.node.runAction(cc.sequence([
            cc.show(),
            cc.scaleTo(0.1, 1.4, 1.4),
            cc.scaleTo(0.1, 1, 1),
            cc.spawn([
                cc.moveBy(2, 0, 400),
                cc.sequence([
                    cc.delayTime(1.4),
                    cc.fadeTo(0.6, 0)
                ])
            ]),
            cc.callFunc(function () {
                Game.Tools.InvokeCallback(this.endcb, this);
            }, this)
        ]))
    }
});
