const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Editbox_gmCmd: { default: null, type: cc.EditBox },
        TableView_gmLine: { default: null, type: cc.tableView },
    },

    onEnable() {
        this.Editbox_gmCmd.string = '';

        this.gmList = Game.ConfigController.GetConfig('gm_data');
        this.TableView_gmLine.initTableView(this.gmList.length, { array: this.gmList, target: this });
    },

    onClickSend() {
        Game.NetWorkController.SendProto('msg.SendGmCmd', {
            cmd: this.Editbox_gmCmd.string
        });
    }
});
