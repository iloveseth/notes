const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {

    },

    onLoad() {
        //庄园种植界面
        cc.log('DigSettingNode onLoad');

    },

    start() {
        //初始化变量
        this.mine_color = 0;
        this.mineId = 0;
        this.diggType = 1;
        this.arrayLayout = [];
        this.arrayImg = [];

        this.initView();
    },

    update(dt) {
    },

    lateUpdate(dt) {
    },

    onDestroy() {
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

    initView(){
        this.rect_bg = this.node.getChildByName("img_rect_bg");
        this.node_yinzi = this.rect_bg.getChildByName("node_yinzi");
        this.node_daoju = this.rect_bg.getChildByName("node_daoju");
        this.node_zhuangbei = this.rect_bg.getChildByName("node_zhuangbei");
        let lab_title_name = this.rect_bg.getChildByName("lab_title_name");
        this.node_yinzi.active = false;
        this.node_daoju.active = false;
        this.node_zhuangbei.active = false;
        lab_title_name.getComponent(cc.Label_).string = "";

        for (let i = 1; i <= 8; i++){
            let str_1 = "img_bg_" + i;
            let str_2 = "spr_icon_" + i;
            let img_bg = this.node_daoju.getChildByName(str_1);
            let spr_icon = img_bg.getChildByName(str_2);
            this.arrayLayout.push(img_bg);
            this.arrayImg.push(spr_icon);
        };
        

        this.mineId = this._data.mineid;
        this.mine_color = this._data.color;

        let dig_data = Game.ConfigController.GetConfigById('diglimit_data',this.mineId);
        lab_title_name.getComponent(cc.Label_).string = dig_data.name;

        this.refreshView(this.diggType);
    },

    refreshView(type){
        this.diggType = type;

        let digPlus = 0;

        if(this.diggType == 1)
        {
            //银币
            this.rect_bg.getChildByName("btn_yinzi").getComponent(cc.Button_).interactable = false;
            this.rect_bg.getChildByName("btn_daoju").getComponent(cc.Button_).interactable = true;
            this.rect_bg.getChildByName("btn_zhuangbei").getComponent(cc.Button_).interactable = true;

        }else if(this.diggType == 2)
        {
            //道具
            this.rect_bg.getChildByName("btn_yinzi").getComponent(cc.Button_).interactable = true;
            this.rect_bg.getChildByName("btn_daoju").getComponent(cc.Button_).interactable = false;
            this.rect_bg.getChildByName("btn_zhuangbei").getComponent(cc.Button_).interactable = true;

        }else if(this.diggType == 3)
        {
            //装备
            this.rect_bg.getChildByName("btn_yinzi").getComponent(cc.Button_).interactable = true;
            this.rect_bg.getChildByName("btn_daoju").getComponent(cc.Button_).interactable = true;
            this.rect_bg.getChildByName("btn_zhuangbei").getComponent(cc.Button_).interactable = false;
        }

        let hoe_data = Game.ConfigController.GetConfigById('hoecost_data',this.mineId);
        let timeStr = hoe_data.needtime+"分钟";
        let time_title = this.rect_bg.getChildByName("lab_explore_time_title");
        time_title.getChildByName("lab_explore_time_desc").getComponent(cc.Label_).string = timeStr;

        let digColor = Game.ConfigController.GetConfigById("digcolor_data",this.mine_color)
        let digreward = Game.ConfigController.GetConfig("digreward_data")
        let rolelv = Game.UserModel.GetLevel();
        for(let i = 0; i < digreward.length; i++){
            let obj = digreward[i];
            if(obj.mineid == this.mineId && obj.level == rolelv){
                if(this.diggType == 1){
                    this.node_yinzi.active = true;
                    this.node_daoju.active = false;
                    this.node_zhuangbei.active = false;
                    let num = obj.money * (100 + digColor.money) / 100;
                    let moneyStr = Game.Tools.UnitConvert(num) + "两/分"
                    let lab_yinzi_desc_time = this.node_yinzi.getChildByName("lab_yinzi_desc_time");
                    lab_yinzi_desc_time.getComponent(cc.Label_).string = moneyStr;
                    digPlus = digColor.showper
                }else if(this.diggType == 2){
                    this.node_yinzi.active = false;
                    this.node_daoju.active = true;
                    this.node_zhuangbei.active = false;
                    for(let i = 0; i < this.arrayLayout.length; i++){
                        let vobj = this.arrayLayout[i];
                        vobj.active = false;
                    };

                    let dig_data = Game.ConfigController.GetConfigById("digreward_data",obj.id);
                    let rewardVec = dig_data.itemid.split(";");//itemid数组
                    //显示道具icon
                    for(let i = 0; i < rewardVec.length; i++){
                        if(i > 7){
                            break;
                        };
                        let objData = Game.ItemModel.GetItemConfig(Number(rewardVec[i]));
                        let layout_obj = this.arrayLayout[i];
                        if(layout_obj != null ){
                            layout_obj.active = true;
                        };
                        let obj_img = this.arrayImg[i];
                        if(obj_img != null){
                            let picStr = objData.pic;
                            obj_img.getComponent(cc.Sprite_).SetSprite(picStr);
                        }
                    };

                }else if(this.diggType == 3){
                    this.node_yinzi.active = false;
                    this.node_daoju.active = false;
                    this.node_zhuangbei.active = true;
                    let lab_txt_colorTitle = this.node_zhuangbei.getChildByName("lab_txt_colorTitle");
                    lab_txt_colorTitle.getChildByName("lab_txt_bai").active = false;
                    lab_txt_colorTitle.getChildByName("lab_txt_lv").active = false;
                    lab_txt_colorTitle.getChildByName("lab_txt_lan").active = false;
                    lab_txt_colorTitle.getChildByName("lab_txt_zi").active = false;
                    lab_txt_colorTitle.getChildByName("lab_txt_cheng").active = false;

                    let lab_txt_lvTitle = this.node_zhuangbei.getChildByName("lab_txt_lvTitle");
                    lab_txt_lvTitle.getChildByName("lab_txt_equipLv").getComponent(cc.Label_).string = obj.equiplevel;

                    let dig_data = Game.ConfigController.GetConfigById("digreward_data",obj.id)

                    let rewardVec = [];
                    if (typeof dig_data.equipcolor === 'number') {
                        rewardVec = [dig_data.equipcolor]
                    }else{
                        rewardVec = dig_data.equipcolor.split(";");
                    };
                    //显示装备
                    for(let i = 0; i < rewardVec.length; i++){
                        if(Number(rewardVec[i]) == 1){
                            lab_txt_colorTitle.getChildByName("lab_txt_bai").active = true;
                        }else if(Number(rewardVec[i]) == 2){
                            lab_txt_colorTitle.getChildByName("lab_txt_lv").active = true;
                        }else if(Number(rewardVec[i]) == 3){
                            lab_txt_colorTitle.getChildByName("lab_txt_lan").active = true;
                        }else if(Number(rewardVec[i]) == 4){
                            lab_txt_colorTitle.getChildByName("lab_txt_zi").active = true;
                        }else if(Number(rewardVec[i]) == 5){
                            lab_txt_colorTitle.getChildByName("lab_txt_cheng").active = true;
                        };

                    };
                }
                digPlus = digColor.showper;
                break;
            };
        }

        //产量描述，颜色
        let lab_output_title = this.rect_bg.getChildByName("lab_output_title");
        if(this.mine_color == 1){
            lab_output_title.getChildByName('lab_output_desc').color = cc.color(255, 255, 255, 255);
            lab_output_title.getChildByName('lab_output_desc').getComponent(cc.Label_).string = "";
        }else if(this.mine_color == 2){
            lab_output_title.getChildByName('lab_output_desc').color = cc.color(0, 255, 0, 255);
        }else if(this.mine_color == 3){
            lab_output_title.getChildByName('lab_output_desc').color = cc.color(0, 192, 255, 255);
        }else if(this.mine_color == 4){
            lab_output_title.getChildByName('lab_output_desc').color = cc.color(234, 0, 255, 255);
        }else if(this.mine_color == 5){
            lab_output_title.getChildByName('lab_output_desc').color = cc.color(255, 138, 0, 255);
        }

        let initialStr = "矿点产量"+(digPlus+100);
        let viplv = Game.UserModel.GetViplevel()+1;
        let manorNum = 0;
        if(viplv == 0){

        }else{
            let vipRewardData = Game.ConfigController.GetConfig("vipreward_data");
            let vipData = null;
            for(let i = 0; i < vipRewardData.length; i++){
                if(viplv == vipRewardData[i].level){
                    manorNum = vipRewardData[i].manor;
                    break;
                };
            };
        };

        let vipManorStr = manorNum + "%(VIP加成)";
        let allStr = initialStr + "+" + vipManorStr;
        lab_output_title.getChildByName('lab_output_desc').getComponent(cc.Label_).string = allStr;
    },
    
    
    //====================  回调类函数  ====================
    onLayout_bg_Touch(){
        cc.log('DigSettingNode onLayout_bg_Touch');
        this.closeView(this._url,true);
    },

    onBtn_ok_Touch(){
        cc.log('DigSettingNode onBtn_OkTouch');
        let msg = {};
        msg.mineid = this.mineId;
        msg.minetype = this.diggType;
        Game.NetWorkController.SendProto('msg.reqStartDig', msg);
        this.closeView(this._url,true);
    },

    onBtn_yinzi_Touch(){
        cc.log('DigSettingNode onBtn_yinzi_Touch');
        this.refreshView(1)
    },
    onBtn_daoju_Touch(){
        cc.log('DigSettingNode onBtn_daoju_Touch');
        this.refreshView(2)
    },
    onBtn_zhuangbei_Touch(){
        cc.log('DigSettingNode onBtn_zhuangbei_Touch');
        this.refreshView(3)
    },

    
    
    
});
