const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_time: { default: null, type: cc.Label_ },
        label_money: { default: null, type: cc.Label_ },
        label_exp: { default: null, type: cc.Label_ },
        label_equip: { default: null, type: cc.Label_ },
        node_vip: { default: null, type: cc.Node },
        label_vipmoney: { default: null, type: cc.Label_ },
        label_vipexp: { default: null, type: cc.Label_ },
    },
    onEnable: function () {
        let offlineReport = this._data;
        this.label_time.setText(Game.moment.duration(Game._.get(offlineReport, 'secs', 0), 'second').format('h时m分s秒'));
        this.label_money.setText(Game.Tools.UnitConvert(Game._.get(offlineReport, 'money', 0)));
        this.label_exp.setText(Game.Tools.UnitConvert(Game._.get(offlineReport, 'exp', 0)));
        let eqiups = Game._.get(offlineReport, 'equipinfo', []);
        let count = 0;
        for (let i = 0; i < eqiups.length; i++) {
            count += Game._.get(eqiups, '[' + i + '].num', 0);
        }
        this.label_equip.setText(Game.Tools.UnitConvert(count));
        this.label_vipmoney.setText(Game.Tools.UnitConvert(Game._.get(offlineReport, 'vipmoneyadd', 0)));
        this.label_vipexp.setText(Game.Tools.UnitConvert(Game._.get(offlineReport, 'vipexpadd', 0)));
        this.node_vip.active = (Game.UserModel.GetViplevel() == 0);

        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TARGET_GUIDE_END);
        Game.GlobalModel.canShowTargetGuideView = false;
    },
    onDisable() {
        Game.GlobalModel.canShowTargetGuideView = true;
    },
    //====================  按钮回调  ====================
    onVipClick: function () {
        this.openView(Game.UIName.UI_VIP_RECHARGE_VIEW);
        this.onClose();
    }
});
