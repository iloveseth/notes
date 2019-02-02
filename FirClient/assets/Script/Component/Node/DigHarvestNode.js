const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_yinzi: { default: null, type: cc.Node },
        node_daoju: { default: null, type: cc.Node },
        node_zhuangbei: { default: null, type: cc.Node },
        
        lab_txt_msg: { default: null, type: cc.Label_ },
        lab_yinzi_num: { default: null, type: cc.Label_ },
        lab_vip_num: { default: null, type: cc.Label_ },
        lab_daoju_num: { default: null, type: cc.Label_ },
        lab_color_1: { default: null, type: cc.Label_ },
        lab_color_2: { default: null, type: cc.Label_ },
        lab_color_3: { default: null, type: cc.Label_ },
        lab_color_4: { default: null, type: cc.Label_ },
        lab_color_5: { default: null, type: cc.Label_ },

        spr_vip_icon: { default: null, type: cc.Sprite_ },
        spr_daoju_icon: { default: null, type: cc.Sprite_ },
    },

    onLoad() {
        //庄园收获界面
        cc.log('DigHarvestNode onLoad');
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
        cc.log("DigHarvestNode onEnable()");
        this.initNotification();
        this.initView();
    },

    onDisable() {
        cc.log("DigHarvestNode onDisable()");
        this.removeNotification();
    },

    initNotification() {

    },

    removeNotification() {

    },

    initView(){
        this.node_yinzi.active = false;
        this.node_daoju.active = false;
        this.node_zhuangbei.active = false;
        this.refreshView();
    },

    refreshView(){
        let info = Game.DigModel.getDigReward();

        let viplv = Game.UserModel.GetViplevel()+1;
        let vipData = null;
        if(viplv == 0){

        }else{
            let vipRewardData = Game.ConfigController.GetConfig("vipreward_data");
            for(let i = 0; i < vipRewardData.length; i++){
                if(viplv == vipRewardData[i].level){
                    vipData = vipRewardData[i];
                    break;
                };
            };
        };

        let msgStr = "";
        if(info.digreward.minetype == 1){
            //银币
            this.node_yinzi.active = true;
            msgStr = "亲爱的勇士，经过"+info.mineTime+"分钟的探索，您获得了丰厚的银币奖励。";
            this.lab_txt_msg.string = msgStr;

            let moneyStr = Game.Tools.UnitConvert(info.digreward.money) + "两"
            this.lab_yinzi_num.string = moneyStr;
            this.spr_vip_icon.SetSprite("Image/UI/Common/image_Silvercoin");

            let manorNum_1 = 0;
            if(vipData != null){manorNum_1 = vipData.manor;};
            let vipNum_1 = info.digreward.money/(1+manorNum_1/100)*(manorNum_1/100);
            let numStr ="*" + Game.Tools.UnitConvert(vipNum_1);
            this.lab_vip_num.string = numStr;
        }else if(info.digreward.minetype == 2){
            //道具
            this.node_daoju.active = true;
            msgStr = "亲爱的勇士，经过"+info.mineTime+"分钟的探索，您获得了丰厚的道具奖励。";
            this.lab_txt_msg.string = msgStr;
            let allNum_2 = 0;
            for(let i = 0; i < info.digreward.items.length; i++){
                if(i > 0){ break;};
                let obj = Game.ItemModel.GetItemConfig(Number(info.digreward.items[i].itemid));
                let picStr = obj.pic;
                this.spr_daoju_icon.SetSprite(picStr);
                let numStr = "*" + info.digreward.items[i].num;
                this.lab_daoju_num.string = numStr;

                this.spr_vip_icon.SetSprite(picStr);
                allNum_2 = allNum_2 + info.digreward.items[i].num;
            };
            let manorNum_2 = 0;
            if(vipData != null){manorNum_2 = vipData.manor;};
            let vipNum_2 = allNum_2/(1+manorNum_2/100)*(manorNum_2/100);
            let numVipStr ="*" + Math.ceil(vipNum_2);
            this.lab_vip_num.string = numVipStr;
        }else if(info.digreward.minetype == 3){
            //装备
            this.node_zhuangbei.active = true;
            this.lab_color_1.node.active = false;
            this.lab_color_2.node.active = false;
            this.lab_color_3.node.active = false;
            this.lab_color_4.node.active = false;
            this.lab_color_5.node.active = false;
            this.lab_color_1.string = "白色*0";
            this.lab_color_2.string = "绿色*0";
            this.lab_color_3.string = "蓝色*0";
            this.lab_color_4.string = "紫色*0";
            this.lab_color_5.string = "橙色*0";
            msgStr = "亲爱的勇士，经过"+info.mineTime+"分钟的探索，您获得了丰厚的装备奖励。";
            this.lab_txt_msg.string = msgStr;

            let equip_list = Game._.get(info.digreward, 'equips', []);

            let allNum_3 = 0;
            for(let i = 0; i < equip_list.length; i++){
                let equip_type = equip_list[i].color;
                let equip_num = equip_list[i].num;

                if(equip_type == 1){
                    let colorStr = "白色*"+equip_num;
                    this.lab_color_1.node.active = true;
                    this.lab_color_1.string = colorStr;
                }else if(equip_type == 2){
                    let colorStr = "绿色*"+equip_num;
                    this.lab_color_2.node.active = true;
                    this.lab_color_2.string = colorStr;
                }else if(equip_type == 3){
                    let colorStr = "蓝色*"+equip_num;
                    this.lab_color_3.node.active = true;
                    this.lab_color_3.string = colorStr;
                }else if(equip_type == 4){
                    let colorStr = "紫色*"+equip_num;
                    this.lab_color_4.node.active = true;
                    this.lab_color_4.string = colorStr;
                }else if(equip_type == 5){
                    let colorStr = "橙色*"+equip_num;
                    this.lab_color_5.node.active = true;
                    this.lab_color_5.string = colorStr;
                }

                this.spr_vip_icon.SetSprite("Image/UI/MiniLevelView/wabao_zhuangbei");

                allNum_3 = allNum_3 + equip_num;
            };
            let manorNum_3 = 0;
            if(vipData != null){manorNum_3 = vipData.manor;};
            let vipNum_3 = allNum_3/(1+manorNum_3/100)*(manorNum_3/100);
            let numVipStr ="*" + Math.ceil(vipNum_3);
            this.lab_vip_num.string = numVipStr;
        }



    },
    
    //====================  回调类函数  ====================
    onLayout_bg_Touch(){
        cc.log('DigHarvestNode onLayout_bg_Touch');
        // this.closeView(this._url,true);
        this.onClose();
    },

    onBtn_close_Touch(){
        cc.log('DigHarvestNode onBtn_close_Touch');
        // this.closeView(this._url,true);
        this.onClose();
    },

});
