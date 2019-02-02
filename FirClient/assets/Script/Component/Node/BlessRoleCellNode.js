const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_name: { default: null, type: cc.Label_ },
        Label_num: { default: null, type: cc.Label_ },
        Label_addper: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        if (this._data) {
            this.Label_name.setText(this._data.name);
            this.Label_num.setText(this._data.num);
            this.Label_addper.setText(this._data.addper + '%');
        }
    }
});
