const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_septname: { default: null, type: cc.Label_ },
        Label_member: { default: null, type: cc.Label_ },
        Label_master: { default: null, type: cc.Label_ },
        Label_vicemaster1: { default: null, type: cc.Label_ },
        Label_vicemaster2: { default: null, type: cc.Label_ },
        Label_notice: { default: null, type: cc.Label_ },
        Label_fight: { default: null, type: cc.Label_ },
        tableView_event: { default: null, type: cc.tableView },

        Sprite_appoint: { default: null, type: cc.Sprite_ },
        Sprite_editmsg: { default: null, type: cc.Sprite_ },
        Sprite_setting: { default: null, type: cc.Sprite_ },
    },

    onEnable() {
        this.initNotification();
        this.sendMsg();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.retSeptCommonInfo', this, this.onretSeptCommonInfo);
        Game.NetWorkController.AddListener('msg.setSeptNotify', this, this.onsetSeptNotify);
        Game.NetWorkController.AddListener('msg.setFightLimit', this, this.onsetFightLimit);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SEPT_MEMBER_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.retSeptCommonInfo', this, this.onretSeptCommonInfo);
        Game.NetWorkController.RemoveListener('msg.setSeptNotify', this, this.onsetSeptNotify);
        Game.NetWorkController.RemoveListener('msg.setFightLimit', this, this.onsetFightLimit);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SEPT_MEMBER_REFRESH, this, this.updateView);
    },

    sendMsg() {
        Game.NetWorkController.SendProto('msg.reqSeptCommonInfo', {});
    },

    updateView() {
        this._data = Game.SeptModel.septMainData.info.info;
        this.Label_septname.setText(this._data.name);
        this.Label_member.setText(`${Game.SeptModel.septMemberData.list.length}/50`);
        this.Label_master.setText(this._data.mastername);

        let vicemasterid = 0;
        let vicemastername1 = '无';
        let vicemastername2 = '无';
        Game._.forEach(Game.SeptModel.septMemberData.list, function(info) {
            if (info.postion == Game.Define.SEPTPOSITION.SEPTSECMASTER) {
                if (vicemasterid == 0) {
                    vicemastername1 = info.name;
                    vicemasterid = info.userid;
                } else {
                    vicemastername2 = info.name;
                }
            }
        });
        this.Label_vicemaster1.setText(vicemastername1);
        this.Label_vicemaster2.setText(vicemastername2);
        this.Label_notice.setText(Game.SeptModel.septMainData.notify);
        let joinNeedFight = Game._.get(Game.SeptModel.septMainData.info, 'entervalue', 0);
        this.Label_fight.setText(joinNeedFight);

        this.Sprite_appoint.SetSprite(Game.UserModel.GetSeptpostion() == Game.Define.SEPTPOSITION.SEPTMASTER ? 'Image/UI/Common/button_blue' : 'Image/UI/Common/tongyong_icon_gray');
        this.Sprite_editmsg.SetSprite(Game.UserModel.IsSeptLeader() ? 'Image/UI/Common/button_blue' : 'Image/UI/Common/tongyong_icon_gray');
        this.Sprite_setting.SetSprite(Game.UserModel.IsSeptLeader() ? 'Image/UI/Common/button_blue' : 'Image/UI/Common/tongyong_icon_gray');
    },

    onretSeptCommonInfo(msgid, data) {
        let eventList = Game._.sortBy(data.list, function (info) {
            return -info.time;
        });
        this.tableView_event.initTableView(eventList.length, { array: eventList, target: this });
    },

    onsetSeptNotify(msgid, data) {
        this.Label_notice.setText(data.notify);
    },

    onsetFightLimit(msgid, data) {
        if (data.fightlimit == 0) {
            Game.NetWorkController.SendProto('msg.setEnterSeptType', {      //进入工会无要求
                type: 3
            });
        } else {
            Game.NetWorkController.SendProto('msg.setEnterSeptType', {      //战力限制
                type: 0
            });
        }
        this.Label_fight.setText(data.fightlimit);
    },

    onClickAppoint() {
        if (Game.UserModel.GetSeptpostion() == Game.Define.SEPTPOSITION.SEPTMASTER) {
            Game.NetWorkController.SendProto('msg.reqSeptAppointList', {
                type: Game.Define.SEPTPOSITION.SEPTSECMASTER
            });
        } else {
            this.showTips('您不是公会官员，无法进行此操作');
        }
    },

    onClickSetting() {
        if (Game.UserModel.IsSeptLeader()) {
            this.openView(Game.UIName.UI_SEPTCONDITIONNODE);
        } else {
            this.showTips('您不是公会官员，无法进行此操作');
        }
    },

    onClickMember() {
        Game.SeptModel.isOpenSeptMember = true;
        Game.NetWorkController.SendProto('msg.reqSeptMemberList', {
            septid: Game.UserModel.GetSeptId()
        });
    },

    onClickEditmsg() {
        if (Game.UserModel.IsSeptLeader()) {
            this.openView(Game.UIName.UI_SEPTSETEVENTNODE);
        } else {
            this.showTips('您不是公会官员，无法进行此操作');
        }
    },
});
