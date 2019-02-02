const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_name: { default: null, type: cc.Label_ },
        sprite_bg: { default: null, type: cc.Sprite_ },
        label_status: { default: null, type: cc.Label_ },
        label_info: { default: null, type: cc.Label_ },
        label_killer: { default: null, type: cc.Label_ },
        node_donate: { default: null, type: cc.Node },
        node_auto: { default: null, type: cc.Node },

        worldbossbase: { default: null }
    },
    update: function (dt) {
        let countdown = Game.WorldBossModel.GetFreshCoundDown(Game._.get(this.worldbossbase, 'bossid', 0));
        if (countdown > 0) {
            this.label_status.node.color = cc.Color.RED;
            this.label_info.node.color = cc.Color.RED;
            this.label_status.setText('未刷新');
            this.label_info.setText(Game.moment.duration(countdown, 'second').format('mm分ss秒'));
            let kill = Game._.get(this, 'worldbossbase.killer', '无');
            if (kill == '') {
                kill = '无';
            }
            this.label_killer.setText('击杀者:' + kill);
        } else {
            this.label_status.node.color = cc.Color.GREEN;
            this.label_info.node.color = cc.Color.GREEN;
            this.label_status.setText('可击杀');
            this.label_info.setText('剩余血量:' + Game.WorldBossModel.GetLastHpProgress(Game._.get(this.worldbossbase, 'bossid', 0), 0) + '%');
            this.label_killer.setText('');
        }
    },
    //====================  这是分割线  ====================
    SetInfo: function (info) {
        this.worldbossbase = info;
        let define = Game.ConfigController.GetConfigById('worldboss_data', Game._.get(info, 'bossid', 0));
        this.label_name.setText(Game._.get(define, 'name', ''));
        this.label_name.node.color = Game.ItemModel.GetItemLabelColor(Game._.get(define, 'quality', 1));
        this.sprite_bg.SetSprite(Game._.get(define, 'picbg', ''));
        this.node_donate.active = false;
        this.node_auto.active = (Game.WorldBossModel.isAuto && Game._.get(this, 'worldbossbase.bossid', 0) == Game.WorldBossModel.GetAutoAttackedBoss());
    },
    onCardClick: function () {
        let countdown = Game.WorldBossModel.GetFreshCoundDown(Game._.get(this.worldbossbase, 'bossid', 0));
        if (countdown > 0) {
            this.openView(Game.UIName.UI_WORLDBOSSRANKING, { bossid: Game._.get(this.worldbossbase, 'bossid', 0) });
        } else {
            this.openView(Game.UIName.UI_WORLDBOSSFIGHT, { bossid: Game._.get(this.worldbossbase, 'bossid', 0) });
        }
    },
});
