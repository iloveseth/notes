const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        spt_item_icon: { default: null, type: cc.Sprite_ },
        spr_double: { default: null, type: cc.Sprite_ },
        lab_item_title: { default: null, type: cc.Label_ },
        lab_item_num: { default: null, type: cc.Label_ },
        lab_item_price: { default: null, type: cc.Label_ },
    },

    onLoad: function () {

    },
    
    start() {
    },

    update(dt) {
    },

    lateUpdate(dt) {
    },

    onDestroy() {
    },

    onEnable() {
        this.initNotification();  
        this.initView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {

    },

    removeNotification() {

    },

    initView(){
        let data = this._data;
        let nameTab = ["一小堆金币",
                         "一大堆金币",
                         "一小袋金币",
                         "一大袋金币",
                         "一小箱金币",
                         "一大箱金币",];
        let picTab = ["Image/UI/VIpRechargeItemCell/chongzhi_zuanshi5",
                      "Image/UI/VIpRechargeItemCell/chongzhi_zuanshi2",
                      "Image/UI/VIpRechargeItemCell/chongzhi_zuanshi4",
                      "Image/UI/VIpRechargeItemCell/chongzhi_zuanshi1",
                      "Image/UI/VIpRechargeItemCell/chongzhi_zuanshi6",
                      "Image/UI/VIpRechargeItemCell/chongzhi_zuanshi3",];

        
        this.spt_item_icon.SetSprite(picTab[data.tempindex]);
        this.spr_double.node.active = !data.isget;
        this.lab_item_title.string = data.goodsname;
        this.lab_item_num.string = data.goodsdesc;
        this.lab_item_price.string = "￥ "+(data.price / 100);

    },






    //====================  这是分割线  ====================
    onBtn_item_click(){
        Game.Platform.RequestPay(this._data.id);
    },

});
