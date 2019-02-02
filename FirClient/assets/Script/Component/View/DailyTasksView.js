const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_luckNum: { default: null, type: cc.Label_ },
        Label_escortNum: { default: null, type: cc.Label_ },
        Label_captureNum: { default: null, type: cc.Label_ },

        Skeleton_luckplayer: { default: null, type: sp.Skeleton },
        Skeleton_escortPlayer: { default: null, type: sp.Skeleton },
        Skeleton_capturePlayer: { default: null, type: sp.Skeleton },

        RichText_luckTip: { default: null, type: cc.RichText_ },
        RichText_escortTip: { default: null, type: cc.RichText_ },
        RichText_captureTip: { default: null, type: cc.RichText_ },
        Label_kingTips: { default: [], type: [cc.Label_] },

        Sprite_luckRed: { default: null, type: cc.Sprite_ },
        Sprite_escortRed: { default: null, type: cc.Sprite_ },
        Sprite_captureRed: { default: null, type: cc.Sprite_ },

        Sprite_di1:{default: null, type: cc.Node},
        Sprite_di2:{default: null, type: cc.Node},
        Sprite_di3:{default: null, type: cc.Node},
    },

    onLoad() {
        this.initSkeleton();
    },

    onEnable() {
        Game.TaskModel.isOpenDailyTask = false;
        
        this.initData();
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    update(dt) {
        this.dfTime += dt;
        if(this.dfTime >= 1) {
            this.dfTime = 0;
        }
    },

    initData() {
        this.dfTime = 0;

        for (let i = 0; i < this.Label_kingTips.length; i ++) {
            let label = this.Label_kingTips[i];
            label.setText('国家任务: ');
        }

        this._y1 = this.Label_kingTips[0].node.getPositionY();
        this._y2 = this.Label_kingTips[1].node.getPositionY();
        this._y3 = this.Label_kingTips[2].node.getPositionY();
        this._h1 = this.Sprite_di1.height;
        this._h2 = this.Sprite_di2.height;
        this._h3 = this.Sprite_di3.height;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.TASK_INFO_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.TASK_INFO_REFRESH, this, this.updateView);
    },

    initSkeleton() {
        Game.ResController.LoadSpine('Animation/Npc/Xingyunxing/Xingyunxing', function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.Skeleton_luckplayer.skeletonData = asset;
                this.Skeleton_luckplayer.setAnimation(0, 'animation', true);
            }
        }.bind(this));

        Game.ResController.LoadSpine('Animation/Npc/Husongshuijing/Husongshuijing', function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.Skeleton_escortPlayer.skeletonData = asset;
                this.Skeleton_escortPlayer.setAnimation(0, 'idle', true);
            }
        }.bind(this));

        Game.ResController.LoadSpine('Animation/Npc/Lueduoshuijing/Lueduoshuijing', function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.Skeleton_capturePlayer.skeletonData = asset;
                this.Skeleton_capturePlayer.setAnimation(0, 'idle', true);
            }
        }.bind(this));
    },

    updateView() {
        this.taskInfos = Game.TaskModel.GetTaskInfos();

        let countdown = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_KINGTASK);
        Game._.forEach(this.taskInfos, function(info) {
            if (info.id == Game.Define.TASK_TYPE.TASK_LUCK) {     //幸运星
                this.Label_luckNum.setText(info.daycur);
                let des = Game.ConfigController.GetConfigById('tastdesc_data', 3).taskdesc;
                this.RichText_luckTip.string = des;
                this.setBoradContentInfo(des, this.Sprite_di1, this.Label_kingTips[0], this._h1, this._y1, this.RichText_luckTip);

                this.Sprite_luckRed.node.active = (info.daymax-info.daycur) > 0 && countdown > 0;
            } else if (info.id == Game.Define.TASK_TYPE.TASK_ESCORT) {     //护送晶石
                this.Label_escortNum.setText(`${info.daycur}/${info.daymax}`);
                let des = Game.ConfigController.GetConfigById('tastdesc_data', 2).taskdesc;
                this.RichText_escortTip.string = des;
                this.Sprite_escortRed.node.active = (info.daymax-info.daycur) > 0 && countdown > 0;

                this.setBoradContentInfo(des, this.Sprite_di2, this.Label_kingTips[1], this._h2, this._y2, this.RichText_escortTip);
            } else if (info.id == Game.Define.TASK_TYPE.TASK_CAPTURE) {     //夺取晶石
                this.Label_captureNum.setText(`${info.daycur}/${info.daymax}`);
                let des = Game.ConfigController.GetConfigById('tastdesc_data', 1).taskdesc;
                this.RichText_captureTip.string = des;
                this.Sprite_captureRed.node.active = (info.daymax-info.daycur) > 0 && countdown > 0;
                this.setBoradContentInfo(des, this.Sprite_di3, this.Label_kingTips[2], this._h3, this._y3, this.RichText_captureTip);
            }
        }.bind(this));

        this.kingtaskRefresh();
    },
    
    kingtaskRefresh() {
        let countdown = Game.CountDown.GetCountDown(Game.CountDown.Define.TYPE_KINGTASK);
        for (let i = 0; i < this.Label_kingTips.length; i ++) {
            let label = this.Label_kingTips[i];
            if (countdown > 0) {
                label.setText('国家任务：已开启(经验+'+Game.TaskModel.kingtaskAdd+'%)');
            } else {
                label.setText('国家任务：未开启');
            }
        }
    },

    onClickLuck() {
        Game.NetWorkController.SendProto('msg.reqRedEnvelopeTask', {});
    },

    onClickEscort() {
        Game.NetWorkController.SendProto('border.gotoQuest', {type: Game.Define.CstoreItemType.CStoreType_YUNBIAO});
    },

    onClickCapture() {
        Game.NetWorkController.SendProto('border.gotoQuest', {type: Game.Define.CstoreItemType.CStoreType_BANZHUAN});
    },


    setBoradContentInfo(txt, sp, lab, height, y, richText){
        let strlen = txt.length;
        let maxWidth = richText.maxWidth;
        let fontSize = richText.fontSize;
        let str_w = this.truncateUTF8String(txt, strlen, fontSize);
        let line = 1;
        if(str_w > maxWidth*2){
            line = 3
        }else if(str_w > maxWidth){
            line = 2;
        }
        let w = sp.width;
        let h = height + 40 * (line - 2);
        sp.setContentSize(w, h);
        lab.node.setPositionY(y + 40 * (2 - line));
    },
    truncateUTF8String(s, n, f) {
        let width = 0;
        while(n > 0){
            n = n-1;
            let dropping = s.charCodeAt(n);
            if(!dropping){ break;}
            if (dropping >= 128) {
                width = width + f;
            }
        }
        return width;
    },
});
