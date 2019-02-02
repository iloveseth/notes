// FairyArrayCellNode.js
const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        node_item: { default: null, type: cc.Node },
    },
    onLoad() {
        this._FairyHeadComponent = this.node_item.getComponent('FairyHeadNode');
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        if (this._data) {
            this.node.active = true;
            this.setItemInfo(this._data);
        } else {
            this.node.active = false;
        }
    },
    setItemInfo(fairyInfo) {
        if (this._FairyHeadComponent) {
            this._FairyHeadComponent.updatePackageView(fairyInfo, function (id) {
                this._target.fairyClickedCallback(id, this);
            }.bind(this));       
        }
    },
});