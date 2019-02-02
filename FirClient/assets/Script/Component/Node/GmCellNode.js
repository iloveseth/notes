const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_desc: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        if (this._data){
            this.Label_desc.setText(this._data.tip);
        }
    },

    onClickSend() {
        cc.log(this._data.gm);
        Game.NetWorkController.SendProto('msg.SendGmCmd', {
            cmd: this._data.gm
        });
    }
});