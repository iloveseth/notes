const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        EditBox_fight: { default: null, type: cc.EditBox },
    },

    onEnable() {
        this.EditBox_fight.string = '';
    },

    onClickOk() {
        if (this.EditBox_fight.string != '') {
            Game.NetWorkController.SendProto('msg.setFightLimit', {
                fightlimit: parseInt(this.EditBox_fight.string)
            });
            this.onClose();
        } else {
            this.showTips('请输入加入公会所需要的战斗力..');
        }
    }
});
