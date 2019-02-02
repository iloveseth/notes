const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_seal: { default: null, type: cc.Node },
        label_name: { default: null, type: cc.Label_ },
        label_country: { default: null, type: cc.Label_ },
        label_power: { default: null, type: cc.Label_ },
        label_damage: { default: null, type: cc.Label_ },
        node_pk: { default: null, type: cc.Node },
        data_damage: { default: null }
    },
    //====================  这是分割线  ====================
    SetInfo: function (info) {
        this.data_damage = info;
        this.node_seal.active = Game._.get(info, 'seal', false);
        this.label_name.setText(Game._.get(info, 'name', ''));
        this.label_country.setText(Game.UserModel.GetCountryShortName(Game._.get(info, 'country', 0)));
        this.label_power.setText(Game._.get(info, 'fight', ''));
        this.label_damage.setText(Game._.get(info, 'dam', ''));
        this.node_pk.active = (Game.UserModel.GetCharid() != Game._.get(info, 'charid', 0));
    },
    onPkClick: function () {
        if (Game._.get(this, 'data_damage.online', 0) != 1) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '玩家不在线不能攻击');
            return;
        }
        //发消息
        Game.NetWorkController.SendProto('wboss.AttDamSortUser', { bossid: Game.WorldBossModel.GetCurBossId(), charid: Game._.get(this, 'data_damage.charid', 0) })
    }
});
