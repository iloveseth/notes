const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        LuckyStarEffNode: { default: null, type: cc.Node },
        Label_luckystarNum: { default: null, type: cc.Label_ },
        //幸运星
        Node_luckystar: { default: null, type: cc.Node },
        Label_luckystarTime: { default: null, type: cc.Label_ },
        //组队
        Node_team: { default: null, type: cc.Node },
        Label_teamTime: { default: null, type: cc.Label_ },
        //抢夺晶石
        Node_robbing: { default: null, type: cc.Node },
        Label_robbingTime: { default: null, type: cc.Label_ },
        //护送晶石
        Node_escortspar: { default: null, type: cc.Node },
        Label_escortsparTime: { default: null, type: cc.Label_ },
        //庄园祝福
        Node_dig: { default: null, type: cc.Node },
        Label_digTime: { default: null, type: cc.Label_ },
        //集结
        Node_jijie:{ default: null, type: cc.Node },
        Label_jijieTime: { default: null, type: cc.Label_ },

        Node_jijieRight: cc.Node,
        Label_jijieNumRight: cc.Label_,
    },

    onLoad() {
        this.initData();
        this.onUpdateLuckyStar();
        this.onUpdateTeamIcon();
        this.onUpdateRobbingIcon();
        this.onUpdateEscortsparIcon();
        this.onUpdateDigIcon();
        this.onUpdateJijieIcon();
    },

    onEnable() {
        this.initNotification();
    },
    onDisable: function () {
        this.cancleNotification();
    },
    update(dt) {
        this.dfTime += dt;

        if (this.dfTime >= 1) {      //统一计时器
            this.dfTime = 0;

            this.updateLuckyIcon();
            this.updateTeamIcon();
            this.updateRobbingIcon();
            this.updateEscortsparIcon();
            this.onUpdateDigIcon();
            this.onUpdateJijie();
        }
    },

    initData() {
        this.dfTime = 0;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.TASK_LUCKYSTAR_REFRESH, this, this.onUpdateLuckyStar);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BORDER_MYTEAMICON, this, this.onUpdateTeamIcon);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BORDER_LEAVETEAM, this, this.onUpdateTeamIcon);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ROBBINGSPAR_ICON_REFRESH, this, this.onUpdateRobbingIcon);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ESCORTSPAR_ICON_REFRESH, this, this.onUpdateEscortsparIcon);
        Game.NotificationController.On(Game.Define.EVENT_KEY.DIG_ICON_REFRESH, this, this.onUpdateDigIcon);
        Game.NotificationController.On(Game.Define.EVENT_KEY.JIJIE_LIST_REFRESH, this, this.onUpdateJijieIcon);
        Game.NotificationController.On(Game.Define.EVENT_KEY.JIJIE_LIST_REFRESH, this, this.onUpdateJijieNum);
    },
    cancleNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TASK_LUCKYSTAR_REFRESH, this, this.onUpdateLuckyStar);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BORDER_MYTEAMICON, this, this.onUpdateTeamIcon);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BORDER_LEAVETEAM, this, this.onUpdateTeamIcon);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ROBBINGSPAR_ICON_REFRESH, this, this.onUpdateRobbingIcon);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ESCORTSPAR_ICON_REFRESH, this, this.onUpdateEscortsparIcon);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.DIG_ICON_REFRESH, this, this.onUpdateDigIcon);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.JIJIE_LIST_REFRESH, this, this.onUpdateJijieIcon);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.JIJIE_LIST_REFRESH, this, this.onUpdateJijieNum);
    },

    //幸运星处理begin
    onUpdateLuckyStar() {
        if (Game.TaskModel.luckystarNum > 0) {
            this.Label_luckystarNum.setText(Game.TaskModel.luckystarNum);
        }
        this.LuckyStarEffNode.active = Game.TaskModel.luckystarNum > 0;

        let lastTime = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_LUCKSTAR);
        this.Node_luckystar.active = lastTime > 0;
        this.updateLuckyIcon();
    },
    updateLuckyIcon() {
        if (this.Node_luckystar.active) {
            let laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_LUCKSTAR, 'mm:ss');
            this.Label_luckystarTime.setText(laststr);
            if (laststr == '') {
                this.Node_luckystar.active = false;
            }
        }
    },
    onClickStar() {
        Game.NetWorkController.SendProto('msg.reqRedNum', {});
    },
    onClickOpenStarDetail() {
        if (Game.TaskModel.luckystarNum > 0) {
            Game.NetWorkController.SendProto('msg.reqRedNum', {});
        } else {
            Game.NetWorkController.SendProto('msg.reqSnatchRedEnvelope', {
                charid: Game.TaskModel.luckystarIconData.charid,
                time: Game.TaskModel.luckystarIconData.begintime
            });
        }
    },
    //幸运星处理end

    //组队处理begin
    onUpdateTeamIcon: function () {
        let state = Game.BorderModel.GetBorderState();
        this.Node_team.active = (state != 0);
        this.updateTeamIcon();
    },
    updateTeamIcon: function () {
        if (this.Node_team.active) {
            let state = Game.BorderModel.GetBorderState();
            if (state == Game.Define.BORDERTEAM_STATE.STATE_TEAMING) {
                this.Label_teamTime.setText(Game.BorderModel.GetBorderCardMembers() + '/' + Game.BorderModel.GetBorderCardMaxMembers());
            } else {
                let laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_BORDERTEAM, 'mm:ss', false);
                this.Label_teamTime.setText(laststr);
                if (laststr == '') {
                    this.Node_team.active = false;
                }
            }
        }
    },
    onClickTeam: function () {
        this.openView(Game.UIName.UI_DEFENBORDER);
    },
    //组队处理end

    //抢夺水晶祝福处理begin
    onUpdateRobbingIcon() {
        let lastTime = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_ROBBINGSPARBLESS);
        this.Node_robbing.active = lastTime > 0;
        this.updateRobbingIcon();
    },
    updateRobbingIcon: function () {
        if (this.Node_robbing.active) {
            let laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_ROBBINGSPARBLESS, 'mm:ss');
            this.Label_robbingTime.setText(laststr);
            if (laststr == '') {
                this.Node_robbing.active = false;
            }
        }
    },
    onClickRobbing() {
        Game.NetWorkController.SendProto('msg.reqBless', {
            type: Game.Define.BlessType.BlessType_Temple,
            blessid: Game.BlessModel.robbingsparIconData.blessid
        });
    },
    //抢夺水晶祝福处理end

    //护送水晶祝福处理begin
    onUpdateEscortsparIcon() {
        let lastTime = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_ESCORTSPARBLESS);
        this.Node_escortspar.active = lastTime > 0;
        this.updateRobbingIcon();
    },
    updateEscortsparIcon: function () {
        if (this.Node_escortspar.active) {
            let laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_ESCORTSPARBLESS, 'mm:ss');
            this.Label_escortsparTime.setText(laststr);
            if (laststr == '') {
                this.Node_escortspar.active = false;
            }
        }
    },
    onClickEscortspar() {
        Game.NetWorkController.SendProto('msg.reqBless', {
            type: Game.Define.BlessType.BlessType_Guard,
            blessid: Game.BlessModel.escortsparIconData.blessid
        });
    },
    //护送水晶祝福处理end

    //庄园祝福处理begin
    onUpdateDigIcon() {
        let lastTime_3 = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_DIGLESS_3);
        let lastTime_4 = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_DIGLESS_4);
        let lastTime = 0;
        let laststr = "";
        if (lastTime_3 >= lastTime_4) {
            lastTime = lastTime_3;
            laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_DIGLESS_3, 'mm:ss');
        } else {
            lastTime = lastTime_4;
            laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_DIGLESS_4, 'mm:ss');
        };
        this.Node_dig.active = lastTime > 0;
        if (this.Node_dig.active) {
            this.Label_digTime.setText(laststr);
            if (laststr == '') {
                this.Node_dig.active = false;
            }
        }
    },

    onClickDig() {
        let lastTime_3 = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_DIGLESS_3);
        let lastTime_4 = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_DIGLESS_4);
        let dig_type = 0;
        if (lastTime_3 >= lastTime_4) {
            dig_type = Game.Define.BlessType.BlessType_Dig3;
            Game.NetWorkController.SendProto('msg.reqBless', {
                type: dig_type,
                blessid: Game.BlessModel.DigIconData_3.blessid
            });
        } else {
            dig_type = Game.Define.BlessType.BlessType_Dig4;
            Game.NetWorkController.SendProto('msg.reqBless', {
                type: dig_type,
                blessid: Game.BlessModel.DigIconData_4.blessid
            });
        }
    },

    //庄园祝福处理begin

    //集结处理
    onUpdateJijieIcon(){
        var isOpen = Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_ASSEMBLE);
        if(!isOpen){
            this.Node_jijie.active = false;
            return;
        }
        let lastTime = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_JIJIE);
        this.Node_jijie.active = lastTime > 0;
        if (this.Node_jijie.active) {
            let laststr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_JIJIE, 'mm:ss');
            this.Label_jijieTime.setText(laststr);
            if (laststr == '') {
                this.Node_jijie.active = false;
            }
        }
    },

    onUpdateJijieNum(){
        var isOpen = Game.GuideController.IsFunctionOpen(Game.Define.FUNCTION_TYPE.TYPE_ASSEMBLE);
        if(!isOpen){
            this.Node_jijieRight.active = false;
            return;
        }
        if(Game.JijieModel.isMyJijie){
            this.Node_jijieRight.active = false;
            return;
        }
        var jijielist = Game.JijieModel.jijieList;
        var num = Game.JijieModel.isMyJijie ? jijielist.length - 1 : jijielist.length;
        
        this.Label_jijieNumRight.setText(num);
        this.Node_jijieRight.active = num > 0;
    },

    onClickJijie(){
        this.openView(Game.UIName.UI_AGGREGATIONVIEW, Game.JijieModel.firstJijieData);
    },
    onClickJijieRight(){
        this.openView(Game.UIName.UI_JIJIENODE,Game.JijieModel.otherJijie);
        Game.JijieModel.reqJijieList();
    },
    onUpdateJijie(){
        this.onUpdateJijieIcon();
        this.onUpdateJijieNum();
    }
});
