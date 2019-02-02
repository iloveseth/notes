const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        sprite_quality: cc.Sprite_,
        sprite_item: cc.Sprite_,
        label_itemnum: cc.Label_,
        node_star: cc.Node,
        label_starnum: cc.Label_,
        label_itemname: cc.Label_,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    setInfo(baseid,num,color,roottip){
        this.initView();
        this.baseid = baseid;
        this.roottip = roottip;
        var item_config = Game.ItemModel.GetItemConfig(baseid);
        this.sprite_item.SetSprite(item_config.pic);
        var realcolor = color;
        if(!realcolor){
            realcolor = item_config.color;
        }
        this.sprite_quality.SetSprite(Game.ItemModel.GetItemQualityIcon(realcolor));
        if(this.label_itemnum){
            this.label_itemnum.setText(Game.Tools.UnitConvert(num));
        }
        if(this.label_itemname){
            this.label_itemname.setText(item_config.name);
        }
        this.handleItemType();
        
    },

    initView(){
        if(this.node_star){
            this.node_star.active = false;
        }
    },

    handleItemType(){
        switch(Game.ItemModel.GetItemType(this.baseid)){
            case Game.ItemModel.ITEM_TYPE.ITEM_SHENGXING:{
                if(!this.node_star){
                    return;
                }
                this.node_star.active = true;
                var starItemLv = this.baseid - 249;
                this.label_starnum.setText(`+${starItemLv}`);
                break;
            }
            default:{
                if(!this.node_star){
                    return;
                }
                this.node_star.active = false;
                break;
            }
        }
    },

    onItemIconClick: function () {
        var item_config = Game.ItemModel.GetItemConfig(this.baseid);
        item_config.baseid = this.baseid;
        let contents = Game.ItemModel.GenerateCommonContentByObject(item_config);
        let pos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.roottip);
    },

    // update (dt) {},
});
