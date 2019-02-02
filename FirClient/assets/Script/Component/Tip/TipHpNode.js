const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,
    properties: {
        infoRichText: { default: null, type: cc.RichText },
    },
    Play: function (info, pos, cb) {
        this.infoRichText.string = info;
        this.node.position = pos;
        this.node.active = true;
        this.node.scaleX = 0;
        this.node.scaleY = 0;
        this.node.opacity = 255;
        this.node.runAction(cc.sequence([
            cc.spawn([
                cc.sequence([
                    cc.scaleTo(0.3, 1.3),
                    cc.scaleTo(0.2, 1),
                    cc.fadeTo(0.4, 0)
                ]),
                cc.moveBy(0.9, 0, 150),
            ]),
            cc.callFunc(function () {
                Game.Tools.InvokeCallback(cb, this);
            }, this)
        ]));
    }
});
