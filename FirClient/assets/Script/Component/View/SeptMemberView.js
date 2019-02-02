const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Button_invitation: { default: null, type: cc.Button_ },
        Button_quit: { default: null, type: cc.Button_ },
        Button_dis: { default: null, type: cc.Button_ },
        tableView_person: { default: null, type: cc.tableView },
        Label_person: { default: null, type: cc.Label_ },
    },

    onEnable() {
        Game.SeptModel.isOpenSeptMember = false;
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.SEPT_MEMBER_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SEPT_MEMBER_REFRESH, this, this.updateView);
    },

    updateView() {
        this.septMemberList = Game.SeptModel.septMemberData.list;
        this.septMemberList = Game._.sortBy(this.septMemberList, function (info) {
            return -info.fight;
        });
        this.tableView_person.initTableView(this.septMemberList.length, { array: this.septMemberList, target: this });

        this.Label_person.setText(`公会成员${this.septMemberList.length}/50`);

        this.Button_invitation.node.active = Game.UserModel.GetSeptId() == Game.SeptModel.septMemberData.septid && Game.UserModel.IsSeptLeader();
        this.Button_quit.node.active = Game.UserModel.GetSeptId() == Game.SeptModel.septMemberData.septid && Game.UserModel.GetSeptpostion() != Game.Define.SEPTPOSITION.SEPTMASTER;
        this.Button_dis.node.active = Game.UserModel.GetSeptId() == Game.SeptModel.septMemberData.septid && Game.UserModel.GetSeptpostion() == Game.Define.SEPTPOSITION.SEPTMASTER && this.septMemberList.length == 1;
    },

    onClickInvitation() {
        this.openView(Game.UIName.UI_SEPTINVITATIONNODE);
    },

    onClickQuit() {
        Game.NetWorkController.SendProto('msg.leaveSept', {
            userid: Game.UserModel.GetCharid()
        });
    },

    onClickDis() {
        Game.NetWorkController.SendProto('msg.leaveSept', {
            userid: Game.UserModel.GetCharid()
        });
    }
});
