const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        label_notice: cc.Label_,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        if (this._data) {
            this.label_notice.setText(this._data);
            if(index > 0){
                this.node.color = cc.color('#FF6262');
                this.node.getComponent(cc.LabelOutline).color = cc.color('#A52222');
            }
        }
    },

    // update (dt) {},
});
