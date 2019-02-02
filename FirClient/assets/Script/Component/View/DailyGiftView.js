const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_timeleft: cc.Label_,
        table_view: cc.tableView,
        sprite_coin: cc.Sprite_,
        label_price: cc.Label_,
        label_pricetop: cc.Label_,
        button_buy: cc.Button_,
        sprite_red: cc.Sprite_,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initModel();
        this.initView();
    },

    onEnable(){
        this.initNotification();
        this.updateModel();//(8-14)
        this.updateView();
        this.updateCd();
        this.schedule(this.updateCd.bind(this),1);
    },

    onDisable(){
        this.removeNotification();
        this.unschedule(this.updateCd.bind(this),1);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.VIP_RET_INFO1,this,this.onVipRetInfo);
        Game.NotificationController.On(Game.Define.EVENT_KEY.PAY_RESULT, this, this.onPayResult);
    },
    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.VIP_RET_INFO1,this,this.onVipRetInfo);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PAY_RESULT, this, this.onPayResult);
    },
    
    onPayResult(status){
        // if(status == 1){
        //     Game.NetWorkController.SendProto('msg.ReqBuyVipGift', {viplevel: 1});
        // }
    },

    onVipRetInfo(){
        this.updateModel();
        this.updateView();
    },

    initModel(){
        this.mall_sheet = Game.ConfigController.GetConfig('mall_data');
        this.gift_sheet = Game.ConfigController.GetConfig('giftbag_data');
    },

    initView(){},

    updateModel(){
        this.vip_data = Game.VipModel.retVipInfo;
        this.giftid = Game.ActiveModel.getCurDailyGiftId();
        if(this.giftid == 0){
            this.giftid = 14;
            this.button_buy.interactable = false;
        }
        else{
            this.button_buy.interactable = true;
        }
        this.mall_data = Game._.find(this.mall_sheet,{'id': this.giftid});
        this.gift_data = Game._.filter(this.gift_sheet,e => {return e.quality == this.mall_data.objid});

        this.sprite_red.node.active = this.giftid == 8;
    },

    updateView(){
        this.updateButtonView();
        this.updateTableView();
        this.updateOtherView();
    },

    updateButtonView(){
        var type = this.mall_data.producttype;
        var price = this.mall_data.price;
        if(type == 4){
            this.sprite_coin.SetSprite('Image/UI/Common/image_goldcoin');
            this.label_price.setText(price);
        }
        if(type == 3){
            this.sprite_coin.SetSprite('Image/UI/Common/tongyong_img_0119');
            this.label_price.setText(parseInt(price/100));
        }
    },

    updateOtherView(){
        var desc = this.mall_data.goodsdesc;
        this.label_pricetop.setText(desc);
    },

    updateTableView(){
        this.table_view.initTableView(this.gift_data.length,{ array: this.gift_data, target: this });
    },

    onClickBuy(){
        if(this.giftid == 8){
            var msg = {
                id: this.giftid,
            }
            Game.NetWorkController.SendProto('msg.ReqBuyGoldGift', msg);
        }
        else{
            Game.Platform.RequestPay(this.mall_data.id);
        }
    },

    updateCd(){
        var truetime = Game.TimeController.GetCurTime() + 28800;
        var daytime = truetime % 86400;
        var lefttime = 86400 - daytime;
        this.label_timeleft.setText(this.getTimeStr(lefttime))
    },

    getTimeStr(time){
        var hour = Math.floor(time/3600);
        var minute = Math.floor((time % 3600)/60);
        var second = time % 60;

        var hourStr = hour < 10 ? `0${hour}` : `${hour}`;
        var minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
        var secondStr = second < 10 ? `0${second}` : `${second}`;
        return `${hourStr}时${minuteStr}分${secondStr}秒`;
    },

    // update (dt) {},
});
