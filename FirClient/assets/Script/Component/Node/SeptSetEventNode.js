const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        EditBox_event: { default: null, type: cc.EditBox },
    },

    onEnable() {
        this.EditBox_event.string = Game.SeptModel.septMainData.notify;
    },

    onClickOk() {
        if (this.EditBox_event.string != '') {
            Game.NetWorkController.SendProto('msg.setSeptNotify', {
                notify: this.EditBox_event.string
            });
            this.onClose();
        } else {
            this.showTips('请输入公会公告');
        }
    }
});
