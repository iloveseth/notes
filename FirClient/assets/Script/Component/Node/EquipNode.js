const Game = require('../../Game');

var EquipType = cc.Enum({
    wuqi       : 101,//刀
    fushou     : 102,//刀副手
    huwan      : 109,//护腕
    kuzi       : 110,//裤子
    xiezi      : 111,//鞋子
    toukui     : 112,//头盔 
    xianglian  : 113,//项链
    yifu       : 114,//衣服
    yaodai     : 115,//腰带
    jiezhi     : 116,//戒指
});

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Button_equip: { default: null, type: cc.Button_ },
        Label_equip: { default: null, type: cc.Label },
        Node_singleItem: { default: null, type: cc.Node },
        Sprite_red: { default: null, type: cc.Sprite_ },
        equipType: { default: EquipType.wuqi, type: EquipType },
        Animation_change: { default: null, type: cc.Animation },
    },

    onLoad() {

        this.initView();
    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.ITEM_REFRESH, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ITEM_REFRESH, this, this.updateView);
    },

    initView() {
        if(this.Label_equip){
            this.Label_equip.setText(Game.EquipModel.GetPosNameByType(this.equipType));
        }
        // this.Label_equip.setText(Game.EquipModel.GetPosNameByType(this.equipType));
        this._singleItemComponent = this.Node_singleItem.getComponent('SingleItemNode');

        if(this.Animation_change){
            this.Animation_change.node.active = false;
            this.Animation_change.on('finished', this.onShowChangeEnd, this);
        }
    },

    updateEquipInfo(info) {
        this.lastItemthisid = 0;
        
        this.curBaseInfo = info;
        if (this.equipType == 101) {
            this.equipType = Game.EquipModel.GetMainArmsByOccupation(this.curBaseInfo.occupation);
        }

        if (this.equipType == 102) {
            this.equipType = Game.EquipModel.GetViceArmsByOccupation(this.curBaseInfo.occupation);
        }

        this.itemInfo = Game.EquipModel.GetUseEquipByTypes(this.curBaseInfo.packagetype, this.equipType);
        this.updateView(this.itemInfo);
    },

    getQuality(){
        if(this.itemInfo && this.itemInfo.equipdata){
            return this.itemInfo.equipdata.color;
        }
        else{
            return 0;
        }
    },

    updateView(info) {
        if (this.itemInfo != null) {        //只更新当前在使用的装备
            if (this.itemInfo.thisid != info.thisid) {
                return;
            }
        }

        if(this.pageState > 1){return;}

        if(!this.curBaseInfo){
            return;
        }
        this.itemInfo = Game.EquipModel.GetUseEquipByTypes(this.curBaseInfo.packagetype, this.equipType);
        if (this.itemInfo) {
            if(this.from != 'advance'){
                this.Button_equip.interactable = false;
            }
            if(!this._singleItemComponent){
                this._singleItemComponent = this.Node_singleItem.getComponent('SingleItemNode');
            }
            this._singleItemComponent.updateView(this.itemInfo);
            this.Node_singleItem.active = true;
        } else {
            if(this.from != 'advance'){
                this.Button_equip.interactable = true;
            }
            this.Node_singleItem.active = false;
        }

        if(this.Sprite_red){
            this.Sprite_red.node.active = Game.EquipModel.FindEquipNewFlagByType(this.equipType);
        }
        if(this.Label_equip){
            this.Label_equip.node.active = this.itemInfo == null;
        }

        if (this.itemInfo != null && this.lastItemthisid != 0) {
            if(this.Animation_change){
                this.Animation_change.node.active = true;
                this.Animation_change.play();
            }
        }
        if (this.itemInfo != null) {
            this.lastItemthisid = this.itemInfo.thisid;
        } else {
            this.lastItemthisid = -1;
        }
        if(this.from == 'advance'){
            this.showSimpleInfo();
            this.Sprite_red.node.active = false;
        }
    },

    onOpenSelectEquip() {
        let isMeEquip = Game.GlobalModel.GetIsLookMyEquip();
        if(!isMeEquip){
            return;
        }

        if (Game.EquipModel.curEquipPage == Game.Define.EquipPageType.equip) {
            let info = {
                equipType: this.equipType, 
                selectType: Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_CHANGE
            }
            this.openView(Game.UIName.UI_EQUIPSELECT, info);
        } else if (Game.EquipModel.curEquipPage == Game.Define.EquipPageType.strong 
                || Game.EquipModel.curEquipPage == Game.Define.EquipPageType.star
                || Game.EquipModel.curEquipPage == Game.Define.EquipPageType.gem
                || Game.EquipModel.curEquipPage == Game.Define.EquipPageType.soul){
            this.showTips('请选择已经穿戴的装备..');
        }
    },

    updateEquipInfoOb(info){
        if(!info){
            this.Label_equip.node.active = true;
            return;
        }
        this.Label_equip.node.active = false;
        this.Node_singleItem.active = true;
        this._singleItemComponent.updateView(info);
    },

    onShowChangeEnd(event) {
        if(this.Animation_change){
            this.Animation_change.node.active = false;
        }
    },

    mask(isMask){
        var colorStr = '#ffffff';
        if(isMask){
            this.node.color = cc.color(colorStr);
        }
        else{
            this.node.color = cc.color('#ffffff');
        }

        if(isMask){
            this._singleItemComponent.Sprite_item.node.color = cc.color(colorStr);
            this._singleItemComponent.Sprite_quality.node.color = cc.color(colorStr);
            this._singleItemComponent.Node_Item.active = false;
            this._singleItemComponent.Node_Equip.active = false;
            this._singleItemComponent.Node_star.active = false;
        }
        else{
            this._singleItemComponent.Sprite_item.node.color = cc.color('#ffffff');
            this._singleItemComponent.Sprite_quality.node.color = cc.color('#ffffff');
        }
    },

    showSimpleInfo(){
        this._singleItemComponent.Node_Equip.active = false;
        this._singleItemComponent.Node_star.active = false;
        this._singleItemComponent.Node_Item.active = false;
    },

    playAnim(){
        this.Animation_change.node.active = true;
        this.Animation_change.play();
    },
});
