const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        btn_get_acc_reward: { default: null, type: cc.Button_ },
        lab_acc_desc: { default: null, type: cc.Label_ },
        lab_acc_notice: { default: null, type: cc.Label_ },
        spr_bg_tab: { default: [], type: [cc.Sprite_] },
        lab_acc_tab: { default: [], type: [cc.Label_] },
        spr_acc_tab: { default: [], type: [cc.Sprite_] },
        btn_type_day: { default: null, type: cc.Button_ },
        btn_type_sys: { default: null, type: cc.Button_ },
        Node_top: { default: null, type: cc.Node },
        Node_sys: { default: null, type: cc.Node },
        Node_day: { default: null, type: cc.Node },
        Node_Make: { default: null, type: cc.Node },
        tableView_daye: { default: null, type: cc.tableView },
        tableView_sys: { default: null, type: cc.tableView },
        btn_get_all: { default: null, type: cc.Button_ },
        spr_red_daily: { default: null, type: cc.Sprite_ },
        spr_red_grow: { default: null, type: cc.Sprite_ },
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
        Game.NotificationController.On(Game.Define.EVENT_KEY.WELFARE_RET_DAY_GROW_LIST,this,this.retDayGrowList);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WELFARE_SEND_SYS_REWARD,this,this.send_SysReward);
        Game.NotificationController.On(Game.Define.EVENT_KEY.WELFARE_RET_DAY_GROW_ACC,this,this.retDayGrowAcc);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WELFARE_RET_DAY_GROW_LIST,this,this.retDayGrowList);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WELFARE_SEND_SYS_REWARD,this,this.send_SysReward);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.WELFARE_RET_DAY_GROW_ACC,this,this.retDayGrowAcc);
    },

    initView(){
        this.mtype = 1;
        this.acc_reward_id = 0;
        // this.onBtn_dayType_click();
        Game.NetWorkController.SendProto('msg.reqSysReward', {});
        
        for(let i = 0; i < 3; i++){
            this.spr_bg_tab[i].node.active = false;
        };

        //红点信息
        this.retDayGrowList();
        Game.NetWorkController.SendProto('daygrow.retDayGrowAccInfo', {});
        this.Node_top.active = true;
        this.Node_Make.active = true;
        this.Node_day.active = true;
        this.Node_sys.active = false;
        this.btn_type_day.interactable = false;
        this.btn_type_sys.interactable = true;
    },

    retDayGrowAcc(msg){
        if(this.mtype == 1){
            this.showAccInfo(msg);
        };
    },

    showAccInfo(msg){
        //显示累计任务
        let tmpWard = Game.ConfigController.GetConfigById("daygrowacc_data",msg.id);
        this.lab_acc_desc.string = tmpWard.desc;
        this.lab_acc_notice.string = msg.num + "/" + tmpWard.point;
        if(msg.progress == Game.Define.DayGrowStatus.DayGrow_UNGET){
            this.acc_reward_id = tmpWard.id;
            this.btn_get_acc_reward.interactable = true;
            this.accret = true;
        }else{
            this.acc_reward_id = 0;
            this.btn_get_acc_reward.interactable = false;
            this.accret = false;
            if(msg.progress == Game.Define.DayGrowStatus.DayGrow_GET){
                this.btn_get_acc_reward.node.active = false;
            }
        };

        this.showOrHideBtn();
        this.showRewardData(tmpWard.rewardid);
        
    },

    showRewardData(rewardid){
        let reward = Game.ConfigController.GetConfigById("commonreward_data",rewardid);
        let idx = 0;
        let yuanbao = reward.yuanbao;
        let gold = reward.gold;
        let money = reward.money;
        let fame = reward.fame;
        if(yuanbao > 0){
            
            this.spr_bg_tab[idx].node.active = true;
            this.lab_acc_tab[idx].string = "x" + Game.Tools.UnitConvert(yuanbao);
            this.spr_acc_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",323).pic);
            idx = idx + 1;
        };
        if(gold > 0){
            
            this.spr_bg_tab[idx].node.active = true;
            this.lab_acc_tab[idx].string = "x" + Game.Tools.UnitConvert(gold);
            this.spr_acc_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",109).pic);
            idx = idx + 1;
        };
        if(money > 0){
            
            this.spr_bg_tab[idx].node.active = true;
            this.lab_acc_tab[idx].string = "x" + Game.Tools.UnitConvert(money);
            this.spr_acc_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",108).pic);
            idx = idx + 1;
        };
        if(fame > 0){
            
            this.spr_bg_tab[idx].node.active = true;
            this.lab_acc_tab[idx].string = "x" + Game.Tools.UnitConvert(fame);
            this.spr_acc_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",282).pic);
            idx = idx + 1;
        };

        let item = reward.item;
        if(item !== "" && item !== "0"){
            let items = item.split(";");
            for(let i = 0; i < items.length; i++){
                let tbitem = items[i].split("-");
                if(idx <= 2){
                    this.spr_bg_tab[idx].node.active = true;
                    this.lab_acc_tab[idx].string = "x" + Game.Tools.UnitConvert(tbitem[1]);
                    this.spr_acc_tab[idx].SetSprite(Game.ConfigController.GetConfigById("object_data",tbitem[0]).pic);
                };
                idx = idx + 1;
            };
        };


    },


    retDayGrowList(){
        if(this.mtype == 1){
            let daygrowlist = Game.WelfareModel.getDaygrowlist();
            this.tableView_daye.initTableView(daygrowlist.length, { array: daygrowlist, target: this });

            this.showOrHideBtn();
        };

        this.spr_red_daily.node.active = Game.WelfareModel.m_getall;
        this.spr_red_grow.node.active = Game.WelfareModel.m_getaward;
    },

    send_SysReward(){
        if(this.mtype == 2){
            let vectorOrder = Game.WelfareModel.getVectorOrder();
            this.tableView_sys.initTableView(vectorOrder.length, { array: vectorOrder, target: this });
            
            let getGetaward = Game.WelfareModel.getGetaward();
            if(getGetaward){
                this.btn_get_all.interactable = true;
            }else{
                this.btn_get_all.interactable = false;
            };
        }
        this.spr_red_daily.node.active = Game.WelfareModel.m_getall;
        this.spr_red_grow.node.active = Game.WelfareModel.m_getaward;
    },

    showOrHideBtn(){
        let isGetAll = Game.WelfareModel.getIsGetAll();
        if(isGetAll || this.accret){
            this.btn_get_all.interactable = true;
        }else{
            this.btn_get_all.interactable = false;
        }
    },

    //====================  这是分割线  ====================

    onBtn_getAccReward_click(){
        //累计每日试炼奖励领取
        Game.NetWorkController.SendProto('daygrow.reqDayGrowAccReward', {id:this.acc_reward_id});
    },

    onBtn_dayType_click(){
        //每日试炼类型
        this.mtype = 1;
        Game.NetWorkController.SendProto('daygrow.retDayGrowList', {});
        Game.NetWorkController.SendProto('daygrow.retDayGrowAccInfo', {});
        this.Node_top.active = true;
        this.Node_Make.active = true;
        this.Node_day.active = true;
        this.Node_sys.active = false;
        this.btn_type_day.interactable = false;
        this.btn_type_sys.interactable = true;
        
    },

    onBtn_sysType_click(){
        //成长试炼类型
        this.mtype = 2;
        Game.NetWorkController.SendProto('msg.reqSysReward', {});
        this.Node_top.active = true;
        this.Node_Make.active = false;
        this.Node_day.active = false;
        this.Node_sys.active = true;
        this.btn_type_day.interactable = true;
        this.btn_type_sys.interactable = false;
    },

    onBtn_getAll_click(){
        //一键领取
        if(this.mtype == 1){
            Game.NetWorkController.SendProto('daygrow.reqDayGrowRewardAll', {});
        }else if(this.mtype == 2){
            Game.NetWorkController.SendProto('msg.getSysRewardAll', {});
        }
    },

});
