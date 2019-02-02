const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        input_code: { default: null, type: cc.EditBox },
    },
    onEnable: function () {
        this.input_code.string = '';
    },
    onDisable: function () {

    },
    //====================  这是分割线  ====================
    onExchangeClick: function () {
        if (this.input_code.string == '') {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '请输入兑换码');
            return;
        }
        Game.NetWorkController.SendProto('msg.reqExchangeCDKey', { cdkey: this.input_code.string });
    },
});
