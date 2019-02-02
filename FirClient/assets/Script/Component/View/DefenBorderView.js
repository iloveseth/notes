const Game = require('../../Game');
const EnemyDistance = 120;
const FightRound = 3;
const CharacterType = {
    Type_Me: 1,
    Type_Enemy: 2,
    Type_Teammate: 3,
    Type_Npc: 4,
}
const MatePostions = [
    cc.p(-200, -100),
    cc.p(-200, -500),
    cc.p(200, -500),
    cc.p(200, -100),
]
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_runmap: { default: null, type: require('../Node/RunMapNode') },
        node_team: { default: null, type: cc.Node },
        label_pktotaltimes: { default: null, type: cc.Label_ },
        label_pkwintimes: { default: null, type: cc.Label_ },
        label_pklastrewardtimes: { default: null, type: cc.Label_ },
        tableview_teams: { default: null, type: cc.tableView },
        label_pktotalwintimes: { default: null, type: cc.Label_ },
        node_rankitemparent: { default: null, type: cc.Node },
        prefab_rankitem: { default: null, type: cc.Prefab },
        label_countdowm: { default: null, type: cc.Label_ },
        label_teamnum: { default: null, type: cc.Label_ },
        label_income: { default: null, type: cc.Label_ },
        node_pkbuttoneffect: { default: null, type: cc.Node },
        label_attack: { default: null, type: cc.Label },
        button_attack: { default: null, type: cc.Button_ },
        node_teaming: { default: null, type: cc.Node },
        node_fighting: { default: null, type: cc.Node },
        label_leave: { default: null, type: cc.Label_ },

        teamid: { default: null },
        character_me: { default: null },
        characters_enemy: { default: {} },
        characters_teammate: { default: {} },
        characters_npc: { default: {} },
        fighting: { default: false },
        characters_target: { default: {} },
        round_fight: { default: {} },
        npc_seed: { default: -1 },
        is_firstupdate: { default: true },
        finding_enemy: { default: false },

        node_head: { default: [], type: [cc.Node] },

        btn_assembly:{ default: null, type: cc.Button_ },

    },
    start: function () {
        this.character_me = this.node_runmap.Init(new cc.Rect(-660, -600, 1300, 710), cc.p(0, -300), this.onCharacterArrival.bind(this), 180);
    },
    update: function (dt) {
        this._updateTeamLastTime();
        if (this.fighting && this.finding_enemy) {
            this._findNextEnemyAndRun();
        }
    },
    onEnable: function () {
        Game.BorderModel._isOpen = true;
        this.fighting = false;
        this.is_firstupdate = true;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BORDER_MYTEAMDETAIL, this, this.onTeamDetailUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BORDER_TEAMLISTUPDATE, this, this.onTeamListUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BORDER_ENEMYUPDATE, this, this.onEnemyUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_CHARACTERHITFRAME, this, this.onCharacterHit);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BORDER_MYTEAMICON, this, this.onTeamUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BORDER_LEAVETEAM, this, this.onLeaveTeam);
        Game.NotificationController.On(Game.Define.EVENT_KEY.CLOSE_FIGHTSUCCESS, this, this.onFightResultInfo);
        Game.NetWorkController.AddListener('border.userDeath', this, this.onUserDeathInfo);
        Game.NetWorkController.AddListener('borderteam.retStartBorderPk', this, this.onStartBorder);

        this.teamid = Game.BorderModel.GetTeamId();
        this.node_team.active = (this.teamid == 0);
        if (this.teamid == 0) {
            Game.NetWorkController.SendProto('borderteam.reqBorderTeamlist', {});
        } else {
            Game.NetWorkController.SendProto('borderteam.reqJoinTeam', { teamid: this.teamid });
        }
        this.onTeamUpdate();
    },
    onDisable: function () {
        Game.BorderModel._isOpen = false;
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BORDER_MYTEAMDETAIL, this, this.onTeamDetailUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BORDER_TEAMLISTUPDATE, this, this.onTeamListUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BORDER_ENEMYUPDATE, this, this.onEnemyUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERHITFRAME, this, this.onCharacterHit);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BORDER_MYTEAMICON, this, this.onTeamUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BORDER_LEAVETEAM, this, this.onLeaveTeam);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.CLOSE_FIGHTSUCCESS, this, this.onFightResultInfo);
        Game.NetWorkController.RemoveListener('border.userDeath', this, this.onUserDeathInfo);
        Game.NetWorkController.RemoveListener('borderteam.retStartBorderPk', this, this.onStartBorder);
        Game.AsyncGenerator.StopGenerate(Game.AsyncGenerator.Define.DEFENBORDER_ENEMY);
        Game.AsyncGenerator.StopGenerate(Game.AsyncGenerator.Define.DEFENBORDER_TEAMMATE);
        Game.NetWorkController.SendProto('msg.reqDayReward', {});
    },
    //====================  按钮回调  ====================
    onTouchStart: function (event) {
        let state = Game.BorderModel.GetBorderState();
        if (!this.fighting && state == Game.Define.BORDERTEAM_STATE.STATE_FIGHTING) {
            this.node_runmap.SetTargetPos(this.character_me.node.uuid, this.node_runmap.node.convertToNodeSpaceAR(event.getLocation()));
        }
    },
    onStartDefenClick: function () {
        Game.BorderModel.status = Game.Define.BorderStatus.Status_Waitting;
        Game.NetWorkController.SendProto('borderteam.reqStartNewTeam', {});
    },
    onJoinTeamClick: function (team) {
        Game.BorderModel.status = Game.Define.BorderStatus.Status_Waitting;
        if (team == 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '队伍信息有误');
            return;
        }
        Game.NetWorkController.SendProto('borderteam.reqJoinTeam', { teamid: team });
    },
    onAssemblyClick: function () {
        // 点击加入守边
        Game.NetWorkController.SendProto('borderteam.reqInviteJoinTeam', {});
    },
    onBoxClick: function () {
        //奖励预览
        this.openView(Game.UIName.UI_REWARDLISTPREVIEW, {
            title: '奖励预览',
            desc: '守卫边境第%d档次宝箱奖励如下:',
            rewards: Game.BorderModel.borderRewards,
            initPage: this._getRewardLevel().id
        })
    },
    onAttackClick: function () {
        if (this.fighting) {
            return;
        }
        let state = Game.BorderModel.GetBorderState();
        if (state == Game.Define.BORDERTEAM_STATE.STATE_TEAMING) {
            Game.NetWorkController.SendProto('borderteam.reqStartBorderPk', {});
        } else if (state == Game.Define.BORDERTEAM_STATE.STATE_FIGHTING) {
            this.fighting = true;
            //开始吧
            this._updateFightButton();
            this._findNextEnemyAndRun();
        }
    },
    onLeaveClick: function () {
        //离开队伍
        if (Game.BorderModel.IsTeamLeader()) {
            //我是队长
            Game.NetWorkController.SendProto('borderteam.reqDismissTeam', {});
        } else {
            // 我是队员
            Game.NetWorkController.SendProto('borderteam.reqLeaveTeam', {});
        }
    },
    onTickMemberClick: function (charid) {
        Game.NetWorkController.SendProto('borderteam.reqKickOutUser', { charid: charid });
    },
    //====================  事件回调  ====================
    onTeamUpdate: function () {
        this._updateFightButton();
        this._updateBottomView();
    },
    onCharacterAnimaEnd: function (animaName, uuid) {
        if (Game.EntityController.IsCharacterAttackAnima(animaName)) {
            this._fightTarget(uuid);
        }
    },
    onCharacterHit: function (uuid) {
        this._hitTarget(uuid);
    },
    onCharacterArrival: function (uuid) {
        //跑到目标点回调
        let type = this._getCharacterType(uuid);
        if (type == CharacterType.Type_Me) {
            if (this.fighting) {
                //是我的角色跑到了 打吧
                // 先比划两刀
                let targetcharuuid = this.characters_target[uuid];
                this._fightTarget(uuid);
                this._fightTarget(targetcharuuid);
            }
        } else if (type == CharacterType.Type_Teammate) {
            //队友跑到了
            let enemyuuid = this.characters_target[uuid];
            this._fightTarget(uuid);
            this._fightTarget(enemyuuid);
        }
    },
    onTeamDetailUpdate: function () {
        this.teamid = Game.BorderModel.GetTeamId();
        this.node_team.active = false;
        this._updateBorderMapView();
        this._updateTeamRankView();
        this._updateTeammate();
        if (this.is_firstupdate) {
            this.is_firstupdate = false;
            let state = Game.BorderModel.GetBorderState();
            if (state == Game.Define.BORDERTEAM_STATE.STATE_FIGHTING) {
                //自动打起来
                this.onAttackClick();
            }
        }
    },
    onTeamListUpdate: function () {
        if (this.node_team.active) {
            this._updatePrepareView();
        }
    },
    onEnemyUpdate: function () {
        let state = Game.BorderModel.GetBorderState();
        if (state == Game.Define.BORDERTEAM_STATE.STATE_FIGHTING) {
            this._updateEnemies();
        }
    },
    onFightResultInfo: function (type) {
        if (type != Game.Define.ENUMF_TYPE.typeBorder) {
            return;
        }
        this._findNextEnemyAndRun();
    },
    onUserDeathInfo: function (msgid, data) {
        if (data.type == Game.Define.DEATH_TYPE.DeathType_Bianjing) {
            this.fighting = false;
            this._updateFightButton();
        }
    },
    onStartBorder: function (msgid, data) {
        this._updateFightButton();
        this._updateBottomView();
        this._updateEnemies();
        if (Game.BorderModel.IsTeamLeader()) {
            this._updateTeamRankView();
        }
        //队友们散出去打吧
        Game._.forIn(this.characters_teammate, function (value, key) {
            this._generateNextNpcAndRun(key);
        }.bind(this));
        //开始打吧
        this.onAttackClick();
    },
    onLeaveTeam: function () {
        this._backToPrepareView();
    },
    //====================  更新回调  ====================
    _updatePrepareView: function () {
        this.label_pktotaltimes.setText(Game.BorderModel.GetPkTimes());
        this.label_pkwintimes.setText(Game.BorderModel.GetPkWinTimes());
        this.label_pklastrewardtimes.setText(Game.BorderModel.GetLeftDefenTimes());
        let data = {
            array: Game.BorderModel.GetBorderTeams(),
            target: this,
        }
        this.tableview_teams.initTableView(data.array.length, data);
    },
    _updateBorderMapView: function () {
        this.label_teamnum.setText(Game.BorderModel.GetTeamMembers().length + '/' + Game.BorderModel.GetMaxMember());
        this.label_income.setText(Game.BorderModel.GetRewardProp() + '%');
        this.label_pktotalwintimes.setText(Game.BorderModel.GetTotalKill() + '/' + this._getRewardLevel().num);
    },
    _updateTeamRankView: function () {


        // Game.ResController.DestoryAllChildren(this.node_rankitemparent);
        let members = Game.BorderModel.GetTeamMembers();
        // for (let i = this.node_rankitemparent.childrenCount - 1; i >= members.length; i--) {
        //     let node = this.node_rankitemparent.children[i];
        //     node.destroy();
        // }
        for (var i = 0; i < this.node_head.length; i++) {
            var hNode = this.node_head[i].getComponent('TeamHeadNode');
            let data = members[i];
            let isleader = Game.BorderModel.IsTeamLeader();
            let state = Game.BorderModel.GetBorderState();
            if (isleader && state == Game.Define.BORDERTEAM_STATE.STATE_TEAMING) {
                // 可以移除 && Game._.get(data, 'charid', 0) != Game.UserModel.GetCharid()
                hNode.updateView(data, this.onTickMemberClick.bind(this));
            }else{
                // 无法移除
               hNode.updateView(data); 
            }
        }
        // for (let i = 0; i < members.length; i++) {
        //     let member = members[i];
        //     let node = null;
        //     if (i < this.node_rankitemparent.childrenCount) {
        //         node = this.node_rankitemparent.children[i];
        //     } else {
        //         node = cc.instantiate(this.prefab_rankitem);
        //         this.node_rankitemparent.addChild(node);
        //     }
        //     let arrnode = node.getComponent('TeamRankNode');
        //     arrnode.SetInfo([
        //         Game._.get(member, 'name', ''),
        //         Game._.get(member, 'killnum', ''),
        //     ]);
        //     let actives = [];
        //     if (Game._.get(member, 'charid', 0) == Game.BorderModel.GetLeaderId()) {
        //         actives.push('Sprite_Captain');
        //     }
        //     let isleader = Game.BorderModel.IsTeamLeader();
        //     let state = Game.BorderModel.GetBorderState();
        //     if (isleader && state == Game.Define.BORDERTEAM_STATE.STATE_TEAMING && Game._.get(member, 'charid', 0) != Game.UserModel.GetCharid()) {
        //         actives.push('Button_Kick');
        //     }
        //     if (isleader) {
        //         arrnode.SetData(Game._.get(member, 'charid', 0), this.onTickMemberClick.bind(this));
        //     }
        //     arrnode.SetActive(actives);
        // }
    },
    _updateTeamLastTime: function () {
        if (this.node_fighting.active) {
            let laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_BORDERTEAM, 'mm:ss', false);
            this.label_countdowm.setText(laststr);
            if (laststr == '') {
                //TODO
                this.fighting = false;
            }
        }
    },
    _updateEnemies: function () {
        //先把原来的删除掉
        //原来有就用原来的，原来没就创建
        let enemies = Game.BorderModel.GetEnemies();
        let shouldGenerateEnemis = [];
        for (let i = 0; i < enemies.length; i++) {
            let enemy = enemies[i];
            let find = false;
            Game._.forIn(this.characters_enemy, function (value, key) {
                if (value != null && value.charid == enemy.charid) {
                    find = true;
                    return false;
                }
            });
            if (!find) {
                shouldGenerateEnemis.push(enemy);
            }
        }
        Game.AsyncGenerator.StartGenerate(Game.AsyncGenerator.Define.DEFENBORDER_ENEMY, 0.1, shouldGenerateEnemis, function (enemy) {
            let pos = this.node_runmap.RandomSomePosition(1)[0];
            let character = this.node_runmap.CreateNpcCharacter({
                pos: pos,
                name: Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(Game._.get(enemy, 'face', 0))),
                showAutoFight: false,
                charName: '[' + Game.UserModel.GetCountryShortName(Game._.get(enemy, 'country', 0)) + ']' + Game._.get(enemy, 'name', ''),
                nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
                nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
                hp: (Game._.get(enemy, 'fight', 1000) / 2)
            });
            character.charid = Game._.get(enemy, 'charid', 0);
            this.characters_enemy[character.node.uuid] = character;
        }.bind(this), true);
    },
    _updateFightButton: function () {
        let state = Game.BorderModel.GetBorderState();
        if (state == Game.Define.BORDERTEAM_STATE.STATE_TEAMING) {
            this.btn_assembly.setVisible(true);
            this.fighting = false;
            this.button_attack.interactable = Game.BorderModel.IsTeamLeader();
            this.label_attack.setText('开启守边');
        } else if (state == Game.Define.BORDERTEAM_STATE.STATE_FIGHTING) {
            this.btn_assembly.setVisible(false);
            this.button_attack.interactable = true;
            this.node_pkbuttoneffect.active = !this.fighting;
            this.label_attack.setText(this.fighting ? '自动PK' : 'PK');
        }
    },
    _updateBottomView: function () {
        let state = Game.BorderModel.GetBorderState();
        if (state == Game.Define.BORDERTEAM_STATE.STATE_TEAMING) {
            this.node_teaming.active = true;
            this.label_leave.setText(Game.BorderModel.IsTeamLeader() ? '解散' : '离队');
            this.node_fighting.active = false;
        } else if (state == Game.Define.BORDERTEAM_STATE.STATE_FIGHTING) {
            this.node_teaming.active = false;
            this.node_fighting.active = true;
        }
    },
    _updateTeammate: function () {
        let members = Game.BorderModel.GetTeamMembers();
        let removedIds = [];
        Game._.forIn(this.characters_teammate, function (value, key) {
            let index = Game._.findIndex(members, { charid: value.charid });
            if (index == -1) {
                //从队伍里走了
                removedIds.push(key);
            }
        });
        for (let i = 0; i < removedIds.length; i++) {
            this._removeCharacter(removedIds[i]);
        }

        let shouldGenerateCharacters = [];
        for (let i = 0; i < members.length; i++) {
            let charid = members[i].charid;
            if (charid == Game.UserModel.GetCharid()) {
                continue;
            }
            let find = false;
            Game._.forIn(this.characters_teammate, function (value, key) {
                if (value != null && value.charid == charid) {
                    find = true;
                    return false;
                }
            });
            if (!find) {
                shouldGenerateCharacters.push(members[i]);
            }
        }
        Game.AsyncGenerator.StartGenerate(Game.AsyncGenerator.Define.DEFENBORDER_TEAMMATE, 0.2, shouldGenerateCharacters, function (teammate) {
            let targetPos = this.node_runmap.RandomSomePosition(1)[0];
            for (let j = 0; j < MatePostions.length; j++) {
                let pos = MatePostions[j];
                let find = false;
                Game._.forIn(this.characters_teammate, function (value, key) {
                    if (cc.pDistance(pos, value.node.position) < 10) {
                        find = true;
                        return false;
                    }
                    return true;
                });
                if (!find) {
                    targetPos = pos;
                    break;
                }
            }
            let character = this.node_runmap.CreateNpcCharacter({
                pos: targetPos,
                name: Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(Game._.get(teammate, 'face', 0))),
                showAutoFight: false,
                charName: '[' + Game.UserModel.GetCountryShortName(Game.UserModel.GetCountry()) + ']' + Game._.get(teammate, 'name', ''),
                nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                hp: (Game._.get(teammate, 'fight', 1000) / 2)
            });
            character.charid = Game._.get(teammate, 'charid', 0);
            this.characters_teammate[character.node.uuid] = character;
            let state = Game.BorderModel.GetBorderState();
            if (state == Game.Define.BORDERTEAM_STATE.STATE_FIGHTING) {
                this._generateNextNpcAndRun(character.node.uuid);
            }
        }.bind(this), true);
    },
    //====================  私有函数  ====================
    _findNextEnemyAndRun: function () {
        if (!this.fighting) {
            return;
        }
        this.finding_enemy = true;
        let keys = Game._.keys(this.characters_enemy);
        if (keys.length > 0) {
            let nextEnemy = this.characters_enemy[keys[0]];
            this.characters_target[this.character_me.node.uuid] = nextEnemy.node.uuid;
            this.characters_target[nextEnemy.node.uuid] = this.character_me.node.uuid;
            //先暴力一点 在地图的左半边就跑右边 在右半边就跑左边
            let targetPos = cc.p(nextEnemy.node.x > 0 ? nextEnemy.node.x - EnemyDistance : nextEnemy.node.x + EnemyDistance, nextEnemy.node.y);
            this.node_runmap.SetTargetPos(this.character_me.node.uuid, targetPos);
            this.finding_enemy = false;
        }
    },
    _generateNextNpcAndRun: function (uuid) {
        //给我的已有随机一个npc
        let pos = this.node_runmap.RandomSomePosition(1)[0];
        let character = this.node_runmap.CreateNpcCharacter({
            pos: pos,
            name: Game.EntityController.RandomOccupation(),
            showAutoFight: false,
            charName: '[' + Game.UserModel.GetCountryShortName(Game.UserModel.GetEnemyCountry()) + ']' + Game.EntityController.RandomPlayerName(),
            hp: Game.Tools.GetRandomInt(1000, 10000),
            nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
            nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
            nameColor: cc.Color.RED,
        });
        character.charid = this.npc_seed--;
        this.characters_npc[character.node.uuid] = character;
        this.characters_target[uuid] = character.node.uuid;
        this.characters_target[character.node.uuid] = uuid;
        let targetPos = cc.p(pos.x > 0 ? pos.x - EnemyDistance : pos.x + EnemyDistance, pos.y);
        this.node_runmap.SetTargetPos(uuid, targetPos);
    },

    _fightTarget: function (uuid) {
        let character = this._getCharacterById(uuid);
        let enemyuuid = this.characters_target[uuid];
        let enemy = this._getCharacterById(enemyuuid);
        let round = this.round_fight[uuid] || 0;
        if (enemy == null) {
            this._clearEnemy(uuid);
            return;
        }
        let state = Game.BorderModel.GetBorderState();
        if (state != Game.Define.BORDERTEAM_STATE.STATE_FIGHTING || (!this.fighting && this.character_me.node.uuid == uuid)) {
            //停了停了 
            character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
            return;
        }
        if (round >= FightRound) {
            //该结束了 不同的角色有不同的处理
            let type = this._getCharacterType(uuid);
            if (type == CharacterType.Type_Me) {
                //如果是我 那要发消息了
                Game.NetWorkController.SendProto('border.attEnemy', {
                    charid: enemy.charid,
                    atttype: 1,
                    assistid: 0,
                });
                character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                //不管输赢 把我的对手删掉吧
                this._removeCharacter(enemy.node.uuid);
            } else if (type == CharacterType.Type_Teammate) {
                //队友打完了 接着模拟吧
                this._generateNextNpcAndRun(uuid);
                this._removeCharacter(enemy.node.uuid);
            }
            delete this.round_fight[uuid];
        } else {
            //接着打
            let dir = Game.Define.DIRECTION_TYPE.NORTH;
            if (enemy.node.x > character.node.x) {
                dir = Game.Define.DIRECTION_TYPE.EAST;
            } else {
                dir = Game.Define.DIRECTION_TYPE.WEST;
            }
            character.ChangeDirection(dir);
            character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
            this.round_fight[uuid] = round + 1;
        }
    },
    _hitTarget: function (uuid) {
        let character = this._getCharacterById(uuid);
        let enemyuuid = this.characters_target[uuid];
        let enemy = this._getCharacterById(enemyuuid);
        if (enemy == null) {
            this._clearEnemy(uuid);
            return;
        }
        let state = Game.BorderModel.GetBorderState();
        if (state != Game.Define.BORDERTEAM_STATE.STATE_FIGHTING || (!this.fighting && this.character_me.node.uuid == uuid)) {
            //停了停了 
            character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
            return;
        }
        let maxhp = character.GetMaxHp();
        let damage = Game.Tools.GetRandomInt(Math.ceil(maxhp * 0.2), Math.ceil(maxhp * 0.3));
        enemy.ReduceHp(damage);
        let tip = '<i><outline color=black width=2><color=#ffffff>-' + damage + '</c></outline></i>';
        let pos = this.node.convertToNodeSpaceAR(enemy.GetTipNodeWorldPos());
        Game.TipPoolController.ShowHpTip(tip, pos, this.node);
    },
    _removeCharacter: function (uuid) {
        delete this.characters_enemy[uuid];
        delete this.characters_npc[uuid];
        delete this.characters_teammate[uuid];
        this._clearEnemy(uuid);
        this.node_runmap.DestroyCharacter(uuid);
    },
    _clearEnemy: function (uuid) {
        delete this.characters_target[uuid];
        delete this.round_fight[uuid];
    },
    _getCharacterById: function (uuid) {
        if (this.character_me.node.uuid == uuid) {
            return this.character_me;
        } else if (this.characters_enemy[uuid] != null) {
            return this.characters_enemy[uuid];
        } else if (this.characters_teammate[uuid] != null) {
            return this.characters_teammate[uuid];
        } else if (this.characters_npc[uuid] != null) {
            return this.characters_npc[uuid];
        }
        return null;
    },
    _getCharacterType: function (uuid) {
        if (this.character_me.node.uuid == uuid) {
            return CharacterType.Type_Me;
        } else if (this.characters_enemy[uuid] != null) {
            return CharacterType.Type_Enemy;
        } else if (this.characters_teammate[uuid] != null) {
            return CharacterType.Type_Teammate;
        } else if (this.characters_npc[uuid] != null) {
            return CharacterType.Type_Npc;
        }
        return 0;
    },
    _getRewardLevel: function () {
        let borderDefines = Game.ConfigController.GetConfig('borderteam_data');
        let kill = Game.BorderModel.GetTotalKill();
        let define = null;
        for (let i = 0; i < borderDefines.length; i++) {
            define = borderDefines[i];
            if (kill < define.num) {
                break;
            }
        }
        return define;
    },
    _backToPrepareView: function () {
        this.node_fighting.active = false;
        this.node_team.active = true;
        this.node_runmap.SetTargetPos(this.character_me.node.uuid, cc.p(0, 0));
        this.character_me.node.position = cc.p(0, 0);
        this._clearCharacters(this.characters_enemy);
        this._clearCharacters(this.characters_npc);
        this._clearCharacters(this.characters_teammate);
        Game.NetWorkController.SendProto('borderteam.reqBorderTeamlist', {});
    },
    _clearCharacters: function (list) {
        let keys = Game._.keys(list);
        for (let i = 0; i < keys.length; i++) {
            this._removeCharacter(keys[i]);
        }
    }
});
