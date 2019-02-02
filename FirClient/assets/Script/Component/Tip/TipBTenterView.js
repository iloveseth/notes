const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
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

    },

    on_click_getReward(){
        Game.NetWorkController.SendProto('msg.ReqGetFirstLoginPresent', {});
    },




    //====================  这是分割线  ====================
});
