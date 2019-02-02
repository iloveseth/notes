const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_title: { default: null, type: cc.Label_ },
        label_name: { default: null, type: cc.Label_ },
        progress_hp: { default: null, type: cc.ProgressBar },
        label_hppercent: { default: null, type: cc.Label_ },
        label_damage: { default: null, type: cc.Label_ },
        prefab_worldBossDamageNode: { default: null, type: cc.Prefab },
        parent_worldBossDamageNode: { default: null, type: cc.Node },
        scrollview_worldBossDamage: { default: null, type: cc.ScrollView },
        ske_boss: { default: null, type: sp.Skeleton },
        node_hp: { default: null, type: cc.Node },
        node_damagerank: { default: null, type: cc.Node },
        node_damageranklabel: { default: null, type: cc.Node },
        node_damagerankback: { default: null, type: cc.Node },
        nodes_player: { default: [], type: [cc.Node] },
        node_me: { default: null, type: cc.Node },
        sprite_attackprogress: { default: null, type: cc.Sprite },
        node_autoattack: { default: null, type: cc.Node },

        data_boss: { default: null },
        data_damage: { default: null },
        character_me: { default: null },
        isrankshow: { default: false },

        label_attack: cc.Label_,
    },
    update: function (dt) {
        this._updateAttackButton();
    },
    onEnable: function () {
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_DAMAGERANKUPDATE, this, this.onDamageRankUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_DAMAGEUPDATE, this, this.onDamageUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_HPUPDATE, this, this._updateWorldBosshp);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_CANCLEATTACK, this, this.onCancleAttack);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_BOSSDIE, this, this.onBossDie);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_CURBOSSINFO,this,this.onCurBossInfo);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_SETAUTOFIGHT,this,this.onSetAutoFight);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WORLDBOSS_CONFIRMATTACK,this,this.onConfirmAttack);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.onLoginFinish);
        let bossid = Game._.get(this, '_data.bossid', 0);
        Game.NetWorkController.SendProto('wboss.ReqWBossInfo', { bossid: bossid });
        this.data_boss = Game.WorldBossModel.GetBossBaseById(bossid);
        this.ske_boss.setCompleteListener(this.onBossAnimaEnd.bind(this));
        this.isrankshow = false;
        this._updateWorldBossView();
        this._updateWorldBosshp();
        this.isfighting = (Game.WorldBossModel.isAuto && Game.WorldBossModel.GetAutoAttackedBoss() == bossid);
        if(this.isfighting){
            this.label_attack.setText('自动攻击中...');
        }
        else{
            this.label_attack.setText('攻击');
        }
        this._updateAutoAttack();
        this.firstauto = false;
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_DAMAGERANKUPDATE, this, this.onDamageRankUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_DAMAGEUPDATE, this, this.onDamageUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_HPUPDATE, this, this._updateWorldBosshp);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_CANCLEATTACK, this, this.onCancleAttack);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_BOSSDIE, this, this.onBossDie);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_CURBOSSINFO,this,this.onCurBossInfo);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_SETAUTOFIGHT,this,this.onSetAutoFight);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WORLDBOSS_CONFIRMATTACK,this,this.onConfirmAttack);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ROLE_LOGINFINISH, this, this.onLoginFinish);
        Game.NetWorkController.SendProto('wboss.LeaveWBossMain', {});
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.WORLDBOSS_UPDATE);
        if (this.character_me) {
            Game.EntityController.ReleaseCharacter(this.character_me);
            this.character_me = null;
        }
        for (let i = 0; i < this.nodes_player.length; i++) {
            let node = this.nodes_player[i];
            if (node == null) {
                continue;
            }
            //如果原来有删除掉吧
            let playerNode = node.getChildByName('PlayerNode');
            if (playerNode != null) {
                playerNode.stopAllActions();
                let character = playerNode.getComponent('Character');
                if (character != null) {
                    Game.EntityController.ReleaseCharacter(character);
                } else {
                    playerNode.destroy();
                }
            }
        }
    },
    //====================  按钮回调  ====================
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

    checkAutoRight(){
        return (Game.UserModel.GetViplevel() >= 4 || Game.WorldBossModel.curWorldBoss.autofight > 0)
    },

    checkFreeAuto(){
        return Game.UserModel.GetViplevel() >= 4;
    },

    onLoginFinish(){
        cc.log('世界boss断线重连！！！！！！！！！');
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        this.onClose();
        let countdown = Game.WorldBossModel.GetFreshCoundDown(bossid);
        if (countdown > 0) {
            this.openView(Game.UIName.UI_WORLDBOSSRANKING, { bossid: bossid });
        } else {
            this.openView(Game.UIName.UI_WORLDBOSSFIGHT, { bossid: bossid});
        }
        if(this.isfighting && Game.WorldBossModel.GetAutoAttackedBoss() == bossid){
            //正在攻击当前boss
            Game.WorldBossModel.AutoFight(bossid);
        }
    },

    onFightClick: function () {
        if(this.isfighting){
            return;
        }
        if(!Game.WorldBossModel.stateAuto){
            this.tryFight();
            this.label_attack.setText('攻击');
        }
        else{
            // 如果没有在自动攻击这个boss:说明需要消耗自动攻击次数
            //判断是否需要消耗次数
            //服务器的isauto和和客户端的firstauto
            if(Game.WorldBossModel.curWorldBoss.isauto == 0 && !this.firstauto && !this.checkFreeAuto()){
                cc.log('vip4以下将会消耗自动攻击次数！！！');
                this.openView(Game.UIName.UI_TIPVIP4VIEW);
            }
            else{
                this.tryAutoFight();
            }
        }
    },

    onConfirmAttack(){
        this.tryAutoFight();
    },

    tryFight(){
        if (!this.isfighting) {
            let bossid = Game._.get(this, 'data_boss.bossid', 0);
            if (Game.WorldBossModel.isAuto) {
                if (Game.WorldBossModel.GetAutoAttackedBoss() != bossid) {
                    let bossdefine = Game.ConfigController.GetConfigById('worldboss_data', Game.WorldBossModel.GetAutoAttackedBoss());
                    let name = Game._.get(bossdefine, 'name', '');
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM,
                        '自动攻击提醒',
                        '您当前正在自动攻击BOSS' + name + '，本次操作将会终止自动攻击BOSS' + name + ',是否继续?',
                        [
                            {
                                name: '确定',
                                handler: this.onConfirmFight.bind(this),
                            },
                            {
                                name: '取消'
                            }
                        ]
                    )
                } else {
                    //正在自动战斗的就是这只 啥也别干了
                }
            } else {
                //没在自动攻击 自动攻击吧
                Game.NetWorkController.SendProto('wboss.StartAttWBoss', { bossid: bossid });
            }
        }
    },
    onDamageRankClick: function () {
        this.isrankshow = !this.isrankshow;
        this._updateDamageRankList();
    },
    onAssembleClick: function () {

    },
    onAutoFightClick: function () {
        if(!Game.WorldBossModel.stateAuto && !this.checkAutoRight()){
            //弹框
            Game.WorldBossModel.stateAuto = false;
            this._updateAutoAttack();
            this.openView(Game.UIName.UI_TIPVIP4VIEW);
        }
        else{
            Game.WorldBossModel.stateAuto = !Game.WorldBossModel.stateAuto;
            this._updateAutoAttack();
            var bossid =  Game._.get(this, 'data_boss.bossid', 0);
            if(Game.WorldBossModel.isAuto && (Game.WorldBossModel.GetAutoAttackedBoss() == bossid)){
                Game.WorldBossModel.CancleAutoFight();
                this.isfighting = false;
                this.label_attack.setText('攻击');
            }
        }
    },

    tryAutoFight(){
        //看看有没有开启自动战斗
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        //看看是不是有在攻击别的boss
        if (Game.WorldBossModel.isAuto) {
            if (Game.WorldBossModel.GetAutoAttackedBoss() != bossid) {
                let bossdefine = Game.ConfigController.GetConfigById('worldboss_data', Game.WorldBossModel.GetAutoAttackedBoss());
                let name = Game._.get(bossdefine, 'name', '');
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM,
                    '自动攻击提醒',
                    '您当前正在自动攻击BOSS' + name + '，本次操作将会终止自动攻击BOSS' + name + ',是否继续?',
                    [
                        {
                            name: '确定',
                            handler: this.onConfirmAutoFight.bind(this),
                        },
                        {
                            name: '取消'
                        }
                    ]
                )
            } else {
                //正在自动战斗的就是这只 那就取消吧
                Game.WorldBossModel.CancleAutoFight();
                this.isfighting = false;
                this.label_attack.setText('攻击');
                this._updateAutoAttack();
            }
        } else {
            // 没在自动攻击 自动攻击吧
            this.onConfirmAutoFight();
        }
    },
    onBossDie: function (bossid) {
        if (bossid == Game._.get(this, 'data_boss.bossid', 0)) {
            this.onClose();
            this.openView(Game.UIName.UI_WORLDBOSSRANKING, { bossid: bossid });
        }
    },
    onConfirmAutoFight: function () {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        Game.WorldBossModel.CancleFight();
        Game.WorldBossModel.AutoFight(bossid);
        this.isfighting = true;
        this.label_attack.setText('自动攻击中...');
        this.firstauto = true;
        this._updateAutoAttack();
    },
    onConfirmFight: function () {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        Game.WorldBossModel.CancleAutoFight();
        Game.NetWorkController.SendProto('wboss.StartAttWBoss', { bossid: bossid });
        this.isfighting = true;
    },
    //====================  事件回调  ====================
    onDamageRankUpdate: function (updateid) {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        if (bossid == updateid) {
            let damageData = Game.WorldBossModel.GetWorldBossDamageData(bossid);
            if (damageData != null) {
                this.data_damage = damageData;
                this._updateDamageData();
                this._updatePkCharacter();
            }
        }
    },
    onCharacterAnimaEnd: function (animaName, uuid) {
        if (animaName == 'attack01') {
            if (this.character_me.node.uuid == uuid) {
                this.character_me.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
            } else {
                for (let i = 0; i < this.nodes_player.length; i++) {
                    let node = this.nodes_player[i];
                    if (node == null) {
                        continue;
                    }
                    let playerNode = node.getChildByName('PlayerNode');
                    if (playerNode == null || playerNode.uuid != uuid) {
                        continue;
                    }
                    let character = playerNode.getComponent('Character');
                    if (character) {
                        character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                    }
                    break;
                }
            }
        }
    },
    onDamageUpdate: function (damage) {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        if (bossid == Game.WorldBossModel.GetAttackedBoss()) {
            //播放动画
            this.ske_boss.setAnimation(0, 'hit', false);
            let tip = '<i><outline color=black width=2><color=#ff0000>-' + damage + '</c></outline></i>';
            // let pos = this.node_hp.parent.convertToNodeSpaceAR(this.node_hp.position);
            Game.TipPoolController.ShowHpTip(tip, cc.p(0, 0), this.node_hp);
            this.character_me.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
        }
    },
    onBossAnimaEnd: function (track) {
        if (Game._.get(track, 'animation.name', '') == 'hit') {
            this.ske_boss.setAnimation(0, 'idle', true);
        }
    },
    onCancleAttack: function () {
        this.isfighting = false;
        this.label_attack.setText('攻击');
    },

    //====================  私有函数  ====================
    //====================  更新函数  ====================
    _updateWorldBossView: function () {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        let define = Game.ConfigController.GetConfigById('worldboss_data', bossid);
        this.label_title.setText(Game._.get(define, 'name', ''));
        this.label_name.setText(Game._.get(define, 'name', ''));
        this.label_title.node.color = Game.ItemModel.GetItemLabelColor(Game._.get(define, 'quality', 1));
        this.label_name.node.color = Game.ItemModel.GetItemLabelColor(Game._.get(define, 'quality', 1));
        Game.ResController.LoadSpine('Animation/Npc/' + Game._.get(define, 'ani', '') + '/', function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.ske_boss.skeletonData = asset;
                this.ske_boss.setAnimation(0, 'idle', true);
            }
        }.bind(this));
        this.node_damagerank.x = 0;
        this.node_damageranklabel.active = true;
        this.node_damagerankback.active = false;
        //创建我
        let playerNode = this.node_me.getChildByName('PlayerNode');
        let character = null;
        if (playerNode != null) {
            character = playerNode.getComponent('Character');
        } else {
            character = Game.EntityController.GetCharacter();
            playerNode = character.node;
            playerNode.position = cc.p(0, 0);
            playerNode.name = 'PlayerNode';
            character = playerNode.getComponent('Character');
            this.node_me.addChild(playerNode);
        }
        character.LoadCharacter(
            Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetUserOccupation()),
            Game.FairyModel.GetFightFairys(),
            {
                showAutoFight: false,
                charName: '[' + Game.UserModel.GetCountryShortName(Game.UserModel.GetCountry()) + ']' + Game.UserModel.GetUserName(),
                nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
            }
        );
        character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
        character.ChangeDirection(Game.Define.DIRECTION_TYPE.WEST);
        this.character_me = character;
    },
    _updateWorldBosshp: function () {
        let hpper = Game.WorldBossModel.GetLastHpProgress(Game._.get(this, 'data_boss.bossid', 0), 2);
        this.label_hppercent.setText(hpper + '%');
        this.progress_hp.progress = hpper / 100;
    },
    _updateDamageData: function () {
        this.label_damage.setText(Game._.get(this, 'data_damage.mydam', 0));
        //构造伤害排行榜
        Game.ResController.DestoryAllChildren(this.parent_worldBossDamageNode);
        let rankList = Game._.get(this, 'data_damage.list', []);
        for (let i = 0; i < rankList.length; i++) {
            let info = rankList[i];
            let node = cc.instantiate(this.prefab_worldBossDamageNode);
            let damageNode = node.getComponent('WorldBossDamageNode');
            damageNode.SetInfo(info);
            this.parent_worldBossDamageNode.addChild(node);
        }
        this.scrollview_worldBossDamage.scrollToTop();
    },
    _updateAttackButton: function () {
        let bossid = Game._.get(this, 'data_boss.bossid', 0);
        if (bossid == 0) {
            return;
        }
        let countdowm = Game.WorldBossModel.GetWorldBossAttackCountDown(bossid);
        let cd = Game.WorldBossModel.GetWorldBossAttackTotalCd(bossid);
        if (countdowm == 0 && this.isfighting) {
            //倒计时到了 真的打吧
            if (!Game.WorldBossModel.isAuto) {
                Game.WorldBossModel.AttackedBoss(bossid);
                // Game.WorldBossModel.hasattack = true;
            }
        }
        this.isfighting = (countdowm >= 0);
        // if(!this.isfighting){
        //     this.label_attack.setText('攻击');
        // }
        if (cd == 0) {
            this.sprite_attackprogress.fillRange = 0;
        } else {
            this.sprite_attackprogress.fillRange = countdowm / cd;
        }
    },
    _updatePkCharacter: function () {
        let pkList = Game._.get(this, 'data_damage.list', []);
        pkList = Game._.filter(pkList, function (o) {
            return o.charid != Game.UserModel.GetCharid();
        });
        for (let i = 0; i < this.nodes_player.length; i++) {
            let node = this.nodes_player[i];
            let data = pkList[i];
            if (node == null) {
                continue;
            }
            if (data != null) {
                //有玩家 创建
                let playerNode = node.getChildByName('PlayerNode');
                let character = null;
                if (playerNode != null) {
                    character = playerNode.getComponent('Character');
                } else {
                    character = Game.EntityController.GetCharacter();
                    playerNode = character.node;
                    playerNode.position = cc.p(0, 0);
                    playerNode.name = 'PlayerNode';
                    node.addChild(playerNode);
                    cc.log(playerNode);
                    character = playerNode.getComponent('Character');
                    playerNode.runAction(
                        cc.repeatForever(
                            cc.sequence([
                                cc.delayTime(Game.Tools.GetRandomInt(4, 8)),
                                cc.callFunc(function () {
                                    character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
                                })
                            ])
                        )
                    );
                }
                character.LoadCharacter(
                    Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(data.face)),
                    [],
                    {
                        showAutoFight: false,
                        charName: '[' + Game.UserModel.GetCountryShortName(data.country) + ']' + data.name,
                        nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
                        nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
                    }
                );
                character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                //设置角色的面向
                if(i == 0 || i == 1){
                    character.ChangeDirection(Game.Define.DIRECTION_TYPE.EAST);
                }
                else{
                    character.ChangeDirection(Game.Define.DIRECTION_TYPE.WEST);
                }
            } else {
                //没有玩家 如果原来有删除掉吧
                let playerNode = node.getChildByName('PlayerNode');
                if (playerNode != null) {
                    playerNode.stopAllActions();
                    let character = playerNode.getComponent('Character');
                    if (character != null) {
                        Game.EntityController.ReleaseCharacter(character);
                    } else {
                        playerNode.destroy();
                    }
                }
            }
        }
    },
    _updateDamageRankList: function () {
        this.node_damagerank.stopAllActions();
        let targetx = this.isrankshow ? -720 : 0;
        let diff = Math.abs(targetx - this.node_damagerank.x);
        this.node_damagerank.runAction(cc.moveTo(diff / 1000, targetx, this.node_damagerank.y));
        this.node_damageranklabel.active = !this.isrankshow;
        this.node_damagerankback.active = this.isrankshow;
    },
    _updateAutoAttack: function () {
        // let bossid = Game._.get(this, 'data_boss.bossid', 0);
        this.node_autoattack.active = Game.WorldBossModel.stateAuto;//(Game.WorldBossModel.isAuto && Game.WorldBossModel.GetAutoAttackedBoss() == bossid);
    },

    onCurBossInfo(){
        this._updateAutoAttack();
    },  

    onSetAutoFight(ret){
        if(!ret){
            // this.tryAutoFight();
            Game.WorldBossModel.CancleAutoFight();
            this.isfighting = false;
            this.label_attack.setText('攻击');
            cc.log('onsetautofightfalse');
        }

        
    }
});
