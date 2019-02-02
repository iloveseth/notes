const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        spr_task_icon: { default: null, type: cc.Sprite_ },
        lab_task_name: { default: null, type: cc.Label_ },
        lab_task_lv: { default: null, type: cc.Label_ },
        lab_RichText_desc: { default: null, type: cc.RichText },
        lab_task_target: { default: null, type: cc.RichText },
        btn_get_reward: { default: null, type: cc.Button_ },
        lab_btn_text: { default: null, type: cc.Label_ },

        spr_bg_tab: { default: [], type: [cc.Sprite_] },
        spr_acc_tab: { default: [], type: [cc.Sprite_] },
        lab_acc_tab: { default: [], type: [cc.Label_] },
        spr_red_point: { default: null, type: cc.Sprite_ },
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
        Game.NetWorkController.AddListener('lvltask.retTaskDetail', this, this.onRetTaskDetail);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('lvltask.retTaskDetail', this, this.onRetTaskDetail);
    },

    initView(){
        this.taskID = 0;
        this.isFinish = 0;
        this.gotoPanelId = 0;
        for(let i = 0; i < this.spr_bg_tab.length; i++){
            this.spr_bg_tab[i].node.active = false;
        };
        // Game.NetWorkController.SendProto('lvltask.reqTaskDetail', {});

        this.onRetTaskDetail(0,this._data);
    },

    togoTaskPanel(){
        if(this.gotoPanelId == 1){
            //公会
            let tLevel = Game.UserModel.GetLevel();
            let tbx_harry = Game.ConfigController.GetConfigById("levellimit_data",18);
            if(tLevel < tbx_harry.limit){
                let map = Game.ConfigController.GetConfigById("newmap_data",tbx_harry.limit).disc;
                let msg = map + "开放公会功能";
                NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, msg);
                return;
            };
            if (Game.UserModel.GetSeptname() != '') {
                Game.NetWorkController.SendProto('msg.reqMySeptInfoNew', {});
            } else {
                this.openView(Game.UIName.UI_SEPTJOINVIEW);
            }
        }else if(this.gotoPanelId == 2){
            this.openEquipType();
        }else if(this.gotoPanelId == 3){
            this.openEquipType();
        }else if(this.gotoPanelId == 4){
            this.openEquipType();
        }else if(this.gotoPanelId == 5){
            this.openEquipType();
        }else if(this.gotoPanelId == 6){
            this.openEquipType();
        }else if(this.gotoPanelId == 7){
            //前往战斗地图
            this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Pass);
        }

    },

    openEquipType(){
        let mine_occupation = Game.UserModel.GetUserOccupation();
        let equip_type = Game.EquipModel.GetMainArmsByOccupation(mine_occupation);
        let equipInfo = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, equip_type);
        if(equipInfo == null){
            this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Equip);
        }else{
            this.openView(Game.UIName.UI_EQUIPINFO, equipInfo);
        }
    },

    openMainView(ui){
        Game.ViewController.OpenMainView(ui);
    },

    //====================  这是分割线  ====================
    onRetTaskDetail(msgid, msg){
        this.taskID = msg.taskid;
        this.isFinish = msg.isfinish;

        if(msg.taskid == 0){
            this.onClose();
        }
        
        let mylvl = Game.UserModel.GetLevel();
        let generalData = Game.ConfigController.GetConfigById("newleveltask_data",msg.taskid);
        if(!generalData){
            let tipstr = "获取配表信息失败 taskid == "+msg.taskid;
            cc.log(tipstr);
            // Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS,tipstr);
            return;
        };
        let taskLvl = generalData.level || 0;
	    this.gotoPanelId = generalData.jump || 0;


        this.spr_task_icon.SetSprite(generalData.icon);
        this.lab_task_name.string = generalData.name;
        this.lab_task_lv.string = generalData.level;
        this.lab_RichText_desc.string = generalData.desc;
        this.lab_task_target.string = generalData.target;

        this.spr_red_point.node.active = false;
        if(mylvl < taskLvl){
            this.btn_get_reward.interactable = false;
            this.lab_btn_text.string = "等级不足";
            Game.UserModel.setTargetTaskRed(false);
        }else{
            this.btn_get_reward.interactable = true;
            if(this.isFinish == 1){
                this.lab_btn_text.string = "领取";
                this.spr_red_point.node.active = true;
                Game.UserModel.setTargetTaskRed(true);
            }else if(this.isFinish == 0){
                this.lab_btn_text.string = "前往";
                Game.UserModel.setTargetTaskRed(false);
            };
        };

        Game.NotificationController.Emit(Game.Define.EVENT_KEY.RED_TARGET);
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_MAINRED);

        let tmpWard = Game.ConfigController.GetConfigById("commonreward_data",generalData.reward);
        let rewardVec = [];
        if(tmpWard.item !== "" && tmpWard.item !== "0"){
            rewardVec = tmpWard.item.split(";");
        };
        

        let gold = tmpWard.gold;
        if(gold >= 0){
            let tempstr_1 = "109-"+gold;
            rewardVec.push(tempstr_1);
        };

        let silver = tmpWard.money;
        if(silver >= 0){
            let tempstr_2 = "108-"+silver;
            rewardVec.push(tempstr_2);
        };

        
        for(let i = 0; i < rewardVec.length; i++){
            let tmpVec = rewardVec[i].split("-");
            let obj = Game.ConfigController.GetConfigById("object_data",tmpVec[0]);

            this.spr_bg_tab[i].node.active = true;
            let pic = Game._.get(obj,"pic","Image/UI/Common/image_goldcoin");
            this.spr_acc_tab[i].SetSprite(pic);
            this.lab_acc_tab[i].string = "x" + Game.Tools.UnitConvert(tmpVec[1]);
        };

    },




    onBtn_get_reward_click(){
        if(this.isFinish == 1){
            Game.NetWorkController.SendProto('lvltask.reqGetTaskReward', {});
        }else if(this.isFinish == 0){
            this.togoTaskPanel();
        };
    },



});
