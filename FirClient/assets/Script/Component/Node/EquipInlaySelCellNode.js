const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        Node_singleItem: { default: null, type: cc.Node },
        Label_Recommend: { default: null, type: cc.Label_ },
        Label_Name: { default: null, type: cc.Label_ },
    },

    onLoad() {
        this._singleItemComponent = this.Node_singleItem.getComponent('SingleItemNode');
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        if (this._data){
            this._singleItemComponent.updateView(this._data, function(){
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.GET_SEL_ITEM, this._data);
            }.bind(this));

            this.Label_Recommend.node.active = this._data.type == Game.ItemDefine.ITEMTYPE.ItemType_Stone && index == 0;
            this.Label_Name.node.color = Game.ItemModel.GetItemLabelColor(this._data.color);
            this.Label_Name.setText(this._data.name);
        }
        this.node.active = this._data != null;
    },
});