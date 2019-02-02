// MailView.js
const Game = require('../../Game');

const MailState = {
    AWARD_MAIL_TABLE: 1,
    FIGHT_MAIL_TABLE: 2,
    SYSTEM_MAIL_TABLE: 3,
}

cc.Class({

    extends: cc.GameComponent,

    properties: {
        tableView_detail: { default: null, type: cc.tableView },
        btn_xitong_press: { default: null, type: cc.Sprite_ },
        btn_zhandou_press: { default: null, type: cc.Sprite_ },
        btn_jiangli_press: { default: null, type: cc.Sprite_ },
        Sprite_xitong_dot: { default: null, type: cc.Sprite_ },
        Sprite_zhandou_dot: { default: null, type: cc.Sprite_ },
        Sprite_jiangli_dot: { default: null, type: cc.Sprite_ },
        Sprite_onClick_dot: {default: null, type: cc.Sprite_ },
    },

    onLoad() {

    },

    onEnable() {
        this.initNotification();
        this._selectTable = 0;
        this.mailList = [];
        this.setInfoRefresh();
        // this.onTouchAward();
        this.initTouchTable();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MAIL_DETAIL_REFRESH, this, this.onUserInfoRefresh);

    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MAIL_DETAIL_REFRESH, this, this.onUserInfoRefresh);
    },

    onUserInfoRefresh() {
        this.selectTabView(this._selectTable);
        this.setInfoRefresh();
    },

    setInfoRefresh() {
        this.Sprite_xitong_dot.node.active = Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_SYSTEM);
        this.Sprite_zhandou_dot.node.active = Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_FIGHT);
        this.Sprite_jiangli_dot.node.active = Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD);
    },
    initTouchTable(){
        if(Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD)){
            this.onTouchAward();
        }else if(Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_FIGHT)){
            this.onTouchFight();
        }else if(Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_SYSTEM)){
            this.onTouchSystem();
        }else{
            this.onTouchAward();
        }
    },
    getTableMailListByType(type) {
        return Game.MailModel.GetMailsByType(type);
    },
    selectTabView(selectTab) {
        this._selectTable = selectTab;
        this.btn_xitong_press.node.active = false;
        this.btn_zhandou_press.node.active = false;
        this.btn_jiangli_press.node.active = false;
        switch (selectTab) {
            case MailState.FIGHT_MAIL_TABLE:
                this.btn_zhandou_press.node.active = true;
                this.Sprite_onClick_dot.node.active = Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_FIGHT);
                var fightMailList = [];
                fightMailList = Game.MailModel.GetMailsByType(Game.Define.MAIL_TYPE.MAIL_TYPE_FIGHT);
                this.tableView_detail.initTableView(fightMailList.length, { array: fightMailList, target: this });
                
                break;
            case MailState.AWARD_MAIL_TABLE:
                this.btn_jiangli_press.node.active = true;
                this.Sprite_onClick_dot.node.active = Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD);
                var awardMailList = [];
                awardMailList = Game.MailModel.GetMailsByType(Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD);
                this.tableView_detail.initTableView(awardMailList.length, { array: awardMailList, target: this });
                
                break;
            case MailState.SYSTEM_MAIL_TABLE:
                this.btn_xitong_press.node.active = true;
                this.Sprite_onClick_dot.node.active = Game.MailModel.GetMailsRedDotByType(Game.Define.MAIL_TYPE.MAIL_TYPE_SYSTEM);
                var systemMailList = [];
                systemMailList = Game.MailModel.GetMailsByType(Game.Define.MAIL_TYPE.MAIL_TYPE_SYSTEM);
                this.tableView_detail.initTableView(systemMailList.length, { array: systemMailList, target: this });
                break;
            default:
                break;
        }
    },
    onTouchFight() {
        if (this._selectTable != MailState.FIGHT_MAIL_TABLE) {
            var msg = {};
            msg.mailtype = Game.Define.MAIL_TYPE.MAIL_TYPE_FIGHT;
            Game.NetWorkController.SendProto('msg.reqMailRead',msg);
            // this.selectTabView(MailState.FIGHT_MAIL_TABLE);
            this._selectTable = MailState.FIGHT_MAIL_TABLE;
        }
    },
    onTouchAward() {
        if (this._selectTable != MailState.AWARD_MAIL_TABLE) {
            var msg = {};
            msg.mailtype = Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD;
            Game.NetWorkController.SendProto('msg.reqMailRead',msg);
            // this.selectTabView(MailState.AWARD_MAIL_TABLE);
            this._selectTable = MailState.AWARD_MAIL_TABLE;
        }
    },
    onTouchSystem() {
        if (this._selectTable != MailState.SYSTEM_MAIL_TABLE) {
            var msg = {};
            msg.mailtype = Game.Define.MAIL_TYPE.MAIL_TYPE_SYSTEM;
            Game.NetWorkController.SendProto('msg.reqMailRead',msg);
            // this.selectTabView(MailState.SYSTEM_MAIL_TABLE);
            this._selectTable = MailState.SYSTEM_MAIL_TABLE;
        }
    },
    onTouchCollection() {
        var mailid = [];
        switch (this._selectTable) {
            case MailState.FIGHT_MAIL_TABLE:
                mailid = Game.MailModel.GetCanRecieveMailIdsByType(Game.Define.MAIL_TYPE.MAIL_TYPE_FIGHT);
                break;
            case MailState.AWARD_MAIL_TABLE:
                mailid = Game.MailModel.GetCanRecieveMailIdsByType(Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD);
                break;
            case MailState.SYSTEM_MAIL_TABLE:
                mailid = Game.MailModel.GetCanRecieveMailIdsByType(Game.Define.MAIL_TYPE.MAIL_TYPE_SYSTEM);
                break;
            default:
                break;
        }
        if (mailid.length == 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_WARNPOP, '没有奖励可以领取');
        } else {
            Game.NetWorkController.SendProto('msg.GetAttachment', { mailid: mailid });
        }
    },
    onTouchRemoveAll() {
        var mailid = [];
        var type = Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD;
        switch (this._selectTable) {
            case MailState.FIGHT_MAIL_TABLE:
                type = Game.Define.MAIL_TYPE.MAIL_TYPE_FIGHT;
                break;
            case MailState.AWARD_MAIL_TABLE:
                type = Game.Define.MAIL_TYPE.MAIL_TYPE_AWARD;
                break;
            case MailState.SYSTEM_MAIL_TABLE:
                type = Game.Define.MAIL_TYPE.MAIL_TYPE_SYSTEM;
                break;
        }
        mailid = Game.MailModel.GetMailsIdByType(type);
        Game.NetWorkController.SendProto('msg.DelMail', { mailid: mailid });
    },
});