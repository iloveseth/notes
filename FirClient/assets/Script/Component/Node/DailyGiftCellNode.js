const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        node_item: cc.Node,
        label_name: cc.Label_,
        label_itemnum: cc.Label_,
    },

    init(index, data, reload, group){
        this._target = data.target;
        this._data = data.array[index];
        this.item_config = Game.ItemModel.GetItemConfig(this._data.clientid);
        this.updateView();
    },

    updateView(){
        this.baseItemNode = this.node_item.getComponent('BasicItemNode');
        this.baseItemNode.setInfo(this._data.clientid);
        this.item_config = Game.ItemModel.GetItemConfig(this._data.clientid);
        this.label_name.setText(this.item_config.name);
        this.label_itemnum.setText(Game.Tools.UnitConvert(this._data.clientnum));
    },

    // update (dt) {},
});
