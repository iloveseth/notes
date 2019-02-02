const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        richtxt_title_progress: { default: null, type: cc.RichText_ },
        richtxt_desc: { default: null, type: cc.RichText_ },
        btn_bg: { default: null, type: cc.Button_ },
    },

    onLoad: function () {
    },
    
    start() {
    },

    update(dt) {
        let leftTime = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_TARGET_SMALL);
        if(leftTime <= 0 && Game.GlobalModel.canShowTargetGuideView){
            Game.CountDown.SetCountDown(Game.CountDown.Define.TYPE_TARGET_SMALL, 5);
            if(Game.GlobalModel.chatViewIsOpen){
                // cc.log("Game.GlobalModel.chatViewIsOpen");
                return};
            let TargetGuideView_node = Game.ViewController.SeekChildByNameList(cc.director.getScene().getChildByName('Canvas'), ["GuideLayer","TargetGuideView"]);
            if(TargetGuideView_node != null && TargetGuideView_node.active){
                // cc.log("TargetGuideView_node is show");
                return};
            let ViewLayer_node = Game.ViewController.SeekChildByNameList(cc.director.getScene().getChildByName('Canvas'), ["ViewLayer"]);
            let LevelView_node = Game.ViewController.SeekChildByNameList(cc.director.getScene().getChildByName('Canvas'), ["ViewLayer","LevelView"]);
            if(LevelView_node != null){
                let childrenNum = ViewLayer_node.children.length;
                let siblingIndex = LevelView_node.getSiblingIndex();
                // cc.log("childrenNum == " + childrenNum);
                // cc.log("siblingIndex == " + (siblingIndex+1));
                if((siblingIndex+1) == childrenNum){
                    Game.TargetGuideController.StartGuideWithSubId(100000);
                };
            }
        };
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
        Game.NetWorkController.AddListener('lvltask.retNewTargetTask', this, this.onRetNewTaskDetail);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TARGET_FIGHT_BOSS, this, this._targetFightBoss);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TOUCH_END, this, this.onTouchEnd);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('lvltask.retNewTargetTask', this, this.onRetNewTaskDetail);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TARGET_FIGHT_BOSS, this, this._targetFightBoss);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TOUCH_END, this, this.onTouchEnd);
    },

    initView(){
        this.taskID = 0;
        this.trunkData = null;
        this.isFinish = false;
        this.richtxt_title_progress.string = "";
        this.richtxt_desc.string = "";
        this.btn_bg.interactable = true;
        this.onRetNewTaskDetail(0,Game.TargetGuideController.taskDetailMsg);
        Game.CountDown.SetCountDown(Game.CountDown.Define.TYPE_TARGET_SMALL, 5);

    },


    _targetFightBoss(){
        if(this.taskID == 0){return};
        let generalData = Game.ConfigController.GetConfigById("newleveltask_data",this.taskID);
        if(!generalData){
            let tipstr = "_targetFightBoss 获取配表信息失败 taskid == "+this.taskID;
            cc.log(tipstr);
            return;
        };
        let curnum = Game._.get(this.trunkData,"curnum",0);
        let maxnum = Game._.get(this.trunkData,"maxnum",0);
        let taskName = Game._.get(generalData,'name',"");
        let titleStr = taskName;
        let tasktype = Game._.get(generalData,'type',0);
        if(tasktype == 1){
            //通关类型
            let isFinish = curnum > maxnum;
            let propertiesStr = "进行中";
            if(!isFinish){
                this.richtxt_title_progress.string = "<outline color=#6F3312 width=2><color=#FFF9E6>"+titleStr+"</c><color=red>"+" "+propertiesStr+"</color></outline>";
            }
        }


    },



    //====================  这是分割线  ====================
    onRetNewTaskDetail(msgid, msg){
        this.taskID = Game._.get(msg,'id',0);
        if(this.taskID == 0){
            cc.log("TargetTaskSmallNode this.taskID == 0 return");
            this.node.active = false;
            return;
        };
        this.trunkData = msg;

        

        let generalData = Game.ConfigController.GetConfigById("newleveltask_data",this.taskID);
        if(!generalData){
            let tipstr = "获取配表信息失败 taskid == "+this.taskID;
            cc.log(tipstr);
            // Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS,tipstr);
            return;
        };

        let curnum = Game._.get(msg,"curnum",0);
        let maxnum = Game._.get(msg,"maxnum",0);
        
        let tasktype = Game._.get(generalData,'type',0);
        let taskName = Game._.get(generalData,'name',"");
        let targetString = Game._.get(generalData,'target',"");

        let titleStr = taskName;
        let propertiesStr = "";
        if(tasktype == 1){
            //通关类型
            this.isFinish = curnum > maxnum;
            propertiesStr = this.isFinish?"已完成":"（0/1）";
        }else{
            //其他类型
            // let needValue = Game._.get(generalData,'value',0);
            // let curValue = 0;
            this.isFinish = curnum >= maxnum;
            propertiesStr = "（"+curnum+"/"+maxnum+"）";
        }
        let progressStr = "";
        if(this.isFinish){
            progressStr = "<outline color=#6F3312 width=2><color=#FFF9E6>"+titleStr+"</c><color=green>"+" "+propertiesStr+"</color></outline>";
        }else{
            progressStr = "<outline color=#6F3312 width=2><color=#FFF9E6>"+titleStr+"</c><color=red>"+" "+propertiesStr+"</color></outline>";
        }

        if(Game.GlobalModel.targetNeedFade){
            Game.GlobalModel.targetNeedFade = false;
            this.richtxt_title_progress.node.runAction(cc.sequence([
                cc.fadeOut(0.3),
                cc.callFunc(function () {
                    this.richtxt_title_progress.string = progressStr;
                }.bind(this)),
                cc.fadeIn(0.3)
            ]));
            this.richtxt_desc.node.runAction(cc.sequence([
                cc.fadeOut(0.3),
                cc.callFunc(function () {
                    this.richtxt_desc.string = targetString;
                }.bind(this)),
                cc.fadeIn(0.3),
                cc.delayTime(0.5),
                cc.callFunc(function () {
                    this.btn_bg.interactable = true;
                }.bind(this)),
            ]));
            
        }else{
            this.richtxt_title_progress.string = progressStr;
            this.richtxt_desc.string = targetString;
        };

    },



    onBtn_click(){
        cc.log("TargetTaskSmallNode onBtn_click");
        // Game.TargetGuideController.StartGuideWithSubId(1401);

        if(this.trunkData == null){return};
        if(this.isFinish){
            Game.GlobalModel.targetNeedFade = true;
            this.btn_bg.interactable = false;
            Game.NetWorkController.SendProto('lvltask.GetNewTargetReward', {});
        }else{
            this.scheduleOnce(function () {
                let taskData = Game.ConfigController.GetConfigById("newleveltask_data",this.taskID)
                Game.TargetGuideController.StartGuide(taskData);
            }.bind(this), 0.1);
        };
    },


    onTouchEnd(){
        cc.log("TargetTaskSmallNode onTouchEnd");
        Game.CountDown.SetCountDown(Game.CountDown.Define.TYPE_TARGET_SMALL, 5);
    },

});
