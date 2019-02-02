const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        ani_light: { default: null, type: cc.Animation },
        spt_bg: { default: null, type: cc.Sprite_ },
        spr_icon: { default: null, type: cc.Sprite_ },
        spr_stale: { default: null, type: cc.Sprite_ },
        spr_sign: { default: null, type: cc.Sprite_ },
        lab_num: { default: null, type: cc.Label_ },
        lab_date: { default: null, type: cc.Label_ },
        spr_gray: { default: null, type: cc.Sprite_ },
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
        let signData = this._data;
        let tbxid = signData.tbxid;
        let month = signData.month;
        let day = signData.day;
        let rewardId = signData.reward;
        let vip = signData.vip;
        let vipnum = signData.vipnum;

        //日期
        let dateStr = cc.js.formatStr("%d月%d日",month,day);
        this.lab_date.string = dateStr;

        //奖励物品
        let rewardData = Game.ConfigController.GetConfigById("commonreward_data",rewardId);
        let yuanbao = rewardData.yuanbao;
        let gold = rewardData.gold;
        let money = rewardData.money;
        let fame = rewardData.fame;
        if(yuanbao > 0){
            this.lab_num.string = "x" + Game.Tools.UnitConvert(yuanbao);
            this.spr_icon.SetSprite(Game.ConfigController.GetConfigById("object_data",323).pic);
        };
        if(gold > 0){
            this.lab_num.string = "x" + Game.Tools.UnitConvert(gold);
            this.spr_icon.SetSprite(Game.ConfigController.GetConfigById("object_data",109).pic);
        };
        if(money > 0){
            this.lab_num.string = "x" + Game.Tools.UnitConvert(money);
            this.spr_icon.SetSprite(Game.ConfigController.GetConfigById("object_data",108).pic);
        };
        if(fame > 0){
            this.lab_num.string = "x" + Game.Tools.UnitConvert(fame);
            this.spr_icon.SetSprite(Game.ConfigController.GetConfigById("object_data",282).pic);
        };

        let item = rewardData.item;
        if(item !== "" && item !== "0"){
            let tbitem = item.split("-");
            this.lab_num.string = "x" + Game.Tools.UnitConvert(tbitem[1]);
            this.spr_icon.SetSprite(Game.ConfigController.GetConfigById("object_data",tbitem[0]).pic);
        };

    },

    setAni_Light_show(isShow){
        if(isShow){
            this.ani_light.node.active = true;
            this.ani_light.play('effect_light');
        }else{
            this.ani_light.stop('effect_light');
            this.ani_light.node.active = false;
        }
    },

    //====================  这是分割线  ====================
    onbtn_item_click(){
        if(this.ani_light.node.active){
            Game.NetWorkController.SendProto('sign.signDate', {});
        };
    },

    
});
