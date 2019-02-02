const Game = require('../../Game');
const moment = require('moment');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        fuli_ske_tab: { default: [], type: [cc.Node] },
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
        let curTime = Game.TimeController.GetCurTime();
        let weekstr =  moment.unix(curTime).format('d');
        let week = Number(weekstr);
        for (let i = 0; i < this.fuli_ske_tab.length; i++) {
            this.fuli_ske_tab[i].active = false;
        };
        this.fuli_ske_tab[week].active = true;
    },






    //====================  这是分割线  ====================
});
