const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_round: { default: null, type: cc.Label_ },
        label_lasthp: { default: null, type: cc.Label_ },
        label_misstimes: { default: null, type: cc.Label_ },
    },
    onEnable: function () {
        this.label_round.setText(Game._.get(this, '_data.round', ''));
        this.label_lasthp.setText(Game._.get(this, '_data.lasthp', ''));
        this.label_misstimes.setText(Game._.get(this, '_data.,miss', ''));
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
        Game.GlobalModel.canShowTargetGuideView = false;
    },
    onDestroy: function () {
        Game.GlobalModel.canShowTargetGuideView = true;
    },
    //====================  按钮回调  ====================
    onEquipClick: function () {
        this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Equip);
    },
    onEnergyClick: function () {
        this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Equip);
    },
    onFairyClick: function () {
        //有精灵要修改
        this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Equip);
    },
    onConfirmClick: function () {
        this.onClose();
    }
});
