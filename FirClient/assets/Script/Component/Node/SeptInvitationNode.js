const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        EditBox_name: { default: null, type: cc.EditBox },
    },

    onEnable() {
        this.EditBox_name.string = '';
    },

    onClickOk() {
        if (this.EditBox_name.string != '') {
            Game.NetWorkController.SendProto('msg.inviteSeptMember', {
                name: this.EditBox_name.string
            });
        } else {
            this.showTips('请输入玩家名字');
        }
    }
});
