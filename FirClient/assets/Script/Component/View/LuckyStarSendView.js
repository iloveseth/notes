const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Sprite_arrows: { default: [], type: [cc.Sprite_] },
        Label_tip: { default: null, type: cc.Label_ },
        Label_num: { default: null, type: cc.Label_ },
        Label_money: { default: null, type: cc.Label_ },
    },

    onEnable() {
        this.selectIndex = 0;
        this.updateView();  
    },

    updateView() {
        for (let i = 0; i < 5; i ++) {
            this.Sprite_arrows[i].node.active = this.selectIndex == i;
        }
        this.Label_num.setText(this._data.num[this.selectIndex]);
        this.Label_money.setText(this._data.gold[this.selectIndex]);
        this.Label_tip.setText('幸运星领完后您将获得: \n' + this._data.reward[this.selectIndex]);
    },

    onClickSendLuckStar() {
        Game.Platform.SetTDEventData(Game.Define.TD_EVENT.EventGroceriesBuy,{times:1, charid:Game.UserModel.GetCharid()});
        Game.NetWorkController.SendProto('msg.beginRedEnvelope', {
            type: parseInt(this.selectIndex) + 1
        });
    },

    onClickArrow(event, customEventData) {
        if (this.selectIndex == customEventData) {return;}
        this.selectIndex = customEventData;
        this.updateView();
    },
});
