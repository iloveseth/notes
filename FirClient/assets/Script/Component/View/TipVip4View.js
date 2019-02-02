const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_attackrest: cc.Label_
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    onEnable(){
        var attackrest = Game.WorldBossModel.curWorldBoss.autofight;
        this.label_attackrest.setText(attackrest);
    },

    onClickAttack(){
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.WORLDBOSS_CONFIRMATTACK);
        this.onClose();
    },

    onClickVip(){
        Game.VipModel.SetVipType(1);
        Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
        this.onClose();
    },

    // update (dt) {},
});
