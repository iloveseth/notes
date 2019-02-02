const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Label_name: { default: null, type: cc.Label_ },
        Label_desc: { default: null, type: cc.Label_ },
        Label_per: { default: null, type: cc.Label_ },
    },

    onLoad() {
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            this.Label_name.setText(this._data.name);
            this.Label_per.setText(this._data.num + '%');

            if (this._data.type == 1) {
                this.Label_desc.setText('祝福成功,增加');
                this.Label_desc.node.color = cc.color(255,255,255);
            } else if (this._data.type == 2) {
                this.Label_desc.setText('祝福失败,减少');
                this.Label_desc.node.color = cc.color(255,0,0);
            } else if (this._data.type == 3) {
                this.Label_desc.node.color = cc.color(255,0,0);
            }
        }
    }
});
