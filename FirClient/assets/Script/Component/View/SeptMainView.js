const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_septmap: require('../Node/SeptMapNode'),
        characters_npc: { default: {} },
        time_update: { default: 0 },
    },

    onLoad() {
    },

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.character_me = null;
        this.characters_npc = {};
        this.removeNotification();
        Game.AsyncGenerator.StopGenerate(Game.AsyncGenerator.Define.MAINVIEW_CHARACTER);
    },

    onTouchStart: function (event) {
        cc.log('touchstart');
        this.node_septmap.SetTargetPos(this._getCharacterMe().node.uuid, event.getLocation(), true);
    },

    _getCharacterMe: function () {
        if (this.character_me == null) {
            this.character_me = this.node_septmap.GetCharacterMe();
        }
        return this.character_me;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.SEPT_INFO_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SEPT_INFO_REFRESH, this, this.updateView);
    },

    updateView() {
        this._data = Game.SeptModel.septMainData;

        let players = Game._.filter(Game.SeptModel.septMemberData.list, (e) => {
            return e.userid != Game.UserModel.GetCharid();
        });

        let shouldGeneratePlayers = [];
        let showCount = 0;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            let find = false;
            Game._.forIn(this.characters_npc, function (value, key) {
                showCount++;
                if (value != null && value.userid == player.userid) {
                    find = true;
                    return false;
                }
            });
            if (!find) {
                shouldGeneratePlayers.push(player);
            }
        }
        let count = 10 - showCount;
        let list = Game._.slice(shouldGeneratePlayers, 0, count);
        Game.AsyncGenerator.StartGenerate(Game.AsyncGenerator.Define.MAINVIEW_CHARACTER, 0.1, list, function (player) {
            let pos = this.node_septmap.RandomSomePosition(1)[0];
            let character = this.node_septmap.CreateNpcCharacter({
                pos: pos,
                name: Game.UserModel.GetCharacterByOccupation(Game.UserModel.GetOccupation(Game._.get(player, 'face', 0))),
                showAutoFight: false,
                charName: '[' + Game.UserModel.GetCountryShortName(Game._.get(player, 'country', 0)) + ']' + Game._.get(player, 'name', ''),
                nameColor: Game.ItemModel.GetItemLabelColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                nameOutlineColor: Game.ItemModel.GetItemLabelOutlineColor(Game.ItemDefine.ITEMCOLOR.Item_Green),
                hp: (Game._.get(player, 'fight', 1000) / 2)
            });
            character.userid = Game._.get(player, 'userid', 0);
            this.characters_npc[character.node.uuid] = character;
        }.bind(this), true);
    },

    onClickRank() {
        Game.NetWorkController.SendProto('msg.reqSeptSort', {});
    },

    onClickDetail() {
        this.openView(Game.UIName.UI_SEPTINFORMATIONVIEW);
    },

    onClickEscort() {
        Game.NetWorkController.SendProto('septpk.reqSeptGuard', {});
    },

    onClickMember() {
        Game.SeptModel.isOpenSeptMember = true;
        Game.NetWorkController.SendProto('msg.reqSeptMemberList', {
            septid: Game.UserModel.GetSeptId()
        });
    },

    _updateNpcTarget(dt) {
        this.time_update += dt;
        if (this.time_update > 4) {
            this.time_update = 0;
            let movenpc = [];
            Game._.forIn(this.characters_npc, function (value, key) {
                if (Game.Tools.GetRandomInt(0, 100) < 10) {
                    //跑吧
                    movenpc.push(key);
                }
            });
            let poss = this.node_septmap.RandomSomePosition(movenpc.length);
            for (let i = 0; i < movenpc.length; i++) {
                this.node_septmap.SetTargetPos(movenpc[i], poss[i]);
            }
        }
    },

    update: function (dt) {
        this._updateNpcTarget(dt);
    },
});
