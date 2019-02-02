const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_name: { default: null, type: cc.Label_ },
        ske_boss: { default: null, type: sp.Skeleton },
        label_countdown: { default: null, type: cc.Label_ },
        label_killer: { default: null, type: cc.Label_ },
        prefab_worldBossDamageNode: { default: null, type: cc.Prefab },
        parent_worldBossDamageNode: { default: null, type: cc.Node },
        node_reward: { default: null, type: cc.Node },
        node_damage: { default: null, type: cc.Node },
        nodes_myreward: { default: [], type: [cc.Node] },
        label_damage: { default: null, type: cc.Label_ },
        node_die: { default: null, type: cc.Node },
        node_escape: { default: null, type: cc.Node },

        data_boss: { default: null },
        data_damage: { default: null }
    },
    onEnable: function () {
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_DAMAGERANKUPDATE, this, this.onDamageRankUpdate);
        let bossid = Game._.get(this, '_data.bossid', 0);
        Game.NetWorkController.SendProto('wboss.ReqWBossDamList', { bossid: bossid });
        this.data_boss = Game.WorldBossModel.GetBossBaseById(bossid);
        this.data_damage = Game.WorldBossModel.GetWorldBossDamageData(bossid);
        this._updateWorldBossView();
        this._updateDamageData();
    },
    update: function (dt) {
        let countdown = Game.WorldBossModel.GetFreshCoundDown(Game._.get(this, 'data_boss.bossid', 0));
        if (countdown > 0) {
            this.label_countdown.setText(Game.moment.duration(countdown, 'second').format('mm分ss秒'));
        } else {
            this.onClose();
        }
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_DAMAGERANKUPDATE, this, this.onDamageRankUpdate);
    },
    //====================  这是分割线  ====================
    onDamageRankUpdate: function (updateid) {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        if (bossid == updateid) {
            let damageData = Game.WorldBossModel.GetWorldBossDamageData(bossid);
            if (damageData != null) {
                this.data_damage = damageData;
                this._updateDamageData();
            }
        }
    },
    onKillRewardClick: function () {
        let rewardid = Game.WorldBossModel.GetKillRewardId(Game._.get(this, 'data_boss.bossid', 0));
        let result = Game.ItemModel.GenerateObjectsFromCommonReward(rewardid);
        this.openView(Game.UIName.UI_REWARDPREVIEW, {
            titleSpriteName: '',
            frameSpriteName: '',
            title: '奖励预览',
            desc: Game._.get(result, 'define.rewardpreview', ''),
            rewards: result.objs
        });
    },
    onSealRewardClick: function () {
        let rewardid = Game.WorldBossModel.GetSealRewardId(Game._.get(this, 'data_boss.bossid', 0));
        let result = Game.ItemModel.GenerateObjectsFromCommonReward(rewardid);
        this.openView(Game.UIName.UI_REWARDPREVIEW, {
            titleSpriteName: '',
            frameSpriteName: '',
            title: '奖励预览',
            desc: Game._.get(result, 'define.rewardpreview', ''),
            rewards: result.objs
        });
    },
    _updateWorldBossView: function () {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        let define = Game.ConfigController.GetConfigById('worldboss_data', bossid);
        this.label_name.setText(Game._.get(define, 'name', ''));
        this.label_name.node.color = Game.ItemModel.GetItemLabelColor(Game._.get(define, 'quality', 1));
        Game.ResController.LoadSpine('Animation/Npc/' + Game._.get(define, 'ani', '') + '/', function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.ske_boss.skeletonData = asset;
                this.ske_boss.setAnimation(0, 'idle', true);
            }
        }.bind(this));
        let kill = Game._.get(this, 'data_boss.killer', '');
        this.node_die.active = (kill != '');
        this.node_escape.active = (kill == '');
        if (kill == '') {
            kill = '无';
        }
        this.label_killer.setText(kill);
    },
    _updateDamageData: function () {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        //伤害信息
        let isMeSeal = false;
        Game.ResController.DestoryAllChildren(this.parent_worldBossDamageNode);
        if (this.data_damage != null) {
            this.label_damage.setText(Game._.get(this, 'data_damage.mydam', 0));
            //构造伤害排行榜
            let rankList = Game._.get(this, 'data_damage.list', []);
            for (let i = 0; i < rankList.length; i++) {
                let info = rankList[i];
                if (Game._.get(info, 'charid', 0) == Game.UserModel.GetCharid()) {
                    isMeSeal = Game._.get(info, 'seal', false);
                }
                let node = cc.instantiate(this.prefab_worldBossDamageNode);
                let damageNode = node.getComponent('WorldBossDamageNode');
                damageNode.SetInfo(info);
                this.parent_worldBossDamageNode.addChild(node);
            }
        }
        //奖励信息
        if (isMeSeal) {
            this.node_reward.active = true;
            this.node_damage.active = false;
            let rewardid = Game.WorldBossModel.GetSealRewardId(bossid);
            let result = Game.ItemModel.GenerateObjectsFromCommonReward(rewardid);
            for (let i = 0; i < this.nodes_myreward.length; i++) {
                let node = this.nodes_myreward[i];
                if (i >= result.objs.length) {
                    node.active = false;
                    continue;
                }
                let itemobj = result.objs[i];
                let itemdefine = Game.ItemModel.GetItemConfig(Game._.get(itemobj, 'baseid', 0));
                let iconSprite = node.getComponent(cc.Sprite_);
                if (iconSprite != null && itemdefine != null) {
                    iconSprite.SetSprite(Game._.get(itemdefine, 'pic', ''));
                }
                let countnode = node.getChildByName('Label_');
                if (countnode != null) {
                    let label = countnode.getComponent(cc.Label_);
                    if (label != null) {
                        label.setText('x' + Game._.get(itemobj, 'num', 0));
                    }
                }
            }
        } else {
            this.node_reward.active = false;
            this.node_damage.active = true;
        }
    }
});
