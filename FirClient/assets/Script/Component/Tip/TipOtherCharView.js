const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,
    properties: {
        labels_info: { default: null, type: require('../CustomNode/ArrayNode') },
        sprite_head: { default: null, type: cc.Sprite_ },
        sprite_occupation: { default: null, type: cc.Sprite_ }
    },
    onEnable: function () {
        cc.log(this._data);
        let info = [
            Game._.get(this, '_data.name', ''),
            Game.UserModel.GetJobName(Game.UserModel.GetOccupation(Game._.get(this, '_data.face', 0))),
            Game._.get(this, '_data.fight', 0),
            Game.UserModel.GetLevelDesc(Game._.get(this, '_data.level', 0)),
            Game._.get(this, '_data.septname', '') == '' ? '暂无' : Game._.get(this, '_data.septname', '')
        ];
        this.labels_info.SetInfo(info);
        let occupation = Game.UserModel.GetOccupation(Game._.get(this, '_data.face', 0));
        this.sprite_head.SetSprite(Game.UserModel.GetProfessionIcon(occupation));
        this.sprite_occupation.SetSprite(Game.UserModel.GetJobIcon(occupation));
    },
    onDisable: function () {

    },
    //====================  按钮回调  ====================
    onClickView: function () {
        Game.UserModel.observePlayer(Game._.get(this, '_data.charid', 0));
        // Game.NetWorkController.SendProto('msg.ObserveUserInfo', { charid: Game._.get(this, '_data.charid', 0) });
        this.onClose();
    },
    onClickMM: function () {
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.CHAT_VIEW_OPEN_PRIVATE, { charid: Game._.get(this, '_data.charid', 0), name: Game._.get(this, '_data.name', '') });
        this.onClose();
    }
});