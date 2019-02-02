const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Sprite_head: { default: null, type: cc.Sprite_ },
        Label_name: { default: null, type: cc.Label_ },
        Label_country: { default: null, type: cc.Label_ },
        Label_money: { default: null, type: cc.Label_ },
    },

    onEnable() {
        this.updateView();  
    },

    updateView() {
        this.data = Game.TaskModel.luckystarList[0];
        this.Label_name.setText(this.data.name);
        this.Label_country.setText(Game.UserModel.GetCountryName(this.data.country));
        this.Label_money.setText(this.data.num);
        this.Sprite_head.SetSprite(Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(this.data.face)));
    },

    onClickOpen() {
        Game.NetWorkController.SendProto('msg.reqSnatchRedEnvelope', {
            charid: this.data.charid,
            time: this.data.time
        });
        Game.ViewController.CloseView(Game.UIName.UI_LUCKYSTARPLAYERVIEW);
    },
});
