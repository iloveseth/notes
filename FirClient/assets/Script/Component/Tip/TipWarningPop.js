const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        richtext_info: { default: null, type: cc.RichText },
    },
    //====================  这是分割线  ====================
    Show: function (info) {
        this.richtext_info.string = info;
        this.node.stopAllActions();
        this.node.opacity = 255;
        this.node.runAction(cc.sequence([
            cc.delayTime(1),
            cc.fadeTo(0.5, 0)
        ]));
    }
});
