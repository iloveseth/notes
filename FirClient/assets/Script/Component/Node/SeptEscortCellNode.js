const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_name: { default: null, type: cc.Label_ },
        Sprite_online: { default: null, type: cc.Sprite_ },
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            if (this._data.online == 1) {
                this.Label_name.node.color = cc.color(255, 255, 255);
            } else {
                this.Label_name.node.color = cc.color(175, 175, 175);
            }
            this.Label_name.setText(this._data.name);
            this.Sprite_online.SetSprite(Game.UserModel.GetOnlineImg(this._data.online));
        }
        this.node.active = this._data != null;
    },
});
