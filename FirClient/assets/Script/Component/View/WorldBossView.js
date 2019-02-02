const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        nodes_worldbossitem: { default: [], type: [require('../Node/WorldBossListItemNode')] },
        poss_bossitem: { default: [] }
    },
    onLoad: function () {
        for (let i = 0; i < this.nodes_worldbossitem.length; i++) {
            this.poss_bossitem.push(this.nodes_worldbossitem[i].node.position);
        }
    },
    onEnable: function () {
        for (let i = 0; i < this.nodes_worldbossitem.length; i++) {
            this.nodes_worldbossitem[i].node.position = this.poss_bossitem[i] || cc.p(0);
        }
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_UPDATE, this, this.onWorldBossUpdate);
        // Game.NetWorkController.SendProto('wboss.ReqWBossList', {});
        Game.NetWorkController.SendProto("wboss.ReqWBossBase", {});
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_UPDATE, this, this.onWorldBossUpdate);
        Game.NetWorkController.SendProto('msg.reqDayReward', {});
    },
    //====================  回调函数  ==================== 
    onWorldBossUpdate: function () {
        this._updateWroldBossItems();
    },
    //====================  更新函数  ==================== 
    _updateWroldBossItems: function () {
        for (let i = 0; i < this.nodes_worldbossitem.length; i++) {
            let view = this.nodes_worldbossitem[i];
            view.node.stopAllActions();
            let info = Game.WorldBossModel.worldBossBases[i];
            if (view != null && info != null) {
                view.SetInfo(info);
            }
            view.node.runAction(cc.moveTo(0.3, 0, view.node.y));
        }
    }
});
