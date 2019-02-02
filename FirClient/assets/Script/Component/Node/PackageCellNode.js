// PackageCellNode.js
const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        node_item: { default: null, type: cc.Node },
        Label_name: { default: null, type: cc.Label_ },
        Label_nameOutline: { default: null, type: cc.LabelOutline },
        Sprite_red: { default: null, type: cc.Sprite_ },
    },

    onLoad() {
        this._singleItemComponent = this.node_item.getComponent('SingleItemNode');
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        var fulldata = {
            index: index,
            data: data.array[index],
        };
        var fulldatastr = JSON.stringify(fulldata);
        //如果参数与当前一样，则不刷新
        if(fulldatastr == this._fulldatastr){
            return;
        }
        this._fulldatastr = fulldatastr;
        if (this._data) {
            this.node.active = true;
            this._thisId = this._data.thisid;
            this.setItemInfo(this._data);
        } else {
            this.node.active = false;
        }
    },
    setItemInfo(itemInfo) {
        if (this._singleItemComponent) {
            if (Game.ItemDefine.PACKAGETYPE.PACKAGE_COMMON == this._data.packagetype) {
                this._singleItemComponent.updateView(itemInfo, function () {
                    this._target.itemClickedCallback(this._thisId, this);
                }.bind(this));
            } else {
                this._singleItemComponent.updateView(itemInfo);
            }
        }
        this.Label_name.string = itemInfo.name;
        let isEquip = Game.EquipModel.IsEquip(itemInfo.type);
        this.Label_name.node.color = Game.ItemModel.GetItemLabelColor(isEquip && itemInfo.equipdata.color || itemInfo.color);
        this.Label_nameOutline.color = Game.ItemModel.GetItemLabelOutlineColor(isEquip && itemInfo.equipdata.color || itemInfo.color);

        if (this._target.node.uiname == Game.UIName.UI_PACKAGE) {
            if (this._data.baseid == 97) {
                this.Sprite_red.node.active = true;
            } else if (this._data.baseid == 81) {
                this.Sprite_red.node.active = Game.ItemModel.GetItemNumById(71) > 0;
            } else {
                this.Sprite_red.node.active = false;
            }
        } else {
            this.Sprite_red.node.active = false;
        }
    },

    clicked() {
    },
});