const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        EditBox_septname: { default: null, type: cc.EditBox },
    },

    onEnable() {
        this.EditBox_septname.string = '';
    },

    onClickOk() {
        if (this.EditBox_septname.string != '') {
            Game.NetWorkController.SendProto('msg.reqSeptInfo', {
                septid: 0,
                name: this.EditBox_septname.string
            });
        } else {
            this.showTips('请输入公会名称');
        }
    }
});
