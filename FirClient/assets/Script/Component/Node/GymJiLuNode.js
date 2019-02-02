const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView_detail: { default: null, type: cc.tableView },
    },

    onLoad: function () {

    },
    
    start() {
    },

    update(dt) {
    },

    lateUpdate(dt) {
    },

    onDestroy() {
    },

    onEnable() {
        this.initNotification();  
        this.initView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NetWorkController.AddListener('pvp.RetPvpPkRecord', this, this.onRetPvpPkRecord);//返回竞技PK记录
    },

    removeNotification() {
        Game.NetWorkController.RemoveListener('pvp.RetPvpPkRecord', this, this.onRetPvpPkRecord);
    },

    initView(){
        //请求刷新主界面信息
        Game.NetWorkController.SendProto('pvp.ReqPvpPkRecord', {});
    },



    //====================  这是分割线  ====================

    onRetPvpPkRecord(msgid, data){
        let recordData = data.record;
        this.tableView_detail.initTableView(recordData.length, { array: recordData, target: this });
    },



});
