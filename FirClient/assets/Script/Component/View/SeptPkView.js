const Game = require('../../Game');
const EnemyDistance = 120;
const FightRound = 3;
const CharacterType = {
    Type_Me: 1,
    Type_Enemy: 2,
    Type_Teammate: 3,
}
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_runmap: { default: null, type: require('../Node/RunMapNode') },
        node_sept: { default: null, type: cc.Node },
        label_starttimes: { default: null, type: cc.Label_ },
        label_accepttimes: { default: null, type: cc.Label_ },
        tableview_septs: { default: null, type: cc.tableView },
        node_myrankparent: { default: null, type: cc.Node },
        node_enemyrankparent: { default: null, type: cc.Node },
        node_enemyrank: { default: null, type: cc.Node },
        node_enemylistbutton: { default: null, type: require('../CustomNode/ArrayNode') },
        prefab_rankitem: { default: null, type: cc.Prefab },
        label_countdowm: { default: null, type: cc.Label_ },
        label_myseptname: { default: null, type: cc.Label_ },
        label_enemyseptname: { default: null, type: cc.Label_ },
        label_mykills: { default: null, type: cc.Label_ },
        label_enemykills: { default: null, type: cc.Label_ },
        node_pkbuttoneffect: { default: null, type: cc.Node },
        label_attack: { default: null, type: cc.Label },
        node_end: { default: null, type: cc.Node },

        character_me: { default: null },
        characters_enemy: { default: {} },
        characters_teammate: { default: {} },
        fighting: { default: false },
        characters_target: { default: {} },
        round_fight: { default: {} },
        npc_seed: { default: -1 },
        show_enemyrank: { default: false }
    },
    start: function () {
        this.character_me = this.node_runmap.Init(null, null, this.onCharacterArrival.bind(this), 180);
    },
    update: function (dt) {
        this._updateCountDown();
    },
    onEnable: function () {
        this.fighting = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SEPTPK_INFOUPDATE, this, this.onSeptInfoUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SEPTPK_FIGHTUPDATE, this, this.onSeptFightUpdate);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_CHARACTERHITFRAME, this, this.onCharacterHit);
        Game.NotificationController.On(Game.Define.EVENT_KEY.CLOSE_FIGHTSUCCESS, this, this.onFightResultInfo);
        Game.NetWorkController.AddListener('border.userDeath', this, this.onUserDeathInfo);
        let countdown = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_SEPTPK);
        this.node_sept.active = (countdown <= 0);
        Game.NetWorkController.SendProto('spk.reqNewSeptPk', {});
    },
    onDisable: function () {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SEPTPK_INFOUPDATE, this, this.onSeptInfoUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SEPTPK_FIGHTUPDATE, this, this.onSeptFightUpdate);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERHITFRAME, this, this.onCharacterHit);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.CLOSE_FIGHTSUCCESS, this, this.onFightResultInfo);
        Game.NetWorkController.RemoveListener('border.userDeath', this, this.onUserDeathInfo);
        Game.AsyncGenerator.StopGenerate(Game.AsyncGenerator.Define.SEPTPK_ENEMY);
        Game.AsyncGenerator.StopGenerate(Game.AsyncGenerator.Define.SEPTPK_TEAMMATE);
        Game.NetWorkController.SendProto('msg.reqDayReward', {});
    },
    //====================  按钮回调  ====================
    onTouchStart: function (event) {
        if (!this.fighting || this.node_end.active) {
            this.node_runmap.SetTargetPos(this.character_me.node.uuid, this.node_runmap.node.convertToNodeSpaceAR(event.getLocation()));
        }
    },
    onPKClick: function (septid) {
        if (septid == 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '公会信息有误');
            return;
        }
        if (septid == Game.UserModel.GetSeptId()) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '不能挑战我的公会');
            return;
        }
        Game.NetWorkController.SendProto('spk.startNewSeptPk', { septid: septid });
    },
    onMemClick: function (septid) {
        Game.SeptModel.isOpenSeptMember = true;
        Game.NetWorkController.SendProto('msg.reqSeptMemberList', {
            septid: septid
        });
    },
    onSeptRecrodClick: function () {
        this.openView(Game.UIName.UI_SEPTPKRECORD);
    },
    onShowEnemyRankClick: function () {
        this.show_enemyrank = !this.show_enemyrank;
        this._updateEnemyRankList();
    },
    onAttackClick: function () {
        if (this.fighting) {
            return;
        }
        let mydata = Game.SeptPkModel.GetSeptPkFightMyData();
        let max = Game._.get(mydata, 'maxkill', 0);
        let cur = Game._.get(mydata, 'killnum', 0);
        if (cur >= max) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '您的挑战次数已达上限');
            return;
        }
        this.fighting = true;
        //开始吧
        this._updateFightButton();
        this._findNextEnemyAndRun(this.character_me.node.uuid);
    },
    //====================  事件回调  ====================
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
    onSeptInfoUpdate: function () {
        if (this.node_sept.active) {
            this._updatePrepareView();
        }
    },
    onSeptFightUpdate: function () {
        this.node_sept.active = false;
        let myData = Game.SeptPkModel.GetSeptPkFightMyData();
        this.character_me.SetDisplayOpts({
            septName: '[' + Game._.get(myData, 'septname', '') + ']',
            // titleName: Game.UserDefine.TITLE[Game._.get(myData, 'title', 7)]
        });
        this._updateBottomView();
        this._updateSeptRank(Game.SeptPkModel.GetSeptPkFightMyMembers(), this.node_myrankparent);
        this._updateSeptRank(Game.SeptPkModel.GetSeptPkFightEnemyMembers(), this.node_enemyrankparent);
        this._updateEnemyRankList();
        this._updateEnemies();
        this._updateSeptMates();
    },
    onFightResultInfo: function (type) {
        if (type != Game.Define.ENUMF_TYPE.typeSeptPk) {
            return;
        }
        this._findNextEnemyAndRun(this.character_me.node.uuid);
    },
    onUserDeathInfo: function (msgid, data) {
        if (data.type == Game.Define.DEATH_TYPE.DeatnType_SeptPk) {
            this.fighting = false;
            this._updateFightButton();
        }
    },
    //====================  更新回调  ====================
    _updatePrepareView: function () {
        this.label_starttimes.setText(Game.SeptPkModel.GetSeptPkLeftTimes() + '/' + Game.SeptPkModel.GetSeptPkMaxLeftTimes());
        this.label_accepttimes.setText(Game.SeptPkModel.GetSeptPkBeatTimes() + '/' + Game.SeptPkModel.GetSeptPkMaxBeatTimes());
        let data = {
            array: Game.SeptPkModel.GetSeptPkSeptDatas(),
            target: this,
        }
        this.tableview_septs.initTableView(data.array.length, data);
    },
    _updateBottomView: function () {
        this.label_myseptname.setText(Game.SeptPkModel.GetSeptPkFightMyName());
        this.label_enemyseptname.setText(Game.SeptPkModel.GetSeptPkFightEnemyName());
        this.label_mykills.setText(Game.SeptPkModel.GetSeptPkFightMyPoint());
        this.label_enemykills.setText(Game.SeptPkModel.GetSeptPkFightEnemyPoint());
    },
    _updateSeptRank: function (members, parent) {
        for (let i = parent.childrenCount - 1; i >= members.length; i--) {
            let node = parent.children[i];
            node.destroy();
        }
        for (let i = 0; i < members.length; i++) {
            let member = members[i];
            let node = null;
            if (i < parent.childrenCount) {
                node = parent.children[i];
            } else {
                node = cc.instantiate(this.prefab_rankitem);
                parent.addChild(node);
            }
            let arrnode = node.getComponent('ArrayNode');
            arrnode.SetInfo([
                Game._.get(member, 'name', ''),
                Game._.get(member, 'killnum', 0) + '/' + Game._.get(member, 'maxkill', 0),
            ]);
            arrnode.SetActive([]);
        }
    },
    _updateCountDown: function () {
        let laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_SEPTPK, 'hh:mm:ss');
        this.label_countdowm.setText(laststr);
        if (laststr == '') {
            //TODO
            this.fighting = false;
        }
        this.node_end.active = (laststr == '');
    },
    _updateEnemyRankList: function () {
        this.node_enemyrank.stopAllActions();
        let targetx = this.show_enemyrank ? -300 : 0;
        let diff = Math.abs(targetx - this.node_enemyrank.x);
        this.node_enemyrank.runAction(cc.moveTo(diff / 1000, targetx, this.node_enemyrank.y));
        this.node_enemylistbutton.SetActive([this.show_enemyrank ? 'Node_In' : 'Node_Out']);
    },
    _updateEnemies: function () {
        //先把原来的删除掉
        //原来有就用原来的，原来没就创建
        let enemies = Game.SeptPkModel.GetSeptPkFightEnemyMembers();
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
        Game.AsyncGenerator.StartGenerate(Game.AsyncGenerator.Define.SEPTPK_ENEMY, 0.1, shouldGenerateEnemis, function (enemy) {
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
    _updateSeptMates: function () {
        let mates = Game.SeptPkModel.GetSeptPkFightMyMatesData();
        let enemies = Game.SeptPkModel.GetSeptPkFightEnemyMembers();
        mates = Game._.slice(mates, 0, enemies.length - 1);
        let keys = Game._.keys(this.characters_teammate);

        for (let i = keys.length - 1; i >= mates.length; i--) {
            let uuid = keys[i];
            this._removeCharacter(uuid);
        }
        //更新
        keys = Game._.keys(this.characters_teammate);
        for (let i = 0; i < keys.length; i++) {
            let mate = mates[i];
            let character = this.characters_teammate[keys[i]];
            character.LoadCharacter(
                Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(Game._.get(mate, 'face', 0))),
                [],
                {
                    charName: '[' + Game.UserModel.GetCountryShortName(Game._.get(mate, 'country', 0)) + ']' + Game._.get(mate, 'name', ''),
                    nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                    nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                    septName: '[' + Game._.get(mate, 'septname', '') + ']',
                }
            );
            character.charid = Game._.get(mate, 'charid', 0)
        }
        //创建新的队友
        let shouldGenerateMates = mates.slice(keys.length);
        Game.AsyncGenerator.StartGenerate(Game.AsyncGenerator.Define.SEPTPK_TEAMMATE, 0.2, shouldGenerateMates, function (mate) {
            let pos = this.node_runmap.RandomSomePosition(1)[0];
            let character = this.node_runmap.CreateNpcCharacter({
                pos: pos,
                name: Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(Game._.get(mate, 'face', 0))),
                showAutoFight: false,
                charName: '[' + Game.UserModel.GetCountryShortName(Game._.get(mate, 'country', 0)) + ']' + Game._.get(mate, 'name', ''),
                nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                hp: (Game._.get(mate, 'fight', 1000) / 2)
            });
            character.charid = Game._.get(mate, 'charid', 0);
            this.characters_teammate[character.node.uuid] = character;
            this._findNextEnemyAndRun(character.node.uuid);
        }.bind(this), true);
    },
    _updateFightButton: function () {
        this.node_pkbuttoneffect.active = !this.fighting;
        this.label_attack.setText(this.fighting ? '自动PK' : 'PK');
    },
    //====================  私有函数  ====================
    _findNextEnemyAndRun: function (uuid) {
        if (this.character_me.node.uuid == uuid) {
            if (!this.fighting) {
                this.character_me.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                return false;
            }
            let mydata = Game.SeptPkModel.GetSeptPkFightMyData();
            let max = Game._.get(mydata, 'maxkill', 0);
            let cur = Game._.get(mydata, 'killnum', 0);
            if (cur >= max) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '您的挑战次数已达上限');
                this.fighting = false;
                this._updateFightButton();
                this.character_me.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                return false;
            }
        }
        let keys = Game._.keys(this.characters_enemy);
        let targets = Game._.values(this.characters_target);
        keys = Game._.difference(keys, targets);
        if (keys.length <= 0) {
            cc.log('找不到目标 我也不知道该怎么办了');
            return;
        }
        let target = Game._.sample(keys);
        let nextEnemy = this.characters_enemy[target];
        this.characters_target[uuid] = target;
        this.characters_target[target] = uuid;
        this.round_fight[uuid] = 0;
        this.round_fight[target] = 0;
        let targetPos = cc.p(nextEnemy.node.x > 0 ? nextEnemy.node.x - EnemyDistance : nextEnemy.node.x + EnemyDistance, nextEnemy.node.y + Game.Tools.GetRandomInt(-30, 30));
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
        if (this.node_end.active || (!this.fighting && this.character_me.node.uuid == uuid)) {
            //停了停了 
            character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
            return;
        }
        if (round >= FightRound) {
            //该结束了 不同的角色有不同的处理
            let type = this._getCharacterType(uuid);
            let pos = this.node_runmap.RandomSomePosition(1);
            if (type == CharacterType.Type_Me) {
                //如果是我 那要发消息了
                Game.NetWorkController.SendProto('spk.attNewSeptPk', {
                    charid: enemy.charid,
                });
                character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                //把敌人换个地方
                enemy.node.position = pos[0];
                enemy.SetAttribute({ hp: enemy.GetMaxHp() });
                enemy.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                //清楚敌人的状态

                this._clearEnemy(enemyuuid);
                this._clearEnemy(uuid);
            } else if (type == CharacterType.Type_Teammate) {
                //把敌人换个地方
                enemy.node.position = pos[0];
                enemy.SetAttribute({ hp: enemy.GetMaxHp() });
                enemy.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
                //清楚敌人的状态
                this._clearEnemy(enemyuuid);
                this._clearEnemy(uuid);
                this._findNextEnemyAndRun(uuid);
            } else {
                this._clearEnemy(uuid);
            }
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
        let enemyuuid = this.characters_target[uuid];
        let enemy = this._getCharacterById(enemyuuid);
        if (enemy == null) {
            this._clearEnemy(uuid);
            return;
        }
        let maxhp = enemy.GetMaxHp();
        let damage = Game.Tools.GetRandomInt(Math.ceil(maxhp * 0.2), Math.ceil(maxhp * 0.3));
        enemy.ReduceHp(damage);
        let tip = '<i><outline color=black width=2><color=#ffffff>-' + damage + '</c></outline></i>';
        let pos = this.node_runmap.node.convertToNodeSpaceAR(enemy.GetTipNodeWorldPos());
        Game.TipPoolController.ShowHpTip(tip, pos, this.node_runmap.node);
    },
    _removeCharacter: function (uuid) {
        delete this.characters_enemy[uuid];
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
        }
        return 0;
    }
});
