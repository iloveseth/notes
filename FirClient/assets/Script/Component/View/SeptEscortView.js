const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_isjoin: { default: null, type: cc.Label_ },
        Label_time: { default: null, type: cc.Label_ },
        Label_name: { default: null, type: cc.Label_ },
        Label_joinnum: { default: null, type: cc.Label_ },

        Sprite_lastMap: { default: null, type: cc.Sprite },
        Sprite_nextMap: { default: null, type: cc.Sprite },
        Sprite_blood: { default: null, type: cc.Sprite_ },

        tableView_person: { default: null, type: cc.tableView },

        Button_join: { default: null, type: cc.Button_ },
        Button_callin: { default: null, type: cc.Button_ },
        sp_car: { default: null, type: sp.Skeleton },
    },

    onLoad() {
        this.bolodWidth = this.Sprite_blood.node.width;
    },

    onEnable() {
        this.initData();
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
        this.Sprite_lastMap.node.stopAllActions();
        this.Sprite_nextMap.node.stopAllActions();
    },

    update(dt) {
        this.dfTime += dt;
        if (this.dfTime >= 1) {
            this.dfTime = 0;
            if (this._data.state == Game.Define.SEPTGUARD_STATE.SEPTGUARD_START) {
                this.Label_time.setText(Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_SEPTESCORT, 'mm:ss'));
            }
        }

        //背景动画
        if (this._data.state == Game.Define.SEPTGUARD_STATE.SEPTGUARD_START) {
            if (this.Sprite_lastMap.node.x <= -this.Sprite_lastMap.node.width) {
                this.Sprite_lastMap.node.x = this.Sprite_nextMap.node.x + this.Sprite_nextMap.node.width;
            } else if (this.Sprite_nextMap.node.x <= -this.Sprite_nextMap.node.width) {
                this.Sprite_nextMap.node.x = this.Sprite_lastMap.node.x + this.Sprite_lastMap.node.width;
            }
            this.Sprite_lastMap.node.x -= 1;
            this.Sprite_nextMap.node.x -= 1;
        }
    },

    initData() {
        this.dfTime = 0;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.SEPT_ESCORT_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SEPT_ESCORT_REFRESH, this, this.updateView);
    },

    updateView() {
        this._data = Game.SeptModel.septGuardData;
        if (this._data.state == Game.Define.SEPTGUARD_STATE.SEPTGUARD_JIJIE) {
            this.playIdle()
            this.Label_time.setText('本次护送开始时间：' + this._data.signendtime[this._data.currentcount-1] + '时');
        } else if (this._data.state == Game.Define.SEPTGUARD_STATE.SEPTGUARD_START) {
            this.playWalk();
            this.Label_time.setText(Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_SEPTESCORT, 'mm:ss'));
        } else {
            this.playIdle();
            this.Label_time.setText('');
        }

        this.Label_name.setText('[' + Game.UserModel.GetCountryShortName(Game.UserModel.GetCountry()) + ']' + Game.SeptModel.septMainData.info.info.name);
        if (this._data.robcount == 1) {
            this.Sprite_blood.node.width = 37;
        } else if (this._data.robcount == 2) {
            this.Sprite_blood.node.width = 71;
        } else {
            this.Sprite_blood.node.width = this.bolodWidth;
        }

        if (this._data.state == Game.Define.SEPTGUARD_STATE.SEPTGUARD_JIJIE || this._data.state == Game.Define.SEPTGUARD_STATE.SEPTGUARD_START) {
            if (Game._.find(this._data.list, {'charid': Game.UserModel.GetCharid()})) {
                this.Label_isjoin.setText('募集中 (已加入)');
            } else {
                this.Label_isjoin.setText('募集中 (未加入)');
            }
        } else {
            if (this._data.left > 0) {
                this.Label_isjoin.setText('今日剩余次数: ' + this._data.left);
            } else {
                this.Label_isjoin.setText('今日次数已经用完' );
            }
        }

        this.Label_joinnum.setText(this._data.list.length + '/' + Game.SeptModel.septMemberData.list.length);

        this.tableView_person.initTableView(this._data.list.length, { array: this._data.list, target: this });

        this.Button_join.node.active = this._data.state == Game.Define.SEPTGUARD_STATE.SEPTGUARD_JIJIE;
        this.Button_callin.node.active = this._data.state == Game.Define.SEPTGUARD_STATE.SEPTGUARD_JIJIE && Game.UserModel.IsSeptLeader();
    },

    playIdle() {
        Game.ResController.LoadSpine('Animation/Npc/yunbiao/yunbiao06/yunbiao06', function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.sp_car.skeletonData = asset;
                this.sp_car.setAnimation(0, 'idle', true);
            }
        }.bind(this));

        this.Sprite_lastMap.node.stopAllActions();
        this.Sprite_lastMap.node.x = 0;
        this.Sprite_nextMap.node.stopAllActions();
        this.Sprite_nextMap.node.x = this.Sprite_lastMap.node.width;
    },

    playWalk() {
        Game.ResController.LoadSpine('Animation/Npc/yunbiao/yunbiao06/yunbiao06', function (err, asset) {
            if (err) {
                console.error('[严重错误] 加载spine资源错误 ' + err);
            } else {
                this.sp_car.skeletonData = asset;
                this.sp_car.setAnimation(0, 'walk', true);
            }
        }.bind(this));
    },

    onClickJoin() {
        Game.NetWorkController.SendProto('septpk.reqSignSeptGuard', {});
    },

    onClickCallin() {
        Game.NetWorkController.SendProto('notice.StartNotifySept', {
            type: 0
        });
    }
});
