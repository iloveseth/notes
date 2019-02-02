const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        EditBox_septname: { default: null, type: cc.EditBox },
    },

    onEnable() {
        this.EditBox_septname.string = '';
    },

    onClickCreate() {
        if (this.EditBox_septname.string != '') {
            Game.NetWorkController.SendProto('msg.createSept', {
                name: this.EditBox_septname.string
            });
        } else {
            this.showTips('请输入公会名称');
        }
    }
});
