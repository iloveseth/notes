const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        table_view_reward: { default: null, type: cc.tableView },
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

    },

    removeNotification() {

    },

    initView(){
        let pvp_reward_tab = Game.ConfigController.GetConfig("pvpaward_data");
        this.table_view_reward.initTableView(pvp_reward_tab.length, { array: pvp_reward_tab, target: this });

    },


    //====================  这是分割线  ====================
});
