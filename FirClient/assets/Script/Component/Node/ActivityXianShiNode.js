const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        lab_count_down: { default: null, type: cc.Label_ },
        tableView_detail: { default: null, type: cc.tableView },
        node_bg: cc.Node,
    },

    onLoad: function () {
        //剩余时间
        let timeStr = Game.CountDown.FormatCountDown(Game.CountDown.Define.TYPE_ACTIVITY_XIANSHI, 'DD天hh时mm分');
        this.lab_count_down.string = timeStr;
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
        Game.NotificationController.On(Game.Define.EVENT_KEY.ACTIVITY_HOME_VIEW_REFRESH, this, this.refreshView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ACTIVITY_HOME_VIEW_REFRESH, this, this.refreshView);
    },

    initView(){
        let limitActData = Game.ActiveModel.limitActData;
        this.tableView_detail.initTableView(limitActData.length, { array: limitActData, target: this });
    },

    

    //====================  这是分割线  ====================
    refreshView(){
        this.initView();
    },

    onItemIconClick: function (goodsinfo, pos) {
        let contents = Game.ItemModel.GenerateCommonContentByObject(goodsinfo);
        Game.TipPoolController.ShowItemInfo(contents, pos, this.node_bg);
    },
});
