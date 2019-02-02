const Game = require('../../Game');
const ArrayNode = require('../CustomNode/ArrayNode');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_pktimes: { default: null, type: cc.Label_ },
        label_pkwintimes: { default: null, type: cc.Label_ },
        label_pkwinprop: { default: null, type: cc.Label_ },
        nodes_rewardBox: { default: [], type: [ArrayNode] },
        progress_totaltimes: { default: null, type: cc.ProgressBar },
        progress_dayrewarsstep: { default: null, type: cc.ProgressBar },
        scrollview_dayreward: { default: null, type: cc.ScrollView },
        labels_rewardBox: { default: null, type: ArrayNode },
        //世界boss
        nodes_worldboss: { default: null, type: ArrayNode },
        labels_worldbossname: { default: [], type: [cc.Label_] },
        labels_worldbosshp: { default: [], type: [cc.Label_] },
        //竞技场
        nodes_arena: { default: null, type: ArrayNode },
        label_arenarank: { default: null, type: cc.Label_ },
        //守边
        nodes_defen: { default: null, type: ArrayNode },
        arrlabels_rank: { default: [], type: [ArrayNode] },
        //公会战
        nodes_sept: { default: null, type: ArrayNode },

        node_worldbossred: cc.Node,
        node_septred: cc.Node,
        node_defendred: cc.Node,
        node_arenared: cc.Node,
    },
    onEnable: function () {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PK_REWARDUPDATE, this, this.onPkRewardUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_UPDATE, this, this.onWorldBossUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.REWARD_UPDATE, this, this.onRewardUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BATTLE_RED,this,this.onBattleRed);
        Game.NetWorkController.AddListener('border.retBorderInfo', this, this.onBorderCardUpdate);
        Game.NetWorkController.AddListener('pvp.MyPvpRank', this, this.onMyRankUpdate);
        Game.NetWorkController.SendProto('msg.reqDayReward', {});
        Game.NetWorkController.SendProto("wboss.ReqWBossBase", {});
        Game.NetWorkController.SendProto('border.reqBorderInfo', {});
        let septid = Game.UserModel.GetSeptId();
        if (septid != 0) {
            Game.NetWorkController.SendProto('spk.reqNewSeptPk', {});
        }

        this.onBattleRed();
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PK_REWARDUPDATE, this, this.onPkRewardUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_UPDATE, this, this.onWorldBossUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.REWARD_UPDATE, this, this.onRewardUpdate);
        Game.NetWorkController.RemoveListener('border.retBorderInfo', this, this.onBorderCardUpdate);
        Game.NetWorkController.RemoveListener('pvp.MyPvpRank', this, this.onMyRankUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BATTLE_RED,this,this.onBattleRed);
    },
    update: function () {
        this._updateSeptPkCard();
    },
    //====================  按钮回调  ====================
    onWorldBossClick: function () {
        this.openView(Game.UIName.UI_WORLDBOSSLIST);
        Game.UserModel.battle_red.bossred = false;
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.BATTLE_RED);
    },
    onArenaClick: function () {
        this.openView(Game.UIName.UI_GYM_FIGHT_LIST_VIEW);
        Game.UserModel.battle_red.pvpred = false;
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.BATTLE_RED);
    },
    onDefenClick: function () {
        this.openView(Game.UIName.UI_DEFENBORDER);
        Game.UserModel.battle_red.borderred = false;
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.BATTLE_RED);
    },
    onSeptBattleClick: function () {
        let septid = Game.UserModel.GetSeptId();
        if (septid == 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '请先加入公会');
            return;
        }
        this.openView(Game.UIName.UI_SEPTPKVIEW);
        Game.UserModel.battle_red.septfightred = false;
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.BATTLE_RED);
    },
    onRewardBoxClick: function (event, index) {
        index = Game._.toNumber(index);
        let rewardIds = Game.RewardModel.GetRecievedPkWinRewards();
        if (Game._.indexOf(rewardIds, index) == -1) {
            let define = Game.ConfigController.GetConfigById('pkwinreward_data', index);
            let point = Game._.get(define, 'point', 0);
            if (Game.RewardModel.GetCurPkWinTimes() >= point) {
                //发消息
                Game.NetWorkController.SendProto('msg.getDayReward', {
                    rewardid: 0,
                    pksuccess_rewardid: define.id
                });
            } else {
                //奖励预览
                let result = Game.ItemModel.GenerateObjectsFromCommonReward(define.reward);
                this.openView(Game.UIName.UI_REWARDPREVIEW, {
                    titleSpriteName: '',
                    frameSpriteName: '',
                    title: '奖励预览',
                    desc: Game._.get(result, 'define.rewardpreview', ''),
                    rewards: result.objs
                });
            }
        }
    },
    onScrollLeftClick: function () {
        this.scrollview_dayreward.scrollToLeft(0.5);
    },
    onScrollRightClick: function () {
        this.scrollview_dayreward.scrollToRight(0.5);
    },
    //====================  事件回调  ====================
    onPkRewardUpdate: function () {
        this._updatePkReward();
    },
    onWorldBossUpdate: function () {
        this._updateWorldBossCard();
    },
    onMyRankUpdate: function (msgid, data) {
        this._updateArenaCard(data.rank);
    },
    onBorderCardUpdate: function (msgid, data) {
        this._updateDefenCard(data);
    },
    onRewardUpdate: function () {
        Game.NetWorkController.SendProto('msg.reqDayReward', {});
    },
    //====================  更新回调  ====================
    _updatePkReward: function () {
        cc.log('updatePKReward');
        this.pkRed = false;
        let totalpktime = Game.RewardModel.GetCurPoint();
        let winpktime = Game.RewardModel.GetCurPkWinTimes();
        this.label_pktimes.setText(totalpktime);
        this.label_pkwintimes.setText(winpktime);
        let percent = 0;
        if (totalpktime != 0) {
            percent = (winpktime * 100 / totalpktime).toFixed(2);
        }
        this.label_pkwinprop.setText(percent + '%');
        let rewardIds = Game.RewardModel.GetRecievedPkWinRewards();
        let boxPoints = [];
        let maxPoint = 0;
        for (let i = 0; i < this.nodes_rewardBox.length; i++) {
            let nodes = this.nodes_rewardBox[i];
            let index = Game._.indexOf(rewardIds, i + 1);
            let define = Game.ConfigController.GetConfigById('pkwinreward_data', i + 1);
            let point = Game._.get(define, 'point', 0);
            if (point > maxPoint) {
                maxPoint = point;
            }
            boxPoints.push(Game._.get(define, 'point', 0));
            if (index != -1) {
                //已领取
                nodes.SetActive(['Sprite_Opened']);
                cc.find('Red',nodes.node).active = false;
            } else {
                let point = Game._.get(define, 'point', 0);
                if (winpktime >= point) {
                    //可领取
                    nodes.SetActive(['Sprite_Normal']);
                    cc.find('Red',nodes.node).active = true;
                    this.pkRed = true;
                } else {
                    //不可领取
                    nodes.SetActive(['Sprite_Disable']);
                    cc.find('Red',nodes.node).active = false;
                }
            }
        }
        this.labels_rewardBox.SetInfo(boxPoints);
        this.progress_totaltimes.progress = totalpktime / maxPoint;
        this.progress_dayrewarsstep.progress = winpktime / maxPoint;
    },
    _updateWorldBossCard: function () {
        this.nodes_worldboss.SetActive(['UnlockNode']);
        for (let i = 0; i < this.labels_worldbossname.length; i++) {
            let namelabel = this.labels_worldbossname[i];
            let hplabel = this.labels_worldbosshp[i];
            let data = Game.WorldBossModel.worldBossBases[i];
            let define = Game.ConfigController.GetConfigById('worldboss_data', data.bossid);
            namelabel.setText(define.name);
            namelabel.node.color = Game.ItemModel.GetItemLabelColor(define.quality);
            hplabel.setText(Game.WorldBossModel.GetLastHpProgress(data.bossid, 0) + '%');
        }
    },
    _updateArenaCard: function (rank) {
        this.nodes_arena.SetActive(['UnlockNode']);
        this.label_arenarank.setText(rank);
    },
    _updateDefenCard: function (data) {
        this.nodes_defen.SetActive(['UnlockNode']);
        // 前一名
        let prelabels = this.arrlabels_rank[0];
        if (prelabels != null) {
            if (data.previous != null) {
                prelabels.node.active = data.previous.rank != 0
                if (data.previous.rank != 0) {
                    prelabels.SetInfo([data.previous.rank, data.previous.killnum]);
                }
            } else {
                prelabels.node.active = false;
            }
        }
        //我的名次
        let mylabels = this.arrlabels_rank[1];
        if (mylabels != null) {
            mylabels.SetInfo([data.self.rank || '暂无,', data.self.killnum]);
        }
        //后一名
        let nextlabels = this.arrlabels_rank[2];
        if (nextlabels != null) {
            if (data.next != null) {
                nextlabels.node.active = data.next.rank != 0
                if (data.next.rank != 0) {
                    nextlabels.SetInfo([data.next.rank, data.next.killnum]);
                }
            } else {
                nextlabels.node.active = false;
            }
        }
    },
    _updateSeptPkCard: function () {
        let septid = Game.UserModel.GetSeptId();
        if (septid == 0) {
            this.nodes_sept.SetActive(['LockNode']);
            return;
        }
        let countDown = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_SEPTPK);
        if (countDown > 0) {
            this.nodes_sept.SetActive(['UnLockNode']);
            let info = [
                Game.SeptPkModel.GetCardName(),
                Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_SEPTPK, 'h:m:s'),
                Game.SeptPkModel.GetCardMyPoint() + '/' + Game.SeptPkModel.GetCardEnemyPoint()
            ];
            this.nodes_sept.SetInfo(info);
        } else {
            this.nodes_sept.SetActive(['LockNode']);
        }
    },

    onBattleRed(){
        var reddata = Game.UserModel.battle_red;
        if(reddata){
            this.node_arenared.active = reddata.pvpred;
            this.node_defendred.active = reddata.borderred;
            this.node_worldbossred.active = reddata.bossred;
            this.node_septred.active = reddata.septfightred;
        }
        else{
            this.node_arenared.active = false;
            this.node_defendred.active = false;
            this.node_worldbossred.active = false;
            this.node_septred.active = false;
        }
        
    },
});
