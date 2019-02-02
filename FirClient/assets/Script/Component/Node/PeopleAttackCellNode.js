const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        label_name: cc.Label_,
        label_fight: cc.Label_,
        label_times: cc.Label_,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            this.label_name.setText(this._data.name);
            this.label_fight.setText(this._data.fight);
            this.label_times.setText(this._data.attnum);
        }
    },

    // update (dt) {},
});
