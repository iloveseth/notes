const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        TableView_latelyLogin: { default: null, type: cc.tableView },
        TableView_serverList: { default: null, type: cc.tableView },
    },

    updateView(data, latelyData) {
        this.TableView_latelyLogin.initTableView(latelyData.length, { array: latelyData, target: this });
        this.TableView_serverList.initTableView(data.length, { array: data, target: this });
    },

    onClose() {
        this.node.active = false;
    }
});
