let Game = require('../../Game');
cc.Class({
    extends: cc.Component,

    properties: {
        targetCanvas: { default: null, type: cc.Canvas },
    },

    onLoad: function () {
        Game.Tools.AutoFit(this.targetCanvas);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.onLoginFinish);
    },
    onDestroy: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.onLoginFinish);
    },
    onLoginFinish: function () {
        cc.log("CreateRoleScene onLoginFinish() Emit EFFECT_CLOUDMASK");
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.EFFECT_CLOUDMASK, cc.WrapMode.Normal);
        this.node.runAction(cc.sequence([
            cc.delayTime(0.6),
            cc.callFunc(function () {
                cc.director.loadScene("MainScene");
            })
        ]))
    }
});
