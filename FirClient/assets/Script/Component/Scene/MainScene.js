const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        targetCanvas: { default: null, type: cc.Canvas },
        MainPageLayer: { default: null, type: cc.Node },
        GuideView: { default: null, type: require('../View/GuideView') },
        DialogueView: { default: null, type: require('../View/DialogueView') },
        TargetGuideView: { default: null, type: require('../View/TargetGuideView') },
        widget_fix: { default: null, type: cc.Widget },
        node_relogin: { default: null, type: cc.Node }
    },

    onLoad() {
        Game.Tools.AutoFit(this.targetCanvas);
        let viewSize = cc.view.getFrameSize()
        if ((viewSize.height / viewSize.width) >= 2) {
            //要有刘海了吧 
            // 下面往上顶
            this.widget_fix.bottom = 34;
            this.widget_fix.updateAlignment();
        } else {
            // 高度变一下 往上顶
            this.widget_fix.top = -44;
            this.widget_fix.updateAlignment();
        }
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_START, this, this.onGuideStart);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_END, this, this.onGuideEnd);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_UPDATE, this, this.checkGuide);
        Game.NotificationController.On(Game.Define.EVENT_KEY.DIALOGUE_START, this, this.onDialogueStart);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TARGET_GUIDE_START, this, this.onTargetGuideStart);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TARGET_GUIDE_END, this, this.onTargetGuideEnd);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TARGET_GUIDE_UPDATE, this, this.checkTargetGuide);
    },

    _updateNotice(){
        // this.
    },
    start: function () {
        this.GuideView.node.active = false;
        this.DialogueView.node.active = false;
        this.TargetGuideView.node.active = false;
        this.checkGuide();
        if (Game.GlobalModel.IsFirstGame()) {
            Game.GuideController.ShowEnterDialogue();

            Game.Platform.StaticRegister();
        }

        Game.Platform.StaticLogin();
        if (Game.GlobalModel.offlineReport != null) {
            Game.ViewController.OpenView(Game.UIName.UI_OFFLINEREPORTNODE, 'MaskLayer', Game.GlobalModel.offlineReport);
            Game.GlobalModel.offlineReport = null;
        }
        //首次登陆赠送奖励弹框
        if(Game.ActiveModel.firstLoginRewardId != 0){
            this.openView(Game.UIName.UI_TIP_BT_FIRSTLOGIN_VIEW);
        }
    },
    update: function () {
        this.node_relogin.active = Game.LoginController.relogining;
    },
    onDestroy: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUIDE_START, this, this.onGuideStart);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUIDE_END, this, this.onGuideEnd);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUIDE_UPDATE, this, this.checkGuide);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.DIALOGUE_START, this, this.onDialogueStart);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TARGET_GUIDE_START, this, this.onTargetGuideStart);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TARGET_GUIDE_END, this, this.onTargetGuideEnd);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TARGET_GUIDE_UPDATE, this, this.checkTargetGuide);

    },

    onGuideStart: function (opts) {
        this.GuideView.node.active = true;
        this.GuideView.SetInfo(opts);
    },
    onGuideEnd: function () {
        this.GuideView.node.active = false;
        let id = Game.GuideController.GetTrackGuide();
        if (id != 0) {
            Game.GuideController.StartGuideWithId(id);
        }
    },
    onDialogueStart: function (opts) {
        this.DialogueView.node.active = true;
        this.DialogueView.SetInfo(opts);
    },
    checkGuide: function () {
        let id = Game.GuideController.GetTrackGuide();
        if (id != 0) {
            Game.GuideController.StartGuideWithId(id);
        }
    },

    onTargetGuideStart: function (opts) {
        this.TargetGuideView.node.active = true;
        this.TargetGuideView.SetInfo(opts);
    },
    onTargetGuideEnd: function () {
        cc.log("MainScene onTargetGuideEnd");
        this.TargetGuideView.node.active = false;
        Game.TargetGuideController.CleanGuideData();
    },
    checkTargetGuide: function () {
        let id = Game.TargetGuideController.GetTrackGuide();
        if (id != 0) {
            Game.TargetGuideController.StartGuideWithId(id);
        }
    },





});
