const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        lab_title: { default: null, type: cc.Label_ },
    },

    onLoad() {
        //庄园总界面
        cc.log('DigView onLoad');
        // NetWorkController.AddListener('msg.retAllDigStatus', this, this.onRetAllDigStatus);

        // let temp_1 = 1213;
        // let temp_2 = "asdasd";
        // let tempStr = cc.js.formatStr("进入%s后开放%d庄园功能", temp_2,temp_1);
        // this.lab_title.string = tempStr;

        //发送领取占领区奖励
        var allDigStatus = Game.DigModel.getAllDigStatus();
        let capture = Game._.get(allDigStatus, 'capture', []);
        for(let i = 0; i < capture.length; i++){
            if(capture[i].index == 0)
            {
                let msg = {};
                msg.charid = capture[i].charid;
                msg.mineid = capture[i].mineid;
                Game.NetWorkController.SendProto('msg.GetDigCaptureAward', msg);
            };
        };
    },

    onEnable() {
        cc.log("DigView onEnable");
        Game.GlobalModel.SetIsOpenDigView(false);
        this.initNotification();
        Game.NetWorkController.SendProto('msg.reqAllDigStatus', {});//切换到前台时刷新数据
    },

    onDisable() {
        cc.log("DigView onDisable");
        this.removeNotification();
    },

    initNotification() {

    },

    removeNotification() {

    },

    
    //====================  回调类函数  ====================
    onRetAllDigStatus(){
        cc.log("DigView onRetAllDigStatus");
        
    },

    onBtn_close_Touch(){
        cc.log('DigView onBtn_close_Touch');
        this.closeView(this._url,true);
    },
});
