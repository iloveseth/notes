var jump_key = cc.Enum({
    SHOP_NB: 1,
    BATTLE: 2,
    GARDEN: 3,
    DAILY: 4,
    FIELD: 5,
    SHOP_EXCHANGE: 6,
    EXCHANGE_2: 7,
    EXCHANGE_3: 8,
    SHOP_COMMON: 9,
    BOSS: 10,
    BUY: 11,
    LEVEL: 12,
    CHARGE: 13,
})

const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_item: {default:null, type:cc.Node},
        label_detail:{default:null, type:cc.Label_},
        labels_menu:{default:[],type:cc.Label_},
        buttons_menu:{default:[],type:cc.Button_},
        labels_price:{default:[],type:cc.Label_},
        Sprite_item:{ default: null, type: cc.Sprite_ },
        Sprite_quality:{ default: null, type: cc.Sprite_ },
        label_itemnum:{default:null, type:cc.Label_},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._singleItemNode = this.node_item.getComponent('SingleItemNode');
        var btnNum = this.buttons_menu.length;
        this.btnHandler = new Array(btnNum).fill(new Function());
        this.btnHandler[3] = this.onTouchBuy.bind(this,1);
        this.btnHandler[4] = this.onTouchBuy.bind(this,10);

        this.str_menus = new Array(btnNum);
        this.str_menus[3] = '购买1个';
        this.str_menus[4] = '购买10个';

        for(let idx = 0;idx != this.btnHandler.length; ++idx){
            this.buttons_menu[idx].node.on('click',this.handleBtnMenu.bind(this,idx));
        }
    },

    handleBtnMenu(idx){
        this.btnHandler[idx]();
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.insufficientNotice', this, this.onInsufficientNotice);
        Game.NetWorkController.AddListener('msg.RefreshObject', this, this.onRefreshObject);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.insufficientNotice', this, this.onInsufficientNotice);
        Game.NetWorkController.RemoveListener('msg.RefreshObject', this, this.onRefreshObject);
    },

    onInsufficientNotice(msg,data){
    },

    onRefreshObject(){
        this.updateView(this.itemConfig,this.tishijiemian_data);
    },

    onEnable(){
        this.init();
        this.initNotification();
    },

    init(){
        this.tishijiemian_data = Game.ConfigController.GetConfigById('tishijiemian_data',this._data.tishi);
        this.button_data = Game.ConfigController.GetConfig('button_data');
        this.levellimit_data = Game.ConfigController.GetConfig('levellimit_data');
        this.itemConfig = Game.ItemModel.GetItemConfig(this._data.objid);
        this.buttonactive = new Array(5).fill(true);
        this.updateView(this.itemConfig,this.tishijiemian_data);
    },

    onDisable(){
        this.removeNotification();
    },

    updateView(cfg,tishi_data){
        this.multiBtn = false;
        this._price = 0;
        if(cfg){
            this.Sprite_item.SetSprite(cfg.pic);
            this.Sprite_quality.SetSprite(Game.ItemModel.GetItemQualityIcon(cfg.color));
            this.label_itemnum.string = Game.ItemModel.GetItemNumById(cfg.id);
            this.setLabelPrice([`${cfg.goldsell}金币`,`${cfg.goldsell * 10}金币`]);
            this._price = cfg.goldsell || 0;
        }
        else{
            this.Sprite_item.SetSprite(tishi_data.pic);
        }
        
        //金币和银币的提示界面需要特殊处理
        if(this._data.tishi == 1){
            this.label_itemnum.string = Game.UserModel.GetMoney();
        }
        if(this._data.tishi == 12){
            this.label_itemnum.string = Game.UserModel.GetGold();
        }
        
        this.label_detail.string = tishi_data.info;
        
        var tishibutton = tishi_data.button.split(';');
        var rowNum = tishibutton.length;
        
        tishibutton.forEach((e,idx) => {
            var dataName = Game.ConfigController.GetConfigById('button_data',e).buttonname;
            if(dataName){
                this.str_menus[idx] = dataName;
            }
        });
        tishibutton.forEach((e,idx) => {
            if(e == jump_key.BUY){
                this.multiBtn = true;
            }
            else{
                this.btnHandler[idx] = (this.getHandlerByIdx(e,idx));
            }
        });
        this.setLabelMenu();
        this.showButtons(rowNum);
    },

    setLabelMenu(){
        for(var idx = 0;idx != this.labels_menu.length;++idx){
            this.labels_menu[idx].string = this.str_menus[idx];
        }
    },

    setLabelPrice(arr){
        for(var idx = 0;idx != arr.length;++idx){
            this.labels_price[idx].string = arr[idx];
        }
    },

    onTouchGoShop(tab){
        //打开商城界面
        this.openView(Game.UIName.UI_SHOPVIEW, tab);
    },

    onTouchGoTask(){
        //打开任务界面
        this.openView(UIName.UI_DAILYTASKVIEW);
    },
    onTouchBuy(num){
        this.sendTDEventData(num);
        var msg = {
            objid : this._data.objid,//71
            num : num,
            buytype: 2,
        }
        Game.NetWorkController.SendProto('msg.reqBuyObj',msg);
    },

    sendTDEventData(num){
        if(this.itemConfig){
            if(this.itemConfig.kind == Game.ItemDefine.ITEMTYPE.ItemType_Stone){
                Game.Platform.SetTDEventData(Game.Define.TD_EVENT.EventFastGemBuy,{gold:this._price*num, times:num, charid:Game.UserModel.GetCharid()});
            }else if(this._data.objid.id == 1){
                Game.Platform.SetTDEventData(Game.Define.TD_EVENT.EventFastSparBuy,{gold:this._price*num, times:num, charid:Game.UserModel.GetCharid()});               
            }else if(this._data.objid.id == 71){
                Game.Platform.SetTDEventData(Game.Define.TD_EVENT.EventFastGemBuy,{gold:this._price*num, times:num, charid:Game.UserModel.GetCharid()});
            }
        }         
    },

    onTouchGoBattle(){
        //跳转至战斗
        this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Fight)
    },

    onTouchGoGarden(){
        //跳转至庄园
        Game.GlobalModel.SetIsOpenDigView(true);
        Game.NetWorkController.SendProto('msg.reqAllDigStatus', {});
    },

    onTouchGoField(){
        //跳转至竞技场
        this.openView(Game.UIName.UI_GYM_FIGHT_LIST_VIEW);
    },

    onTouchGoExchange2(){
        //兑换二等天魔石
        this.openView(Game.UIName.UI_STONEXCHANGENODE, this._data);
    },

    onTouchGoExchange3(){
        //兑换三等天魔石
        this.openView(Game.UIName.UI_STONEXCHANGENODE, this._data);
    },

    onTouchGoBoss(){
        //世界boss
        this.openView(Game.UIName.UI_WORLDBOSSLIST);
    },

    onTouchGoLevel(){
        //关卡界面
        this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Pass);
    },

    onTouchGoCharge(){
        //充值
        // this.openView(Game.UIName.UI_VIP_RECHARGE_VIEW);
        if (Game.ActiveModel.checkHasFirstCharge()) {
            Game.VipModel.SetVipType(2);
            Game.NetWorkController.SendProto('msg.ReqVipInfo', { noshow: false });
        } else {
            Game.ViewController.OpenView(Game.UIName.UI_FIRSTRECHARGEVIEW, "ViewLayer");
        };
    },

    getHandlerByIdx(idx,buttonIdx){
        var button = this.buttons_menu[buttonIdx];
        button.node.interactable = true;
        var isOpen = false;
        var button_data = Game._.find(this.button_data, e => {return e.id == idx});
        var limitid = button_data.limitid;
        if(limitid){
            var limitdata = Game._.find(this.levellimit_data, e => {return e.id == limitid});
            isOpen = Game.GuideController.IsFunctionOpen(limitid);
        }
        else{
            isOpen = true;
        }
        if(!isOpen){
            return this.showTips.bind(this,limitdata.content);
        }
        switch(parseInt(idx)){
            case jump_key.DAILY:{
                return this.onTouchGoTask.bind(this);
            }
            case jump_key.SHOP_NB:{
                return this.onTouchGoShop.bind(this,Game.Define.SHOPTAB.Tab_NB);
            }
            case jump_key.BATTLE:{
                return this.onTouchGoBattle.bind(this);
            }
            case jump_key.GARDEN:{
                return this.onTouchGoGarden.bind(this);
            }
            case jump_key.FIELD:{
                return this.onTouchGoField.bind(this);
            }
            case jump_key.SHOP_EXCHANGE:{
                return this.onTouchGoShop.bind(this,Game.Define.SHOPTAB.Tab_Currency);
            }
            case jump_key.EXCHANGE_2:{
                return this.onTouchGoExchange2.bind(this);
            }
            case jump_key.EXCHANGE_3:{
                return this.onTouchGoExchange3.bind(this);
            }
            case jump_key.SHOP_COMMON:{
                return this.onTouchGoShop.bind(this,Game.Define.SHOPTAB.Tab_NB);
            }
            case jump_key.BOSS:{
                return this.onTouchGoBoss.bind(this);
            }
            case jump_key.LEVEL:{
                return this.onTouchGoLevel.bind(this);
            }
            case jump_key.CHARGE:{
                return this.onTouchGoCharge.bind(this);
            }
        }
    },

    showButtons(num){
        var realNum = num;
        this.buttons_menu.forEach(e => {
            e.node.active = false;
        });
        this.buttons_menu.forEach((e,idx) => {
            if(idx < realNum - 1){
                e.node.active = this.buttonactive[idx];
            }
        });
        this.buttons_menu[num - 1].node.active = !this.multiBtn;
        this.buttons_menu[3].node.active = this.multiBtn;
        this.buttons_menu[4].node.active = this.multiBtn;
        this.labels_price.forEach(e => {
            e.node.active = this.multiBtn;
        });
    },
    // update (dt) {},
});
