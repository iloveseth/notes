const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Node_selSingleItem: { default: null, type: cc.Node },
        Node_targetSingleItem: { default: null, type: cc.Node },
        Label_select: { default: null, type: cc.Label_ },
    },

    onLoad() {
        this.initView();
    },

    onEnable() {
        this.initData();
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GET_SEL_ITEM, this, this.setStarItem);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GET_SEL_ITEM, this, this.setStarItem);
    },

    initData() {
        this.setObject = null;
        this.targetObject = this._data;
    },

    initView() {
        this._selSingleItemComponent = this.Node_selSingleItem.getComponent('SingleItemNode');
        this._targetSingleItemComponent = this.Node_targetSingleItem.getComponent('SingleItemNode');
    },

    updateView() {
        this.Node_selSingleItem.active = false;
        this.Label_select.node.active = true;   
        this._targetSingleItemComponent.updateView(this.targetObject, function(){});
    },

    setStarItem(t_object) {
        if (t_object.baseid >= 250 && t_object.baseid <= 279) {
            this.setObject = t_object;
            this._selSingleItemComponent.updateView(this.setObject, function(){});
            this.Node_selSingleItem.active = true;
            this.Label_select.node.active = false;
        }
    },

    onClickOpenInlaySel() {
        this.openView(Game.UIName.UI_EQUIPINLAYSELNODE, Game.ItemDefine.ITEMTYPE.ItemType_StarStone);
    },

    onClickInlay() {
        if (this.setObject) {
            Game.NetWorkController.SendProto('msg.reqPutOnStarStone', {
                equipthisid: this.targetObject.thisid,
                stonethisid: this.setObject.thisid
            });
            this.onClose();
        } else {
            this.showTips('请选择升星石!');
        }
    }
});