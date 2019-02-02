const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_info: { default: null, type: cc.Label_ },
        label_shader: { default: null, type: cc.Label_ }
    },
    //====================  这是分割线  ====================
    Show: function (info) {
        this.label_info.string = '等级提升至' + info;
        this.label_shader.string = '等级提升至' + info;
        this.node.stopAllActions();
        this.node.opacity = 255;
        this.node.runAction(cc.sequence([
            cc.delayTime(2),
            cc.fadeTo(0.5, 0)
        ]));
    }
});
