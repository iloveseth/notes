const Game = require('../../Game');
require('../GameComponent');

const CombatState = {
    State_Run: 1,                       //向前跑
    State_Fight: 2,                     //战斗
    State_MoveToTarget: 3,              //向ai目标跑
    State_Restore: 4,                   //跑回原位
}
const FootPrintGenInterval = 300;       //脚印生成间隔 ms

cc.Class({
    extends: cc.GameComponent,
    ctor: function () {
        this.mapNode = {
            b_panel_map: null,
            panel_yun_1: null,
            panel_yun_2: null,
            panel_yun_3: null,
            img_shadi: null,
            img_pkmap: null,
            panel_bj: null,
            img_ditu_1: null,
            img_ditu_2: null,
            monster_node: null,
            node_character: null,
            target_node: null,
            hp_node: null,
            node_scroll: null,
            node_rewards: null,
            item_1: null,
            item_2: null,
            item_3: null,
            item_4: null,
            item_5: null,
            item_6: null,
        }
        //我的角色
        this.character = null;
        //地图动画
        this.mapAnimation = null;
        //场景中所有怪物
        this.monsterList = [];
        //我要打的目标怪物
        this.targetMonster = [];
        //战斗状态
        this.state = CombatState.State_Run;
        //角色移动的角度
        this.direction = Game.Define.DIRECTION_TYPE.EAST;
        //移动步长
        this.yun_step = 1;
        this.move_step = 4;//3;
        //脚印
        this.footPrintGenTime = 0;
        this.footPrintIsLeft = true;
        //boss
        this.bossfight = false;
        this.bossfighting = false;
        //是否战胜boss
        this.bosswin = false;
        this.fightround = 0;
        this.misstimes = 0;
        //关卡
        this.levelConfig = null;
        //地图上的奖励
        this.rewardItem = null;
        this.rewardInfo = null;
        //地图上的敌人
        this.enemyChar = null;
        this.enemyMonster = null;
    },
    onLoad: function () {
        //广度遍历所有children
        let children = [
            this.node
        ];
        let keys = Game._.keys(this.mapNode);
        while (children.length > 0) {
            let child = children.shift();
            let name = child.name;
            if (Game._.indexOf(keys, name) != -1 && this.mapNode[name] == null) {
                this.mapNode[name] = child;
            }
            if (child.childrenCount > 0) {
                children = Game._.concat(children, child.children);
            }
        }
        //清空道具
        this._clearRewardItem(this.mapNode.item_1);
        this._clearRewardItem(this.mapNode.item_2);
        this._clearRewardItem(this.mapNode.item_3);
        this._clearRewardItem(this.mapNode.item_4);
        this._clearRewardItem(this.mapNode.item_5);
        this._clearRewardItem(this.mapNode.item_6);
        //设置角色
        this.character = Game.EntityController.GetCharacter();
        this.mapNode.node_character = this.character.node;
        this.mapNode.node_character.x = 0;
        this.mapNode.node_character.y = -400;
        this.mapNode.img_pkmap.addChild(this.mapNode.node_character);
        this.character.LoadCharacter(Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetUserOccupation()),
            Game.FairyModel.GetFightFairys(),
            {
                showAutoFight: true,
                charName: '[' + Game.UserModel.GetCountryShortName(Game.UserModel.GetCountry()) + ']' + Game.UserModel.GetUserName(),
                nameColor: cc.hexToColor(Game.Define.MINE_NAMECOLOR),
                nameOutlineColor: cc.hexToColor(Game.Define.MINE_NAMEOUTLINE)
            }
        );//(Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetUserOccupation()));
        this.character.ChangeState(Game.Define.CHARACTER_STATE.RUN);
        this.character.ChangeDirection(Game.Define.DIRECTION_TYPE.EAST);

        this.mapAnimation = this.node.getComponent(cc.Animation);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_REMOVEMONSTER, this, this._removeMonster);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_CHARACTERHITFRAME, this, this.onCharacterHit);
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_MONSTERANIMAEND, this, this.onMonsterAnimaEnd);
        Game.NetWorkController.SendProto('newfight.reqCurMapEnemy', {});
    },
    update: function () {
        let viewSize = cc.view.getVisibleSize();
        //============  云层滚动  ============
        this._cloudScroll(viewSize);
        //============  角色移动  ============
        this._characterMove(viewSize);
        //============  生成脚印  ============
        this._generateFootPrint();
        //============  地图滚动  ============
        this._mapScroll(viewSize);
        //看看要不要给玩家生成个怪物
        if (this.state == CombatState.State_Run && this.targetMonster.length == 0 && this.levelConfig != null) {
            //生成
            this._generateMonsterGroup();
        }
        //看看要不要给玩家生成地上的奖励
        if (this.rewardItem != null) {
            let worldPos = this.rewardItem.node.parent.convertToWorldSpaceAR(this.rewardItem.node.position);
            if (worldPos.x < -50) {
                this._removeRewardItem();
            }
        }
        if (Game.LevelModel.GetCurMapId() == Game.LevelModel.GetMaxMapId() && this.rewardItem == null && Game.LevelModel.rewardItems.length > 0) {
            let reward = Game.LevelModel.GetRandomReward();
            if (reward != null) {
                this.rewardItem = this._generateRewarditem(reward);
                if (this.rewardItem != null) {
                    this.rewardInfo = reward;
                }
            }
        }
        if (this.enemyChar == null && !this.bossfight) {
            //生成一个看看
            let enemyData = Game.LevelModel.GetFirstEnemy();
            if (enemyData != null) {
                if (Game.LevelModel.mapEnemies.length == 0) {
                    //原来有 现在没了 那就再请求吧
                    Game.NetWorkController.SendProto('newfight.reqCurMapEnemy', {});
                }
                //生成吧
                this.enemyChar = this._generateEnemy(enemyData);
            }
        }
        this._autoPickup();
    },
    onDestroy: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_REMOVEMONSTER, this, this._removeMonster);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERHITFRAME, this, this.onCharacterHit);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_MONSTERANIMAEND, this, this.onMonsterAnimaEnd);
        if (this.character) {
            Game.EntityController.ReleaseCharacter(this.character);
        }
        if (this.enemyChar) {
            Game.EntityController.ReleaseCharacter(this.enemyChar);
        }
        for (let i = 0; i < this.targetMonster.length; i++) {
            let monster = this.targetMonster[i];
            Game.EntityController.ReleaseMonster(monster);
        }
        if (this.enemyMonster != null) {
            Game.EntityController.ReleaseMonster(this.enemyMonster);
        }
    },
    //====================  对外接口  ====================
    SetLevelConfig: function (config) {
        this.levelConfig = config;
    },
    GetLevelId: function () {
        return Game._.get(this, 'levelConfig.id', 0);
    },
    GetBossRewardsWorldPosition: function () {
        let ret = [];
        for (let i = 0; i < this.mapNode.node_rewards.childrenCount; i++) {
            let node = this.mapNode.node_rewards.children[i];
            ret.push(node.parent.convertToWorldSpaceAR(node.position));
        }
        return ret;
    },
    CanFightBoss: function () {
        return !this.bossfight;
    },
    FightBoss: function (result) {
        if (this.bossfight) {
            //正在打
            return false;
        }
        this.bosswin = result;
        //移除所有我的目标怪物吧
        while (this.targetMonster.length > 0) {
            let monster = this.targetMonster[0];
            this._removeMonster(monster);
        }
        if (this.enemyChar) {
            Game.EntityController.ReleaseCharacter(this.enemyChar);
            this.enemyChar = null;
        }
        if (this.enemyMonster != null) {
            Game.EntityController.ReleaseMonster(this.enemyMonster);
            this.enemyMonster = null;
        }
        if (this.state == CombatState.State_Run) {
            this._generateBoss();
        }
        this.bossfight = true;
        this.fightround = 0;
        this.misstimes = 0;
        this.character.SetAttribute({ hp: Game.UserModel.GetUserBaseInfo().hp });
        return true;
    },
    PlayLevelupAnima: function () {
        this.character.PlayerLevelup();
    },
    //====================  回调类函数  ====================
    onCharacterAnimaEnd: function (animaName, uuid) {
        if (Game.EntityController.IsCharacterAttackAnima(animaName)) {
            if (uuid == Game._.get(this, 'enemyChar.node.uuid', 0)) {
                if (this.state != CombatState.State_MoveToTarget) {
                    //别停继续打
                    this.enemyChar.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
                }
            } else {
                if (!this._isFightEnd()) {
                    let name = this.character._playAnimation();
                    if (name == 'skill') {
                        this.mapAnimation.play('MapDropDown' + Game.UserModel.GetFace());
                    }
                } else {
                    if (this.bossfight && !this.bossfighting) {
                        this._generateBoss();
                    }
                    this._changeGameState(CombatState.State_Run);
                }
            }

        }
    },
    onCharacterHit: function (uuid, name) {
        if (uuid != Game._.get(this, 'character.node.uuid', 0)) {
            return;
        }
        if (this._isAllMonsterDie()) {
            return;
        }
        let willDie = (name == 'kill');
        for (let i = 0; i < this.targetMonster.length; i++) {
            let monster = this.targetMonster[i];
            let maxhp = monster.GetMaxHp();
            let damage = 0;
            let violent = false;
            let pos = cc.p(0, 0);
            let tip = '';
            if (this.bossfight) {
                //是不是miss
                this.fightround++;
                let miss = Game.Tools.GetRandomInt(0, 100) < 5; //5%
                if (miss) {
                    tip = '<i><outline color=black width=2><color=#ffffff>Miss</outline></i>';
                    pos = this.mapNode.hp_node.convertToNodeSpaceAR(Game.Tools.GetRandomResult() ? this.character.GetTipNodeWorldPos() : monster.GetTipNodeWorldPos());
                    Game.TipPoolController.ShowHpTip(tip, pos, this.mapNode.hp_node);
                    this.misstimes++;
                } else {
                    //打中吧
                    let charactermaxhp = this.character.GetMaxHp();
                    violent = Game.Tools.GetRandomInt(0, 10) < 2; // 20%
                    //大中谁
                    let hitboss = Game.Tools.GetRandomResult();
                    if (hitboss) {
                        damage = Game.Tools.GetRandomInt(Math.ceil(maxhp * 0.2), Math.ceil(maxhp * 0.3));
                        damage = violent ? damage * 2 : damage;
                        if (!this.bosswin && monster.GetCurHp() <= damage) {
                            //要打死boss了 但我没赢，那就转移吧
                            hitboss = false;
                            damage = Game.Tools.GetRandomInt(Math.ceil(charactermaxhp * 0.2), Math.ceil(charactermaxhp * 0.3));
                            damage = violent ? damage * 2 : damage;
                        }
                    } else {
                        damage = Game.Tools.GetRandomInt(Math.ceil(charactermaxhp * 0.2), Math.ceil(charactermaxhp * 0.3));
                        damage = violent ? damage * 2 : damage;
                        if (this.bosswin && this.character.GetCurHp() < damage) {
                            //我要被打死啦 但我要赢 转移
                            hitboss = true;
                            damage = Game.Tools.GetRandomInt(Math.ceil(maxhp * 0.2), Math.ceil(maxhp * 0.3));
                            damage = violent ? damage * 2 : damage;
                        }
                    }
                    if (violent) {
                        tip = '<i><outline color=black width=2><color=#ff0000>暴击' + damage + '</c></outline></i>';
                    } else {
                        tip = '<i><outline color=black width=2><color=#ffffff>-' + damage + '</c></outline></i>';
                    }
                    if (hitboss) {
                        if (monster.ReduceHp(damage) > 0) {
                            monster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.HURT);
                        } else {
                            monster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.DIE);
                        }
                        pos = this.mapNode.hp_node.convertToNodeSpaceAR(monster.GetTipNodeWorldPos());
                        Game.TipPoolController.ShowHpTip(tip, pos, this.mapNode.hp_node);
                    } else {
                        if (this.character.ReduceHp(damage) <= 0) {
                            //我死啦 派发事件
                            Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_ROLEDIE,
                                this.fightround,
                                monster.GetMaxHp(),
                                monster.GetCurHp(),
                                this.misstimes
                            );
                            //移除所有我的目标怪物吧
                            while (this.targetMonster.length > 0) {
                                let monster = this.targetMonster[0];
                                this._removeMonster(monster);
                            }
                        }
                        pos = this.mapNode.hp_node.convertToNodeSpaceAR(this.character.GetTipNodeWorldPos());
                        Game.TipPoolController.ShowHpTip(tip, pos, this.mapNode.hp_node);
                    }
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_REDUCEHP,
                        hitboss,
                        hitboss ? monster.GetMaxHp() : this.character.GetMaxHp(),
                        hitboss ? monster.GetCurHp() : this.character.GetCurHp()
                    );
                }
            } else {
                damage = Game.Tools.GetRandomInt(Math.ceil(maxhp * 0.2), Math.ceil(maxhp * 0.3));
                violent = Game.Tools.GetRandomInt(0, 10) < 2; // 20%
                damage = violent ? damage * 2 : damage;

                if (violent) {
                    tip = '<i><outline color=black width=2><color=#ff0000>暴击' + damage + '</c></outline></i>';
                } else {
                    tip = '<i><outline color=black width=2><color=#ffffff>-' + damage + '</c></outline></i>';
                }
                pos = this.mapNode.hp_node.convertToNodeSpaceAR(monster.GetTipNodeWorldPos());
                Game.TipPoolController.ShowHpTip(tip, pos, this.mapNode.hp_node);
                if (willDie) {
                    if (monster.ReduceHp(damage) > 0) {
                        monster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.HURT);
                    } else {
                        monster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.DIE);
                    }
                } else {
                    monster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.HURT);
                }
            }
        }
    },
    onMonsterAnimaEnd: function (animaName, uuid) {
        if (animaName == 'hurt') {
            //受击完了 死没死
            let index = Game._.findIndex(this.monsterList, function (o) {
                return Game._.get(o, 'node.uuid', '') == uuid;
            });
            if (index == -1) {
                return;
            }
            let monster = this.monsterList[index];
            if (monster.IsDie()) {
                monster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.DIE);
            } else {
                monster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.ATTACK);
            }
        }
    },
    onRewardItemClick: function () {
        //播放动画 发消息
        let id = Game._.get(this.rewardInfo, 'id', null);
        Game.LevelModel.RemoveMapReward(id);
        if (id != null) {
            Game.NetWorkController.SendProto('sobj.getSceneObj', { id: id });
        }
        if (this.rewardItem) {
            this.rewardItem.HideAnimaAndName();
            let worldPos = this.rewardItem.node.parent.convertToWorldSpaceAR(this.rewardItem.node.position);
            this.rewardItem.node.removeFromParent(false);
            this.mapNode.b_panel_map.addChild(this.rewardItem.node);
            this.rewardItem.node.position = this.mapNode.b_panel_map.convertToNodeSpaceAR(worldPos);
            this.rewardItem.node.runAction(cc.sequence([
                cc.moveTo(0.5, 0, -700),
                cc.callFunc(this._removeRewardItem, this)
            ]))
        }
    },
    //====================  数据计算类函数  ====================
    //计算地图移动的距离
    _calculateMapMove: function () {
        if (this.state == CombatState.State_Run) {
            switch (this.direction) {
                case Game.Define.DIRECTION_TYPE.EAST:
                    return this.move_step;
                case Game.Define.DIRECTION_TYPE.NORTHEAST:
                    return this.move_step * Math.sin(Math.PI / 2)
                case Game.Define.DIRECTION_TYPE.SOUTHEAST:
                    return this.move_step * Math.sin(Math.PI / 2)
                default:
                    return 0
            }
        } else {
            return 0;
        }
    },
    //改变角色方向
    _changeDirection: function (dir) {
        if (this.direction != dir) {
            this.direction = dir;
            this.character.ChangeDirection(dir);
        }
    },
    //改变游戏状态
    _changeGameState: function (state) {
        if (this.state != state) {
            this.state = state;
            switch (state) {
                case CombatState.State_Run: {
                    this.footPrintGenTime = Game.TimeController.GetCurTimeMs();
                    this.footPrintIsLeft = true;
                    this.character.ChangeState(Game.Define.CHARACTER_STATE.RUN);
                    break;
                }
                case CombatState.State_Fight: {
                    let name = this.character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK);
                    if (name == 'skill') {
                        this.mapAnimation.play('MapDropDown' + Game.UserModel.GetFace());
                    }
                    for (let i = 0; i < this.targetMonster.length; i++) {
                        let monster = this.targetMonster[i];
                        monster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.ATTACK);
                    }
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_STARTFIGHT, this.bossfight);
                    break;
                }
                case CombatState.State_MoveToTarget: {
                    break;
                }
                case CombatState.State_Restore: {
                    break;
                }
                default:
                    break;
            }
        }
    },
    //战斗结束没有
    _isFightEnd: function () {
        let diffx = this.mapNode.node_character.x - this.mapNode.target_node.x
        return (this.state == CombatState.State_Fight && this._isAllMonsterDie()) || Math.abs(diffx) > 5;
    },
    _isAllMonsterDie: function () {
        let monsterAllDies = true;
        for (let i = 0; i < this.targetMonster.length; i++) {
            let monster = this.targetMonster[i];
            if (monster.GetCurHp() > 0) {
                monsterAllDies = false;
            }
        }
        return monsterAllDies;
    },
    //====================  节点控制类函数  ====================
    //生成怪物组
    _generateMonsterGroup: function () {
        let viewSize = cc.view.getVisibleSize();
        let monsterStr = Game._.get(this, 'levelConfig.num', '');
        let monsterIds = monsterStr.split('-');
        let count = monsterIds.length;
        let posx = viewSize.width / 2 + 200;
        let posy = Game.Tools.GetRandomInt(-600, -300);
        this.targetMonster = [];
        for (let i = 0; i < count; i++) {
            let monsterconf = Game.ConfigController.GetConfigById('npcdata', parseInt(monsterIds[i]));
            let monster = Game.EntityController.CreateMonster(monsterconf, { showhp: true, hp: Game.UserModel.GetUserBaseInfo().minatt * 5 })
            monster.node.x = posx + Game.Tools.GetRandomInt(-10, 10);
            monster.node.y = posy - Game.Tools.CalculateArrange(count, i, 50);
            this.mapNode.monster_node.addChild(monster.node);
            this.targetMonster.push(monster);
            this.monsterList.push(monster);
        }
        this.mapNode.target_node.position = cc.p(viewSize.width / 2, posy);
    },
    //生成boss
    _generateBoss: function () {
        this.bossfighting = true;
        let bossconf = Game.ConfigController.GetConfigById('newboss_data', Game._.get(this, 'levelConfig.boss', 0));
        let viewSize = cc.view.getVisibleSize();
        let posx = viewSize.width / 2 + 200;
        let boss = Game.EntityController.CreateMonster(bossconf, { hp: Game.UserModel.GetUserBaseInfo().minatt * 6 });
        boss.node.x = posx + Game.Tools.GetRandomInt(-10, 10);
        boss.node.y = -400;
        this.mapNode.monster_node.addChild(boss.node);
        this.targetMonster.push(boss);
        this.monsterList.push(boss);
        this.mapNode.target_node.position = cc.p(posx - 200, -400);
    },
    //生成脚印
    _generateFootPrint: function () {
        if (this.state == CombatState.State_Run) {
            let curTimeMs = Game.TimeController.GetCurTimeMs();
            if (curTimeMs - this.footPrintGenTime > FootPrintGenInterval) {
                //生成
                this.footPrintGenTime = curTimeMs;
                let pos = this.mapNode.node_scroll.convertToNodeSpaceAR(this.character.GetFootPrintWorldPos());
                Game.TipPoolController.ShowFootPrint(pos, Game.Define.DIRECTION_ROTATION[this.direction], this.footPrintIsLeft, this.mapNode.node_scroll);
                this.footPrintIsLeft = !this.footPrintIsLeft;
            }
        }
    },
    //移除一个怪物
    _removeMonster: function (monster) {
        let uuid = Game._.get(monster, 'node.uuid', '');
        let index = Game._.findIndex(this.monsterList, function (o) {
            return Game._.get(o, 'node.uuid', '') == uuid;
        });
        if (index != -1) {
            this.monsterList.splice(index, 1);
        }

        index = Game._.findIndex(this.targetMonster, function (o) {
            return Game._.get(o, 'node.uuid', '') == uuid;
        });
        if (index != -1) {
            this.targetMonster.splice(index, 1);
        }

        if (this.bossfight && monster.IsBoss() && this.targetMonster.length == 0) {
            this.bossfighting = false;
            if (this.bosswin) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.LEVEL_BEATBOSS);
            }
            this.bossfight = false;
        }
        Game.EntityController.ReleaseMonster(monster);
    },
    //地上的宝箱
    _generateRewarditem: function (info) {
        let objid = Game._.get(info, 'objid', 0);
        let parent = this._getNextRewardNode();
        if (parent != null && objid != 0) {
            let define = Game.ConfigController.GetConfigById('object_data', objid);
            if (define != null) {
                let tip = Game.TipPoolController.GetTipMapRewardItem(objid, this.onRewardItemClick.bind(this));
                if (tip != null) {
                    parent.addChild(tip.node);
                }
                return tip;
            }
        }
        return null;
    },
    _clearRewardItem: function (node) {
        if (node != null) {
            let spr = node.getComponent(cc.Sprite);
            if (spr) {
                spr.spriteFrame = null;
            }
        }
        this.rewardItem = null;
        this.rewardInfo = null;
    },
    _removeRewardItem: function () {
        if (this.rewardItem != null) {
            Game.TipPoolController.TipMapRewardEnd(this.rewardItem);
            this.rewardItem = null;
            this.rewardInfo = null;
        }
    },
    //地图上的敌人
    _generateEnemy: function (data) {
        let character = Game.EntityController.GetCharacter();
        let node = character.node;
        let viewSize = cc.view.getVisibleSize();
        let posy = Game.Tools.GetRandomInt(-600, -300);
        let posx = viewSize.width / 2 + 600;
        node.x = posx;
        node.y = posy;
        this.mapNode.monster_node.addChild(node);
        character.LoadCharacter(Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(Game._.get(data, 'face', 0))),
            [],
            {
                showAutoFight: false,
                charName: '[' + Game.UserModel.GetCountryShortName(Game._.get(data, 'country', 0)) + ']' + Game._.get(data, 'name', 0),
                nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
                nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
            }
        );//(Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetUserOccupation()));
        let ismonsterleft = Game.Tools.GetRandomResult();
        //给他一个怪物 让他自动攻击
        let monsterStr = Game._.get(this, 'levelConfig.num', '');
        let monsterIds = monsterStr.split('-');
        let monsterconf = Game.ConfigController.GetConfigById('npcdata', parseInt(monsterIds[0]));
        this.enemyMonster = Game.EntityController.CreateMonster(monsterconf, { showhp: false })
        this.enemyMonster.node.x = ismonsterleft ? posx - 200 : posx + 200;
        this.enemyMonster.node.y = posy;
        this.mapNode.monster_node.addChild(this.enemyMonster.node);
        character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
        character.ChangeDirection(ismonsterleft ? Game.Define.DIRECTION_TYPE.WEST : Game.Define.DIRECTION_TYPE.EAST);
        this.enemyMonster.ChangeState(Game.Define.MONSTER_ANIMA_STATE.ATTACK);
        this.enemyMonster.ChangeDirection(ismonsterleft ? Game.Define.DIRECTION_TYPE.EAST : Game.Define.DIRECTION_TYPE.WEST);
        return character;
    },
    _removeEnemy: function () {
        if (this.enemyChar != null) {
            Game.EntityController.ReleaseCharacter(this.enemyChar);
            this.enemyChar = null;
        }
        this._removeEnemyMonster();
    },
    _removeEnemyMonster: function () {
        if (this.enemyMonster) {
            Game.EntityController.ReleaseMonster(this.enemyMonster);
            this.enemyMonster = null;
        }
    },
    //====================  移动类函数  ====================
    //云层移动
    _cloudScroll: function (viewSize) {
        if (this.mapNode.panel_yun_1 && this.mapNode.panel_yun_2 && this.mapNode.panel_yun_3) {
            if (this.mapNode.panel_yun_1.x <= -(this.mapNode.panel_yun_1.width + viewSize.width / 1.5)) {
                this.mapNode.panel_yun_1.x = this.mapNode.panel_yun_2.x + this.mapNode.panel_yun_2.width;
            }
            else if (this.mapNode.panel_yun_2.x <= -(this.mapNode.panel_yun_2.width + viewSize.width / 1.5)) {
                this.mapNode.panel_yun_2.x = this.mapNode.panel_yun_1.x + this.mapNode.panel_yun_1.width;
            }

            this.mapNode.panel_yun_1.x = this.mapNode.panel_yun_1.x - 1;
            this.mapNode.panel_yun_2.x = this.mapNode.panel_yun_2.x - 1;

            if (this.mapNode.panel_yun_3.x <= -this.mapNode.panel_yun_3.width + viewSize.width / 1.5) {
                this.mapNode.panel_yun_3.x = this.mapNode.panel_yun_3.width;
            }
            this.mapNode.panel_yun_3.x = this.mapNode.panel_yun_3.x - this.yun_step;
        }
    },
    //角色移动
    _characterMove: function (viewSize) {
        switch (this.state) {
            case CombatState.State_Run: {
                let monsterAllDies = true;
                for (let i = 0; i < this.targetMonster.length; i++) {
                    let monster = this.targetMonster[i];
                    if (monster.GetCurHp() > 0) {
                        monsterAllDies = false;
                    }
                }
                if (this.targetMonster.length > 0 && !monsterAllDies) {
                    //往目标点移动吧
                    let diffy = this.mapNode.node_character.y - this.mapNode.target_node.y
                    let dir = Game.Define.DIRECTION_TYPE.EAST;
                    if (Math.abs(diffy) > 5) {
                        if (diffy < 0) {
                            dir = Game.Define.DIRECTION_TYPE.NORTHEAST;
                            this.mapNode.node_character.y += this.move_step * Math.sin(Math.PI / 4);
                        } else {
                            dir = Game.Define.DIRECTION_TYPE.SOUTHEAST;
                            this.mapNode.node_character.y -= this.move_step * Math.sin(Math.PI / 4);
                        }
                    }
                    //计算背景的位置
                    let movey = this.mapNode.node_character.y + 400;
                    this.mapNode.img_shadi.y = -900 + movey / 5;
                    this._changeDirection(dir);
                    let diffx = this.mapNode.node_character.x - this.mapNode.target_node.x
                    if (Math.abs(diffx) <= 5) {
                        //到达目标点
                        this._changeGameState(CombatState.State_Fight)
                    }
                }
                break;
            }
            case CombatState.State_Fight:
                break;
            case CombatState.State_MoveToTarget:
                break;
            case CombatState.State_Restore:
                break;
        }

    },
    //地图滚动
    _mapScroll: function (viewSize) {
        let mapstep = this._calculateMapMove();
        if (mapstep != 0) {
            if (this.mapNode.img_ditu_1.x < -viewSize.width / 1.5) {
                this.mapNode.img_ditu_1.x = this.mapNode.img_ditu_2.x + this.mapNode.img_ditu_2.width;
            } else if (this.mapNode.img_ditu_2.x < -viewSize.width / 1.5) {
                this.mapNode.img_ditu_2.x = this.mapNode.img_ditu_1.x + this.mapNode.img_ditu_1.width;
            }
            this.mapNode.img_ditu_1.x = this.mapNode.img_ditu_1.x - mapstep;
            this.mapNode.img_ditu_2.x = this.mapNode.img_ditu_2.x - mapstep;
            //============  配件滚动  ============
            if (this.mapNode.panel_bj.x < -(this.mapNode.panel_bj.width + viewSize.width / 1.5)) {
                this.mapNode.panel_bj.x = viewSize.width / 1.5;
            }
            this.mapNode.panel_bj.x = this.mapNode.panel_bj.x - mapstep;
            //============  目标点移动 ============
            this.mapNode.target_node.x = this.mapNode.target_node.x - mapstep;
            //============  怪物滚动  ============
            let removedList = [];
            for (let i = 0; i < this.monsterList.length; i++) {
                let monster = this.monsterList[i];
                monster.node.x = monster.node.x - mapstep
                if (monster.node.x < -viewSize.width / 2 - 50) {
                    //超出地图范围咯
                    removedList.push(monster);
                }
            }
            for (let i = 0; i < removedList.length; i++) {
                this._removeMonster(removedList[i]);
            }
            //============ 我的敌人滚动 =============
            if (this.enemyChar != null) {
                this.enemyChar.node.x = this.enemyChar.node.x - mapstep;
            }
            if (this.enemyMonster != null) {
                this.enemyMonster.node.x = this.enemyMonster.node.x - mapstep;
            }
            if (this.enemyChar != null && this.enemyChar.node.x < -viewSize.width / 2 - 300) {
                this._removeEnemy();
            }
            //============  其余在node_scroll下的所有节点的滚动  ============
            Game._.forEach(this.mapNode.node_scroll.children, function (node) {
                node.x = node.x - mapstep;
            });
        }
    },
    //====================  私有函数  ====================
    _getNextRewardNode: function () {
        let viewSize = cc.view.getVisibleSize();
        for (let i = 1; i <= 6; i++) {
            let node = Game._.get(this, 'mapNode.item_' + i, null);
            if (node) {
                let worldPos = node.parent.convertToWorldSpaceAR(node.position);
                if (worldPos.x > viewSize.width + 20) {
                    return node;
                }
            }
        }
        return null;
    },
    _autoPickup: function () {
        //自动拾取道具
        if (Game.UserModel.GetVipValue('maploot') == 0 || !Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_AUTOPICK)) {
            return;
        }
        let viewSize = cc.view.getVisibleSize();
        if (this.rewardInfo != null && this.rewardItem != null) {
            let worldPos = this.rewardItem.node.parent.parent.convertToWorldSpaceAR(this.rewardItem.node.parent.position);
            if (this.rewardItem.node.active && this.rewardItem.node.getNumberOfRunningActions() == 0 && worldPos.x < viewSize.width * 3 / 4) {
                //可以了 自动捡吧
                this.onRewardItemClick();
            }
        }
    }
});
