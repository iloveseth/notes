const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_event: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            this.Label_event.setText(Game.moment(this._data.time * 1000).format('MM-DD hh:mm') + '   ' +this._data.txt)
        }
    }
});
