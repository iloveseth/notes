const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        // lab_lefttime_title: { default: null, type: cc.Label_ },
        // lab_lefttime: { default: null, type: cc.Label_ },
        tableView_detail: { default: null, type: cc.tableView },
    },

    onLoad: function () {
        
    },
    
    start() {
        
    },

    update(dt) {
        // let countDownStr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_ACTIVITY_LOGIN, 'dd天hh时mm分');
        // this.lab_lefttime.string = countDownStr;
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
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_SEVEN_LOGIN,this,this.onRetZoneLoginAct);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_SEVEN_LOGIN,this,this.onRetZoneLoginAct);
    },

    initView(){
        this.onRetZoneLoginAct();
    },






    //====================  这是分割线  ====================

    onRetZoneLoginAct(){
        let loginActData = Game.ActiveModel.getLoginActData();
        this.tableView_detail.initTableView(loginActData.length, { array: loginActData, target: this });
    },


    onItemClickedCallback(id, pos){
        let config = Game.ItemModel.GetItemConfig(id);
        if(config){
            let contents = [config.info];
            Game.TipPoolController.ShowItemInfo(contents, pos, this.tableView_detail.node);   
        }
    },






});
