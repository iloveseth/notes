const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView_sept: { default: null, type: cc.tableView },
    },

    onEnable() {
        this.initNotification();
        this.sendMsg();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.retJoinSept', this, this.updateView);
        Game.NetWorkController.AddListener('msg.retSeptInfo', this, this.onretSeptInfo);
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('msg.retJoinSept', this, this.updateView);
        Game.NetWorkController.RemoveListener('msg.retSeptInfo', this, this.onretSeptInfo);
    },

    sendMsg() {
        Game.NetWorkController.SendProto('msg.reqJoinSept', {});
    },

    updateView(msgid, data) {
        this.septJoinList = Game._.get(data, 'list', []);
        this.tableView_sept.initTableView(this.septJoinList.length, { array: this.septJoinList, target: this });
    },

    onretSeptInfo(msgid, data) {
        this.septJoinList = [];
        this.septJoinList.push(data.info);
        this.tableView_sept.initTableView(this.septJoinList.length, { array: this.septJoinList, target: this });

        Game.ViewController.CloseView(Game.UIName.UI_SEPTSEARCHNODE);
    },

    onClickRefresh() {
        Game.NetWorkController.SendProto('msg.reqJoinSept', {});
    },

    onClickSearch() {
        this.openView(Game.UIName.UI_SEPTSEARCHNODE);
    },

    onClickCreate() {
        this.openView(Game.UIName.UI_SEPTCREATENODE);
    },

    onClickRank() {
        Game.NetWorkController.SendProto('msg.reqSeptSort', {});
    },
});
