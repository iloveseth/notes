const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView_person: { default: null, type: cc.tableView },
        Label_person: { default: null, type: cc.Label_ },
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.SEPT_APPOINT_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SEPT_APPOINT_REFRESH, this, this.updateView);
    },

    updateView() {
        let septMemberList = Game._.sortBy(this._data.list, function (info) {
            return -info.fight;
        });
        this.tableView_person.initTableView(septMemberList.length, { array: septMemberList, target: this });
        this.Label_person.setText(`公会成员${septMemberList.length}/50`);
    },

    onClickSave() {
        let fuzuzhanglist = [];
        Game._.forEach(Game.SeptModel.selectSeptsecmaster, function(o){
            fuzuzhanglist.push(o.userid);
        });
        Game.NetWorkController.SendProto('msg.setSeptFuzuzhang', {
            fuzuzhang: fuzuzhanglist
        });
        this.onClose();
    },
});
