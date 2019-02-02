const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView_rank: { default: null, type: cc.tableView },
    },

    onEnable() {
        this.updateView();
    },

    updateView() {
        this.tableView_rank.initTableView(this._data.list.length, { array: this._data.list, target: this });
    },
});
