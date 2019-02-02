const Game = require('../../Game');
var jijieType = cc.Enum({
    BorderPK: 1,//边境PK
    DigRecapture: 2,//庄园战斗
    WorldBoss:3,//世界BOSS
    Revenge: 4,//复仇
    SeptBorderPK: 5,//工会守边
    SeptTreasure: 6,//工会宝藏
    CountryWar: 7,//王国战争
    KingFight: 8,//争夺王位
    SeptPK: 9,//工会战
    SeptGuard: 10,//截取晶石
});
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_zhanlingqu: { default: null, type: cc.Node },
        node_zhanlingzhuangtai: { default: null, type: cc.Node },
        node_duohuizhuangtai: { default: null, type: cc.Node },
        node_spoils_yinzi: { default: null, type: cc.Node },
        node_spoils_daoju: { default: null, type: cc.Node },
        node_spoils_zhuangbei: { default: null, type: cc.Node },
        node_spoils_zhuangbei_total: { default: null, type: cc.Node },
        lab_title_name: { default: null, type: cc.Label_ },
        lab_owner_name: { default: null, type: cc.Label_ },
        lab_fight_num: { default: null, type: cc.Label_ },
        lab_yinzi_num: { default: null, type: cc.Label_ },
        lab_daoju_num: { default: null, type: cc.Label_ },
        lab_zhuangbei_num: { default: null, type: cc.Label_ },
        lab_txt_dhMsg: { default: null, type: cc.Label_ },
        lab_txt_dhMsg_left: { default: null, type: cc.Label_ },
        spr_daoju_icon: { default: null, type: cc.Sprite_ },
        btn_recapture: { default: null, type: cc.Button_ },
        btn_mass: { default: null, type: cc.Button_ },
    },

    onLoad() {
        //庄园占领or夺回界面
        cc.log('DigOccupationNode onLoad');
        //初始化变量
        this.charId = 0;
        this.mineId = 0;
        this.arrayEquip = [];

        // this.node_duohuizhuangtai.getChildByName("btn_mass").active = false;//暂无集结功能
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
        for (let i = 1; i <= 5; i++){
            let childStr = "lab_color_" + i;
            let zb_lab = this.node_spoils_zhuangbei.getChildByName(childStr).getComponent(cc.Label_);
            zb_lab.string = "";
            zb_lab.node.active = false;
            this.arrayEquip.push(zb_lab);
        };

        this.node_zhanlingzhuangtai.active = false;
        this.node_zhanlingqu.active = false;
        this.node_duohuizhuangtai.active = false;

        this.node_spoils_yinzi.active = false;
        this.node_spoils_daoju.active = false;
        this.node_spoils_zhuangbei.active = false;
        this.node_spoils_zhuangbei_total.active = false;

        this.lab_yinzi_num.string = "";
        
        if(this._data.typeId == 1){
            this.refreshView();
        }else if(this._data.typeId == 2){
            this.refreshMyView();
        }else if(this._data.typeId == 3){
            this.refreshCaptureView();
        }
        

        
    },

    refreshView(){
        let info = Game.DigModel.getDigPkAward();

        this.charId = info.charid;
        this.mineId = info.mineid;
        this.node_zhanlingzhuangtai.active = true;

        this.lab_title_name.string = "占领";
        this.lab_owner_name.string = info.name;
        this.lab_fight_num.string = info.fight;
        
        if(info.minetype == 1){
            //银币
            this.node_spoils_yinzi.active = true;
            let numStr = Game.Tools.UnitConvert(info.money) + "两";
            this.lab_yinzi_num.string = numStr;
        }else if(info.minetype == 2){
            //道具
            if(info.items.length > 0){
                this.node_spoils_daoju.active = true;
                let obj = Game.ItemModel.GetItemConfig(info.items[0].itemid);
                let picStr = obj.pic;
                this.spr_daoju_icon.SetSprite(picStr);//变更物品图标
                this.lab_daoju_num.string = "*" + info.items[0].num;
            };
        }else if(info.minetype == 3){
            //装备
            this.node_spoils_zhuangbei_total.active = true;
            this.lab_zhuangbei_num.string = "*" + info.equipnum;
        }

    },

    refreshMyView(){
        let mine_info = Game.DigModel.getCaptureMineInfo();
        this.node_zhanlingqu.active = true;
        this.lab_title_name.string = "占领";
        this.lab_owner_name.string = mine_info.name;
        this.lab_fight_num.string = mine_info.fightval;

        if(mine_info.minetype == 1){
            //银子
            this.node_spoils_yinzi.active = true;
            let numStr = Game.Tools.UnitConvert(mine_info.money) + "两";
            this.lab_yinzi_num.string = numStr;
        }else if(mine_info.minetype == 2){
            //道具
            if(mine_info.items.length > 0){
                this.node_spoils_daoju.active = true;
                let obj = Game.ItemModel.GetItemConfig(mine_info.items[0].itemid);
                let picStr = obj.pic;
                this.spr_daoju_icon.SetSprite(picStr);//变更物品图标
                this.lab_daoju_num.string = "*" + mine_info.items[0].num;
            };
        }else if(mine_info.minetype == 3){
            //装备
            this.node_spoils_zhuangbei.active = true;
            for(let i = 0; i < mine_info.equips.length; i++){
                let equip_type = mine_info.equips[i].color;
                let equip_num = mine_info.equips[i].num;
                let lab_equip = this.arrayEquip[equip_type-1];
                let equipStr = "无"
                if(equip_type == 1){
                    equipStr = "白色*" + equip_num;
                }else if(equip_type == 2){
                    equipStr = "绿色*" + equip_num;
                }else if(equip_type == 3){
                    equipStr = "蓝色*" + equip_num;
                }else if(equip_type == 4){
                    equipStr = "紫色*" + equip_num;
                }else if(equip_type == 5){
                    equipStr = "橙色*" + equip_num;
                }
                lab_equip.string = equipStr;
                lab_equip.node.active = true;
            };

        }

    },

    refreshCaptureView(){
        let mine_info = Game.DigModel.getOneMineInfo();
        this.mineId = mine_info.mineid;

        this.node_duohuizhuangtai.active = true;

        this.lab_title_name.string = "夺回";
        this.lab_owner_name.string = mine_info.capture_name;
        this.lab_fight_num.string = mine_info.fightval;
        let changeStr = "无";
        let time = (Math.floor(mine_info.capturecd/3600))%24;
        if(time > 0){
            let tempStr_1 = "敌国的%s占领了你的宝藏,%d时%d分%d秒后对方将成功争夺你得收获,是否确认夺回矿点?"
            changeStr = cc.js.formatStr(tempStr_1,mine_info.capture_name,(Math.floor(mine_info.capturecd/3600))%24,(Math.floor(mine_info.capturecd/60))%60,mine_info.capturecd%60);
        }else{
            let tempStr_2 = "敌国的%s占领了你的宝藏,%d分%d秒后对方将成功争夺你得收获,是否确认夺回矿点?"
            changeStr = cc.js.formatStr(tempStr_2,mine_info.capture_name,(Math.floor(mine_info.capturecd/60))%60,mine_info.capturecd%60);
        }
        this.lab_txt_dhMsg.string = changeStr;
        this.lab_txt_dhMsg_left.string = cc.js.formatStr("剩余夺回次数(%d)",mine_info.left_recap);
        if(mine_info.left_recap <= 2){
            this.btn_recapture.node.active = true
            this.btn_recapture.node.setPositionX(-66);
            this.btn_mass.node.active = true
            this.btn_mass.node.setPositionX(100);
        }else{
            this.btn_recapture.node.active = true
            this.btn_recapture.node.setPositionX(0);
            this.btn_mass.node.active = false;
            this.btn_mass.node.setPositionX(100);
        }
    },

    
    //====================  回调类函数  ====================
    onLayout_bg_Touch(){
        cc.log('DigOccupationNode onLayout_bg_Touch');
        this.closeView(this._url,true);
    },

    onBtn_close_Touch(){
        cc.log('DigOccupationNode onBtn_close_Touch');
        this.closeView(this._url,true);
    },

    onBtn_affirm_zl_Touch(){//确定占领
        cc.log('DigOccupationNode onBtn_affirm_zl_Touch');

        // local msg = msg_dig2_pb.ReqDigPk()
        // msg.type = msg_dig2_pb.DIG_PK_CAPTURE
        // msg.charid = self.charId
        // msg.mineid = self.mineId
        // msg.index = g_MsgDigData.captrueMineId
        // SEND_PROTO_MSG(msg)
        let msg = {};
        msg.type = Game.Define.DIG_PK_TYPE.DIG_PK_CAPTURE;
        msg.charid = this.charId;
        msg.mineid = this.mineId;
        msg.index = Game.DigModel.getCaptrueMineId();
        Game.NetWorkController.SendProto('msg.ReqDigPk', msg);
        this.closeView(this._url,true);
    },

    onBtn_recapture_Touch(){//夺回
        cc.log('DigOccupationNode onBtn_afonBtn_recapture_Touchfirm_zl_Touch');
        // local msg = msg_dig2_pb.ReqDigPk()
        // msg.type = msg_dig2_pb.DIG_PK_RECAPTURE
        // msg.mineid = self.mineId
        // SEND_PROTO_MSG(msg)
        let msg = {};
        msg.type = Game.Define.DIG_PK_TYPE.DIG_PK_RECAPTURE;
        msg.mineid = this.mineId;
        Game.NetWorkController.SendProto('msg.ReqDigPk', msg);
        this.closeView(this._url,true);
    },

    onBtn_mass_Touch(){//集结
        cc.log('DigOccupationNode onBtn_mass_Touch');
        Game.JijieModel.callJijie(this.mineId,jijieType.DigRecapture);
        this.closeView(this._url,true);
    },

});
