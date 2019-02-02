const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_commoncard: require('./MonthCardNode'),
        node_zhizuncard: require('./MonthCardNode'),
        node_title: cc.Node,
    },

    onEnable() {
        this.initNotification(); 
        this.node_commoncard.onInit(Game.ActiveModel.monthcard_common);
        this.node_zhizuncard.onInit(Game.ActiveModel.monthcard_zhizun);
        if(this._data && this._data.title){
            this.node_title.active = true;
        }
        else{
            this.node_title.active = false;
        }
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PAY_RESULT, this, this.onPayResult);
        Game.NetWorkController.AddListener('msg.RetMonthCard', this, this.onRetMonthCard);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PAY_RESULT, this, this.onPayResult);
        Game.NetWorkController.RemoveListener('msg.RetMonthCard', this, this.onRetMonthCard);
    },

    onDisable() {
        this.removeNotification();
        this.node_commoncard.onEnd();
        this.node_zhizuncard.onEnd();
        this._data = null;
    },

    onPayResult(status){
        this.node_commoncard.onPayResult(status);
        this.node_zhizuncard.onPayResult(status);
    },

    onRetMonthCard(msgid,msg){
        if(msg.card_type == 0){
            this.node_commoncard.onInit(msg);
        }
        if(msg.card_type == 1){
            this.node_zhizuncard.onInit(msg);
        }
    }
});
