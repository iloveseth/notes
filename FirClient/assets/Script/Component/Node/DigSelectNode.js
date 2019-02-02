const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        TableView_RobList: { default: null, type: cc.tableView },
    },

    onLoad() {
        //庄园可占领列表界面
        cc.log('DigSelectNode onLoad');
        this.dataList = [];
        
    },

    start() {
        Game.NetWorkController.SendProto('msg.ReqDigRobList', {});
    },

    update(dt) {
    },

    lateUpdate(dt) {
    },

    onDestroy() {
    },

    onEnable() {
        this.initNotification();  
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.DIG_RET_ROBLIST, this, this.refreshView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.DIG_RET_ROBLIST, this, this.refreshView);
    },

    refreshView(){
        cc.log("DigSelectNode refreshView")
        let robList = Game.DigModel.getDigRobList();
        this.TableView_RobList.initTableView(robList.length, { array: robList, target: this });
    },

    
    //====================  回调类函数  ====================
    onLayout_bg_Touch(){
        cc.log('DigSelectNode onLayout_bg_Touch');
        this.closeView(this._url,true);
    },

    onBtn_refresh_Touch(){
        cc.log('DigSelectNode onBtn_refresh_Touch');
        Game.NetWorkController.SendProto('msg.RefreshDigRobList', {});
    },

    onBtn_close_Touch(){
        cc.log('DigSelectNode onBtn_close_Touch');
        this.closeView(this._url,true);
    },

});
