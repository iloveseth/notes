const Game = require('../../Game');
cc.Class({
    extends: cc.viewCell,

    properties: {
        label_name: { default: null, type: cc.Label_ },
        label_detail: { default: null, type: cc.Label_ },
        index: { default: -1 },
        target: { default: null },
    },
    //====================  这是分割线  ====================
    onServerClick: function () {
        if (Game._.isFunction(Game._.get(this, 'target.onServerClick', null))) {
            this.target.onServerClick(this.index);
        }
    },
    init: function (index, data) {
        if (index >= data.array.length) {
            this.node.active = false;
            return;
        }
        this.target = data.target;
        this.index = index;
        this.node.active = true;
        let server = data.array[index];
        //TODO
        this.label_name.setText(Game._.get(server, 'Name', ''));
        this.label_detail.setText(Game._.get(server, 'url', ''));
    },
});
