const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        lab_title: { default: null, type: cc.Label_ },
    },

    onLoad() {
        //敌国庄园总界面
        cc.log('DigOtherView onLoad');
    },

    start() {
        
    },

    update(dt) {
        this.dfTime = this.dfTime + dt;
        if(this.dfTime >= 1){
            this.dfTime = 0;
            this.refreshTime();
        };
    },

    lateUpdate(dt) {
    },

    onDestroy() {
        Game.DigModel.setOpenEnemy(false);
    },

    onEnable() {
        this.initNotification();
        this.refreshView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.DIG_RET_ROBDIGINFO, this, this.refreshView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.DIG_RET_ROBDIGINFO, this, this.refreshView);
    },

    refreshView(){
        //初始化变量
        this.digInfo = null;
        this.mineId = 0;
        this.arrayTimeSchedule = [0,0,0,0];//本人4矿时间
        this.arrayMineTxt = [];
        this.arrayCaptureTime = [0,0];//占领2矿时间
        this.arrayColddownTxt = [];
        this.dfTime  = 0;
        this.surplusTime = 0;

        Game.DigModel.setOpenEnemy(true);

        this.digInfo = Game.DigModel.getRobDigInfo();
        let info = Game.DigModel.getRobDigInfo();

        //国家,玩家昵称
        if(info.country == 1){
            this.lab_title.string = "【火】"+info.name+"的庄园";
        }else if(info.country == 2){
            this.lab_title.string = "【冰】"+info.name+"的庄园";
        };

        //界面初始化
        let minesStatus = Game._.get(info, 'minesStatus', []);
        for (let i = 0; i < minesStatus.length; i++){
            //矿点数据
            this.refreshDigg(minesStatus[i]);
        };

        //占领区数据
        if(info.capture != null)
        {
            if(info.capture.length > 0){
                //占领区有数据
                if(info.capture.length == 1){
                    //只有一个数据
                    this.refreshCapture(info.capture[0].index,info.capture[0]);
                    if(info.capture[0].index == 1){
                        this.refreshCapture(2,null);
                    }else{
                        this.refreshCapture(1,null);
                    };
                }else{
                    this.refreshCapture(info.capture[0].index,info.capture[0]);
                    this.refreshCapture(info.capture[1].index,info.capture[1]);
                };
    
            }else{
                this.refreshCapture(1,null);
                this.refreshCapture(2,null);
            };
        }else
        {
            this.refreshCapture(1,null);
            this.refreshCapture(2,null);
        }
        

    },

    refreshDigg(info){
        let mineId = info.mineid;

        //界面刷新初始化-----start-------
        let childStr = "DigItemNode_" + mineId;
        let all_node = this.node.getChildByName("node_all");
        let digItemNode = all_node.getChildByName(childStr);
        let img_bless_bg = digItemNode.getChildByName("node_layout").getChildByName("img_bless_bg");
        let txt_img = digItemNode.getChildByName("node_layout").getChildByName("img_mine_bg");
        let btn_map = digItemNode.getChildByName("btn_map");
        let total_layer = digItemNode.getChildByName("img_total_bg");
        let total_img = total_layer.getChildByName("spr_total_icon");
        let total_txt = total_layer.getChildByName("lab_total_num");
        let dig_capture = digItemNode.getChildByName("node_layout").getChildByName("spr_dig_capture");
        let spr_dig_capture_icon = dig_capture.getChildByName("Sprite_").getChildByName("spr_dig_capture_icon");
        let dig_captureName = dig_capture.getChildByName("Sprite_").getChildByName("lab_dig_captureName");
        let mine_txt = txt_img.getChildByName("lab_mine_data");
        let img_value_bg = digItemNode.getChildByName("img_value_bg");
        let valueTxt = img_value_bg.getChildByName("lab_value_num");
        let red_point = img_value_bg.getChildByName("Sprite_anniu");
        red_point.active = false;
        let btn_quick = digItemNode.getChildByName("btn_quick");
        btn_quick.active = false;

        valueTxt.getComponent(cc.Label_).string = "";
        txt_img.active = false;
        btn_map.getComponent(cc.Button_).interactable = false;
        img_bless_bg.active = false;
        total_layer.active = false;
        dig_capture.active = false;
        img_value_bg.active = false;
        mine_txt.string = "";
        //界面刷新初始化-----end--------
        this.arrayMineTxt.push(mine_txt);

        //判断矿点是否可以占领
        if(info.open && info.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_NONE && info.status != 1){
            if(btn_map != null){
                btn_map.getComponent(cc.Button_).interactable = true;
            };
        };

        //判断地图颜色
        let digg_quality = digItemNode.getChildByName("spr_quality");
        let picStr = "Image/Map/zhuangyuan/diggColor_"+info.color;
        digg_quality.getComponent(cc.Sprite_).SetSprite(picStr);
        if(mineId == 2 || mineId == 4){
            digg_quality.setScale(-1,1);
        }else{
            digg_quality.setScale(1,1);
        }

        //显示矿点总量
        if(info.minetype == 1 && info.total_money > 0){
            total_layer.active = true;
            total_img.getComponent(cc.Sprite_).SetSprite("Image/UI/Common/image_Silvercoin");
            total_txt.getComponent(cc.Label_).string = "*" + Game.Tools.UnitConvert(info.total_money);
        }else if(info.minetype == 2 && info.total_itemnum > 0){
            total_layer.active = true;
            let objData = Game.ItemModel.GetItemConfig(info.total_itemid);
            let picStr_2 = objData.pic;
            total_img.getComponent(cc.Sprite_).SetSprite(picStr_2);
            total_txt.getComponent(cc.Label_).string = "*" + Game.Tools.UnitConvert(info.total_itemnum);
        }else if(info.minetype == 3 && info.total_equip > 0){
            total_layer.active = true;
            total_img.getComponent(cc.Sprite_).SetSprite("Image/UI/MiniLevelView/wabao_zhuangbei");
            total_txt.getComponent(cc.Label_).string = "*" + Game.Tools.UnitConvert(info.total_equip);
        };

        //显示矿点占领者
        if(info.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_BE_CAPTURE){
            dig_capture.active = true;
            dig_captureName.getComponent(cc.Label_).string = info.capture_name;
        };

        if(info.status == 1){
            //未挖
            img_value_bg.active = false;
        }else if(info.status == 2){
            //正在挖
            txt_img.active = true;
            img_value_bg.active = true;
            if(info.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_NONE){
                valueTxt.color = cc.color(255, 0, 12,255);
                valueTxt.getComponent(cc.Label_).string = "可占领";
            }else if(info.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_PROTECT){
                valueTxt.color = cc.color(0, 255, 0,255);
                valueTxt.getComponent(cc.Label_).string = "保护中";
            }else if(info.rob_status == Game.Define.DIG_ROB_STATE.DIG_ROB_BE_CAPTURE){
                valueTxt.color = cc.color(0, 255, 0,255);
                valueTxt.getComponent(cc.Label_).string = "占领中";
            };

            this.arrayTimeSchedule[mineId-1] = Game.TimeController.GetCurTime() + info.timeremain;//记录剩余时间

        }else if(info.status == 3){
            //已挖完未领取
            txt_img.active = true;
            img_value_bg.active = true;
            mine_txt.getComponent(cc.Label_).string = "种植完成";
            this.arrayTimeSchedule[mineId-1] = 0;
        };

    },

    refreshCapture(id,info){
        //占领区初始化
        let nodeStr = "DigItemNode_cap_" + id;
        let all_node = this.node.getChildByName("node_all");
        let DigItemNode_cap = all_node.getChildByName(nodeStr);
        let img_bless_bg = DigItemNode_cap.getChildByName("node_layout").getChildByName("img_bless_bg");

        let capture = DigItemNode_cap.getChildByName("spr_quality");
        let colddownBg = DigItemNode_cap.getChildByName("node_layout").getChildByName("img_mine_bg");
        let captureTotal = DigItemNode_cap.getChildByName("img_total_bg");
        let captureBg = DigItemNode_cap.getChildByName("node_layout").getChildByName("spr_dig_capture");

        let img_capture = captureTotal.getChildByName("spr_total_icon");
        let item_capture = captureTotal.getChildByName("lab_total_num");
        let colddownTxt = colddownBg.getChildByName("lab_mine_data");
        let txt_name = captureBg.getChildByName("Sprite_").getChildByName("lab_dig_captureName");
        let img_value_bg = DigItemNode_cap.getChildByName("img_value_bg");
        let valueTxt = img_value_bg.getChildByName("lab_value_num");
        let red_point = img_value_bg.getChildByName("Sprite_anniu");
        red_point.active = false;
        this.arrayCaptureTime[id-1] = 0;
        let btn_quick = DigItemNode_cap.getChildByName("btn_quick");
        btn_quick.active = false;

        colddownBg.active = false;
        captureTotal.active = false;
        captureBg.active = false;
        img_bless_bg.active = false;
        img_value_bg.active = false;
        txt_name.getComponent(cc.Label_).string = "";
        colddownTxt.getComponent(cc.Label_).string = "";
        this.arrayColddownTxt.push(colddownTxt);

        //占领区数据
        if(info != null){
            //占领区有数据
            captureTotal.active = true;
            captureBg.active = true;
            img_value_bg.active = true;
            txt_name.getComponent(cc.Label_).string = info.name;

            this.arrayCaptureTime[id-1] = Game.TimeController.GetCurTime() + info.colddown;//剩余时间
            if(info.colddown == 0){
                colddownBg.active = false;
                colddownTxt.getComponent(cc.Label_).string = "";
            }else{
                colddownBg.active = true;
                colddownTxt.getComponent(cc.Label_).string = Game.Tools.FormatSeconds(info.colddown);
            };

            //被占的类型和数量
            if(info.minetype == 1){
                img_capture.getComponent(cc.Sprite_).SetSprite("Image/UI/Common/image_Silvercoin");
            }else if (info.minetype == 2){
                let objData = Game.ItemModel.GetItemConfig(info.itemid);
                let picStr_obj = objData.pic;
                img_capture.getComponent(cc.Sprite_).SetSprite(picStr_obj);
            }else if(info.minetype == 3){
                img_capture.getComponent(cc.Sprite_).SetSprite("Image/UI/MiniLevelView/wabao_zhuangbei");
            };
            item_capture.getComponent(cc.Label_).string = "*" + Game.Tools.UnitConvert(info.num);

            //被占矿品质
            let picStr = "Image/Menu/Map/zhuangyuan/diggColor_"+info.color;
            capture.getComponent(cc.Sprite_).SetSprite(picStr);

        }else{
            //占领区空的
            captureTotal.active = false;
            img_value_bg.active = false;
            capture.getComponent(cc.Sprite_).SetSprite("Image/Map/zhuangyuan/diggColor_blank");//无植物图片
        }
        if(id == 2){
            capture.setScale(-1,1);
        }else{
            capture.setScale(1,1);
        };

    },

    refreshTime(){
        for(let i = 0; i < this.arrayTimeSchedule.length; i++){
            let leftTime_1 = this.arrayTimeSchedule[i] - Game.TimeController.GetCurTime();
            if(leftTime_1 >= 0){
                this.arrayMineTxt[i].getComponent(cc.Label_).string = Game.Tools.FormatSeconds(leftTime_1);
            };
        };

        for(let i = 0; i < this.arrayCaptureTime.length; i++){
            let leftTime_2 = this.arrayCaptureTime[i] - Game.TimeController.GetCurTime();
            if(leftTime_2 >= 0){
                this.arrayColddownTxt[i].getComponent(cc.Label_).string = Game.Tools.FormatSeconds(leftTime_2);
            };
        };

    },


    
    //====================  回调类函数  ====================
    onBtn_Map_Touch(event, mine_id){
        cc.log('DigOtherView onBtn_Map_Touch id == ' + mine_id);
        this.mineId = mine_id;

        if(this.digInfo.minesStatus[mine_id-1].status == 2 && this.digInfo.minesStatus[mine_id-1].rob_status == 0){
            //正在远古遗迹藏未保护不是活力矿
            let msg = {};
            msg.charid = this.digInfo.charid;
            msg.mineid = this.mineId;
            Game.NetWorkController.SendProto('msg.ReqDigPkAward', msg);
        }else if(this.digInfo.minesStatus[mine_id-1].status == 3 && this.digInfo.minesStatus[mine_id-1].rob_status == 0){
            //临时去掉宝藏不能抢夺
        }else if(this.digInfo.minesStatus[mine_id-1].status == 2 && this.digInfo.minesStatus[mine_id-1].rob_status == 2){
            //已经被占领
            let tipStr = "此农田被"+this.digInfo.minesStatus[mine_id-1].capture_name+"占领！";
            Game.NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, tipStr);
        }else if(this.digInfo.minesStatus[mine_id-1].rob_status == 1){
            //保护中
            Game.NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, "农田保护中...");
        };

    },

    onBtn_Back_MyDig_Touch(event, customEventData){
        this.closeView(this._url,true);
        Game.ViewController.OpenView(Game.UIName.UI_DIGVIEW,"ViewLayer");
    },

});
