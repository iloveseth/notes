const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        lab_title_txt: { default: null, type: cc.Label_ },
    },

    onLoad: function () {

    },
    
    start() {
        this.initView();
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

    },

    removeNotification() {

    },

    initView(){
        let board_type = Game.GlobalModel.GetBoardType();

        


    },

    //====================  这是分割线  ====================

    onBtn_Close_click(){
        this.closeView(this._url,true);
    },
});
