const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_name: { default: null, type: cc.Label_ },
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            this.Label_name.setText(Game._.get(this, '_data.Name', ''));
        }
    },

    onClickSelect() {
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.SELECT_SERVER_GET, this._data);
        if (Game._.isFunction(Game._.get(this, '_target.onClose', null))) {
            this._target.onClose();
        }
    },
});
