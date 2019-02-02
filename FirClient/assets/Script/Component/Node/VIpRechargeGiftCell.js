const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        spr_vip_num_left_down: { default: null, type: cc.Sprite_ },
        spr_vip_num_right_down: { default: null, type: cc.Sprite_ },

        lab_gift_name: { default: null, type: cc.Label_ },
        lab_gift_notice: { default: null, type: cc.Label_ },
        btn_buy_gift: { default: null, type: cc.Button_ },
        lab_gift_price: { default: null, type: cc.Label_ },
        SingleItemNodeTab: { default: [], type: [cc.Node] },
        lab_look: { default: null, type: cc.Label_ },
        spr_red: { default: null, type: cc.Sprite_ },
    },

    onLoad() {
 
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        

        let viplevel = this._data.viplevel || 0;
        if(viplevel >= 10){
            this.spr_vip_num_left_down.node.active = true;
            this.spr_vip_num_right_down.node.active = true;
            let path_1 = "Image/UI/Common/chongzhi_" + Math.floor(viplevel/10);
            let path_2 = "Image/UI/Common/chongzhi_" + (viplevel%10);
            this.spr_vip_num_left_down.SetSprite(path_1);
            this.spr_vip_num_right_down.SetSprite(path_2);
        }else{
            this.spr_vip_num_left_down.node.active = false;
            this.spr_vip_num_right_down.node.active = true;
            let path_temp = "Image/UI/Common/chongzhi_" + viplevel;
            this.spr_vip_num_right_down.SetSprite(path_temp);
        };

        for(let i = 0; i < 4; i++){
            this.SingleItemNodeTab[i].active = false;
        };
        //奖励物品
        let rewardTable = Game.ItemModel.GenerateObjectsFromCommonReward(this._data.rewardid);
        for(let i = 0; i < rewardTable.objs.length; i++){
            this.SingleItemNodeTab[i].getComponent('SingleItemNode').updateView(rewardTable.objs[i], function(){});
            this.SingleItemNodeTab[i].active = true;
        }

        let vipdata = Game.ConfigController.GetConfigByIndex("vipreward_data",index);
        this.lab_gift_price.string = vipdata.presentvalue;

        this.btn_buy_gift.interactable = !this._data.isget;

        this.spr_red.node.active = false;
        if(this._data.isget){
            this.btn_buy_gift.node.getComponent("Sprite_").SetSprite("Image/UI/Common/tongyong_icon_gray");
            this.btn_buy_gift.interactable = false;
            this.lab_look.string = "已购买";
        }else{
            this.lab_look.string = "购 买";
            let userVip = Game.UserModel.GetViplevel();
            if(userVip < viplevel){
                this.btn_buy_gift.node.getComponent("Sprite_").SetSprite("Image/UI/Common/tongyong_icon_gray");
            }else{
                this.btn_buy_gift.node.getComponent("Sprite_").SetSprite("Image/UI/Common/tongyong_icon_0002");
                this.spr_red.node.active = true;
            };
        }

        




    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        
    },

    removeNotification() {
        
    },
    
    clicked() {
    	cc.log("lay DigSelectCell clicked");
       
    },

    onBtn_buy_Touch(){
        cc.log('VIpRechargeGiftCell onBtn_buy_Touch');
        let curLv = Game.UserModel.GetViplevel();
        if(curLv >= this._data.viplevel){
            Game.NetWorkController.SendProto('msg.ReqBuyVipGift', {viplevel:this._data.viplevel});
        }else{
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "VIP等级不足，无法购买");
        };
        
    },
});