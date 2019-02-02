const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_not_buy: { default: null, type: cc.Node },
        lab_send_all: { default: null, type: cc.Label_ },
        lab_send_daily: { default: null, type: cc.Label_ },
        lab_need_money: { default: null, type: cc.Label_ },
        node_has_buy: { default: null, type: cc.Node },
        lab_left_day: { default: null, type: cc.Label_ },
        btn_get_reward: { default: null, type: cc.Button_ },
        lab_get_reward: { default: null, type: cc.Label_ },
        lab_common_num: { default: null, type: cc.Label_ },
    },

    onInit(data) {
        this.initView(data);
    },

    onEnd() {},

    initView(data){
        this.cardtype = data.card_type;
        let monthCard = data;
        if(monthCard == null){return};

        let diamond = Game._.get(monthCard,"card_diamond",0);
        let everydaygold = Game._.get(monthCard,"card_everydaygold",0);
        let rmb = Game._.get(monthCard,"card_rmb",0);
        let leftday = Game._.get(monthCard,"card_leftday",0);
        let isGet = Game._.get(monthCard,"card_get",false);

        if(leftday > 0){
            //已购买
            this.node_not_buy.active = false;
            this.node_has_buy.active = true;
            if(isGet){
                this.btn_get_reward.interactable = false;
                this.lab_get_reward.string = "已领取";
            }else{
                this.btn_get_reward.interactable = true;
                this.lab_get_reward.string = "领 取";
            };
            this.lab_common_num.string = everydaygold;
            this.lab_left_day.string = leftday;
        }else{
            //未购买
            this.node_not_buy.active = true;
            this.node_has_buy.active = false;
            this.lab_send_all.string = diamond;
            this.lab_send_daily.string = everydaygold;
            this.lab_need_money.string = "￥ "+(rmb/100);
        };
    },


    onPayResult(status){
        if(status == 1){
            cc.log("ActivityMonthCardNode status == 1");
            Game.NetWorkController.SendProto('msg.ReqMonthCard', {type:this.cardtype});
        };
    },

//

    //====================  这是分割线  ====================

    onBtn_buy_card_click(){
        //充值接口
        //tableId:7   充值商城表的编号
        var id = null;
        switch(this.cardtype){
            case 0:{
                id = 7;
                break;
            }
            case 1:{
                id = 16;
                break;
            }
        }
        Game.Platform.RequestPay(id);

        //先这样写，this._data是mall_data.json里面的数据
    },
    onBtn_get_daily_reward_click(){
        Game.NetWorkController.SendProto('msg.ReqGetMonthCard', {type:this.cardtype});
    },
});
