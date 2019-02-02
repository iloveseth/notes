const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Node_bottom: { default: null, type: cc.Node },
        Button_back: { default: null, type: cc.Button_ },
        node_battlehp: { default: null, type: require('../Node/BattleHpNode') },
        Node_character_1: { default: null, type: cc.Node },
        Node_character_2: { default: null, type: cc.Node },
    },

    onLoad: function () {

    },

    start() {
    },

    update(dt) {
        // this.timer = this.timer + dt;
        // if(this.timer > 15){
        //     //预处理，等待x秒没有返回自动胜利失败关闭界面
        //     Game.ViewController.CloseView(Game.UIName.UI_FIGHT_RESULT_EFFECT_NODE,true);
        //     Game.ViewController.CloseView(Game.UIName.UI_FIGHT_RESULT_LOSE_NODE,true);

        //     //请求刷新竞技场界面信息
        //     Game.NetWorkController.SendProto('pvp.ReqPvpInfo', {});
        //     this.closeView(this._url,true);
        // }
    },

    lateUpdate(dt) {
    },

    onDestroy() {
    },

    onEnable() {
        this.initNotification();
        this.initView();
    },

    onDisable() {
        this.removeNotification();
        if (this.mine_character != null) {
            Game.EntityController.ReleaseCharacter(this.mine_character);
        }
        if (this.enemy_character != null) {
            Game.EntityController.ReleaseCharacter(this.mine_character);
        }
        Game.NetWorkController.SendProto('msg.reqDayReward', {});
    },

    initNotification() {
        Game.NetWorkController.AddListener('pvp.FightResult', this, this.onFightResult);//返回竞技场挑战结果
        Game.NotificationController.On(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('pvp.FightResult', this, this.onFightResult);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
    },

    initView() {
        this.timer = 0;
        this.hitNum = 0;
        this.Button_back.node.active = false;
        this.Node_bottom.active = false;
        this.node.runAction(cc.sequence([
            cc.callFunc(function () {
                //显示血槽
                this._updatePkInfo(true);

                //显示人物
                this.mine_character = Game.EntityController.GetCharacter();
                this.enemy_character = Game.EntityController.GetCharacter();
                this.node_mine_character = this.mine_character.node;
                this.node_enemy_character = this.enemy_character.node;
                this.Node_character_1.addChild(this.node_mine_character);
                this.Node_character_2.addChild(this.node_enemy_character);
                this.node_mine_character.position = cc.p(-370, 0);
                this.node_enemy_character.position = cc.p(370, 0);

                this.mine_uuid = this.node_mine_character.uuid;
                this.enemy_uuid = this.node_enemy_character.uuid;

                // this.node_mine_character.runAction(cc.moveTo(2, 0, 0));
                // this.node_enemy_character.runAction(cc.moveTo(2, 0, 0));

                this.mine_character = this.node_mine_character.getComponent('Character');
                this.enemy_character = this.node_enemy_character.getComponent('Character');
                this.mine_character.LoadCharacter(Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetUserOccupation()),
                    Game.FairyModel.GetFightFairys(),
                    {
                        showAutoFight: false,
                        charName: '[' + Game.UserModel.GetCountryShortName(Game.UserModel.GetCountry()) + ']' + Game.UserModel.GetUserName(),
                        nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                        nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                    }
                );
                this.enemy_character.LoadCharacter(Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(this._data.face)),
                    [],
                    {
                        showAutoFight: false,
                        charName: '[' + Game.UserModel.GetCountryShortName(this._data.country) + ']' + this._data.name,
                        nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
                        nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Red),
                    }
                );
                this.mine_character.ChangeState(Game.Define.CHARACTER_STATE.RUN);
                this.mine_character.ChangeDirection(Game.Define.DIRECTION_TYPE.EAST);
                this.enemy_character.ChangeState(Game.Define.CHARACTER_STATE.RUN);
                this.enemy_character.ChangeDirection(Game.Define.DIRECTION_TYPE.WEST);

                this.node_mine_character.runAction(cc.moveTo(2, 0, 0));
                this.node_enemy_character.runAction(cc.moveTo(2, 0, 0));

                this.mine_character.label_name.string = "";
                this.enemy_character.label_name.string = "";
            }, this),
            cc.delayTime(2),
            cc.callFunc(function () {
                //人物战斗动作
                this.mine_character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
                this.enemy_character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
            }, this)
            // cc.delayTime(1),
            // cc.callFunc(function () {
            //     //血槽扣血
            //     let maxHP = Game.UserModel.GetUserBaseInfo().hp;
            //     let myHp = Math.floor(maxHP*0.46);
            //     let enemyHp = Math.floor(maxHP*0.58);
            //     this.node_battlehp.SetRoleHp(myHp, maxHP);
            //     this.node_battlehp.SetNpcHp(enemyHp, maxHP);

            //     //人物扣血
            //     let tip_mine = '<i><outline color=black width=2><color=#ffffff>-' + Math.floor(maxHP*0.54) + '</c></outline></i>';
            //     let tip_enemy = '<i><outline color=black width=2><color=#ffffff>-' + Math.floor(maxHP*0.42) + '</c></outline></i>';
            //     let pos_1 = cc.p(0,50);
            //     Game.TipPoolController.ShowHpTip(tip_mine, pos_1, this.Node_character_1);
            //     Game.TipPoolController.ShowHpTip(tip_enemy, pos_1, this.Node_character_2);

            // }, this),
            // cc.delayTime(2),
            // cc.callFunc(function () {
            //     //发送pk消息
            //     let msg = {};
            //     msg.revenge = this._data.revenge;
            //     msg.charid = this._data.charid;
            //     msg.rank = this._data.rank;
            //     Game.NetWorkController.SendProto('pvp.FightPvp', msg);
            // }, this)
        ]));




    },

    _updatePkInfo: function (show) {
        if (!show) {
            this.node_battlehp.node.active = false;
        } else {
            this.node_battlehp.node.active = true;
            let role = {
                face: Game.UserModel.GetProfessionIcon(Game.UserModel.GetUserOccupation()),
                name: Game.UserModel.GetUserName(),
                hp: Game.UserModel.GetUserBaseInfo().hp,
                mp: Game.UserModel.GetUserBaseInfo().mp
            };
            let npc = {
                face: Game.UserModel.GetProfessionIcon(Game.UserModel.GetOccupation(this._data.face)),
                name: this._data.name,
                hp: Game.UserModel.GetUserBaseInfo().hp,
                mp: Game.UserModel.GetUserBaseInfo().mp
            };
            this.node_battlehp.SetInfo(role, npc);
        }
    },


    //====================  这是分割线  ====================

    onFightResult(msgid, data) {
        cc.log("GymAnimationView onFightResult");

        // this.node.runAction(cc.sequence([
        //     cc.callFunc(function () {
        //         //结束虚拟战斗


        //     }, this),
        //     cc.delayTime(0),
        //     cc.callFunc(function () {
        //         //隐藏血条
        //         // this._updatePkInfo(false);

        //         //隐藏人物


        //     }, this),
        //     cc.delayTime(0),
        //     cc.callFunc(function () {
        //         //打开胜利失败界面
        //         let mine_name = Game.UserModel.GetUserName();
        //         if(data.winname == mine_name){
        //             let sendData = {};
        //             sendData.FightResult = data;
        //             sendData.typeIndex = Game.Define.ENUMF_TYPE.typePvp;
        //             this.openMaskView(Game.UIName.UI_FIGHT_RESULT_EFFECT_NODE,sendData);
        //             this.node_battlehp.SetNpcHp(0, Game.UserModel.GetUserBaseInfo().hp);
        //         }else{
        //             let sendData = {};
        //             sendData.FightResult = data;
        //             sendData.typeIndex = Game.Define.DEATH_TYPE.DeatnType_PVP;
        //             this.openMaskView(Game.UIName.UI_FIGHT_RESULT_LOSE_NODE,sendData);
        //             this.node_battlehp.SetRoleHp(0, Game.UserModel.GetUserBaseInfo().hp);
        //         }
        //     }, this)
        // ]))

        Game.NotificationController.Off(Game.Define.EVENT_KEY.LEVEL_CHARACTERANIMAEND, this, this.onCharacterAnimaEnd);
        //打开胜利失败界面
        let mine_name = Game.UserModel.GetUserName();
        if (data.winname == mine_name) {
            let sendData = {};
            sendData.FightResult = data;
            sendData.typeIndex = Game.Define.ENUMF_TYPE.typePvp;
            this.openMaskView(Game.UIName.UI_FIGHT_RESULT_EFFECT_NODE, sendData);
            this.node_battlehp.SetNpcHp(0, Game.UserModel.GetUserBaseInfo().hp);
        } else {
            let sendData = {};
            sendData.FightResult = data;
            sendData.typeIndex = Game.Define.DEATH_TYPE.DeatnType_PVP;
            this.openMaskView(Game.UIName.UI_FIGHT_RESULT_LOSE_NODE, sendData);
            this.node_battlehp.SetRoleHp(0, Game.UserModel.GetUserBaseInfo().hp);
        }

    },

    onCharacterAnimaEnd(animaName, uuid) {
        if (!Game.EntityController.IsCharacterAttackAnima(animaName)) { return };

        this.hitNum = this.hitNum + 1;


        let maxHP = Game.UserModel.GetUserBaseInfo().hp;
        let myHp = Math.floor(maxHP * 0.46);
        let enemyHp = Math.floor(maxHP * 0.58);
        let pos_1 = cc.p(0, 50);
        if (uuid == this.mine_uuid) {
            //血槽扣血
            this.node_battlehp.SetRoleHp(myHp, maxHP);
            //人物扣血
            let tip_mine = '<i><outline color=black width=2><color=#ffffff>-' + Math.floor(maxHP * 0.54) + '</c></outline></i>';
            Game.TipPoolController.ShowHpTip(tip_mine, pos_1, this.Node_character_1);
        } else if (uuid == this.enemy_uuid) {
            this.node_battlehp.SetNpcHp(enemyHp, maxHP);
            let tip_enemy = '<i><outline color=black width=2><color=#ffffff>-' + Math.floor(maxHP * 0.42) + '</c></outline></i>';
            Game.TipPoolController.ShowHpTip(tip_enemy, pos_1, this.Node_character_2);
        };

        if (this.hitNum == 2) {
            this.mine_character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
            this.enemy_character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
        } else if (this.hitNum == 4) {
            this.mine_character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
            this.enemy_character.ChangeState(Game.Define.CHARACTER_STATE.ATTACK, 'attack01');
            //发送pk消息
            let msg = {};
            msg.revenge = this._data.revenge;
            msg.charid = this._data.charid;
            msg.rank = this._data.rank;
            Game.NetWorkController.SendProto('pvp.FightPvp', msg);
        } else if (this.hitNum > 4) {
            this.mine_character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
            this.enemy_character.ChangeState(Game.Define.CHARACTER_STATE.IDLE);
        };

    },


    onBtn_back_click() {
        //请求刷新竞技场界面信息
        Game.NetWorkController.SendProto('pvp.ReqPvpInfo', {});
        this.closeView(this._url, true);
    },




});
