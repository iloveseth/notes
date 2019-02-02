const Game = require('../../Game');
cc.Class({
    extends: cc.viewCell,

    properties: {
        singleItemNode: { default: null, type: require('./SingleItemNode') },
        label_name: { default: null, type: cc.Label_ },
        label_price: { default: null, type: cc.Label_ },
        sprite_discount: { default: null, type: cc.Sprite_ },

        goodsInfo: { default: null },
        target: { default: null },
    },
    init: function (index, data, reload, group) {
        if (index >= data.array.length) {
            this.node.active = false;
            return;
        }
        this.target = data.target;
        this.node.active = true;
        this.goodsInfo = data.array[index];
        //TODO
        this.singleItemNode.updateView(this.goodsInfo.obj, this.onIconClick.bind(this));
        this.label_name.setText(Game._.get(this, 'goodsInfo.obj.name'));
        let cost = Game._.get(this, 'goodsInfo.costmoney', 0);
        let discount = Game._.get(this, 'goodsInfo.discount', 10);
        // cost = Math.floor(cost * discount / 10);
        this.label_price.setText(cost);
        if (discount == 10) {
            this.sprite_discount.spriteFrame = null;
        } else {
            this.sprite_discount.SetSprite('Image/Icon/shop/img_cuxiao' + discount);
        }
    },
    //====================  按钮回调  ====================
    onBuyClick: function () {
        if (Game._.isFunction(Game._.get(this, 'target.onBuyGeneralGoodsClick', null))) {
            this.target.onBuyGeneralGoodsClick(Game._.get(this, 'goodsInfo.index'));
        }
    },
    onIconClick: function (itemid) {
        if (Game._.isFunction(Game._.get(this, 'target.onItemIconClick', null))) {
            let pos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            this.target.onItemIconClick(this.goodsInfo, pos);
        }
    },
});
