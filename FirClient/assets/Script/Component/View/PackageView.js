// PackageView.js
const Game = require('../../Game');

const PackageState = {
    ITME_TABLE: 1,                       
    EQUIP_TABLE: 2,                     
}

cc.Class({

	extends: cc.GameComponent,

	properties: {
        tableView: { default: null, type: cc.tableViewNew },
        Item_btn_bg_press:{ default: null, type: cc.Sprite_ },
        Item_btn_bg: { default: null, type: cc.Sprite_ },
        Equip_btn_bg_press:{ default: null, type: cc.Sprite_ },
        Equip_btn_bg: { default: null, type: cc.Sprite_ },
        Button_to_smelting:{ default: null, type: cc.Node },
        Button_to_tiejiang:{ default: null, type: cc.Node },
        Sprite_itemRed: { default: null, type: cc.Sprite_ },
        Sprite_equipRed: { default: null, type: cc.Sprite_ },
        Sprite_smeltRed: { default: null, type: cc.Sprite_ },
        Node_itemNum: { default: null, type: cc.Node },
        Label_num: { default: null, type: cc.Label_ },
    },

    onEnable() {
        Game.GlobalModel.SetIsLookMyEquip(true);    //设置查看的是自己的装备
        this.initData();
        this.initNotification();
        this.updateView();
    },
    onDisable() {
        this.removeNotification();
    },
    lateUpdate(dt){
        this.time += dt;
        if(this.time > 0.5 && this.needUpdate){
            this.time = 0;
            this.needUpdate = false;
            this.updateView1();
            // this.refreshView();
        }
    },
    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this.needUpdateView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOP_LUCKDRAWRET, this, this.onRetLuckDraw);
    },
    needUpdateView(){
        this.needUpdate = true;
        this.time = 0;
    },
    removeNotification() {
         Game.NotificationController.Off(Game.Define.EVENT_KEY.OBJECTS_REFRESH, this, this.needUpdateView);
         Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOP_LUCKDRAWRET, this, this.onRetLuckDraw);
    },
    isArrowSmelting(){
        var isArrow = false;
        for (var i = 1; i <= 6; i++) {
            var starEquip = i == 6;
            var num = Game.EquipModel.GetUnusePackageEquipNumByColor(i,starEquip);
            if (num > 0) {
                isArrow = true;
                break;
            }
        }
        return !isArrow;
    },
    initData() {
        this.itemBase = [];
        this._selectTable = PackageState.ITME_TABLE;
        this.time = 0;
        this.needUpdate = false;
    },
    updateView() {
        this.selectTabView(this._selectTable);
        
        //红点判断
        this.Sprite_equipRed.node.active = Game.ItemModel.IsSmeltTipRed();
        this.Sprite_smeltRed.node.active = Game.ItemModel.IsSmeltTipRed();
        this.Sprite_itemRed.node.active = Game.ItemModel.GetItemNumById(97) > 0 || (Game.ItemModel.GetItemNumById(71) > 0 && Game.ItemModel.GetItemNumById(81) > 0);
    },

    updateView1() {
        this.selectTabView1(this._selectTable);
        
        //红点判断
        this.Sprite_equipRed.node.active = Game.ItemModel.IsSmeltTipRed();
        this.Sprite_smeltRed.node.active = Game.ItemModel.IsSmeltTipRed();
        this.Sprite_itemRed.node.active = Game.ItemModel.GetItemNumById(97) > 0 || (Game.ItemModel.GetItemNumById(71) > 0 && Game.ItemModel.GetItemNumById(81) > 0);
    },

    getCellByBaseId(baseid){

    },

    insertCell(index,baseid){},

    removeCell(index,baseid){},

    selectTabView1(selectTab){
        // cc.log(this.tableView.content);
		this.setEquipBtnHightLight(false);
		this.setItemBtnHightLight(false);
        this._selectTable = selectTab;
        switch (selectTab) {
            case PackageState.ITME_TABLE:
            	this.setItemBtnHightLight(true);
                this.updateTableView();
                this.itemList = Game.ItemModel.GetItemsByPackagetype(Game.ItemDefine.PACKAGETYPE.PACKAGE_COMMON);
                this.itemList = Game._.sortBy(this.itemList, function (info) {
                    return info.baseid;
                });
                Game._.forEach(this.itemList,(e,idx) => {

                })
                this.tableView.initTableView(this.itemList.length, { array: this.itemList, target: this },1,false,true);
                break;
            case PackageState.EQUIP_TABLE:
            	this.setEquipBtnHightLight(true);
                this.updateTableView();
                this.itemList = Game.ItemModel.GetItemsByPackagetype(Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP);
                this.itemList = Game._.sortBy(this.itemList, function (info) {
                    let scoreCount = 0;
                    let soul = Game._.get(info, 'equipdata.godnormal', null);
                    let soulLv = Game._.get(soul, 'level', 0);
                    if (soul && soulLv > 0) {
                        scoreCount = 100000000 * soul.level;
                    } else {
                        scoreCount = (1000000 * info.equipdata.color) + Game.EquipModel.GetBasicScore(info.equipdata);
                    }
                    return -scoreCount;
                });
                this.tableView.initTableView(this.itemList.length, { array: this.itemList, target: this },1,false,true);

                this.Label_num.setText(`${this.itemList.length}/${200}`);
                break;
            default:
                break;
        }
        this.Node_itemNum.active = selectTab == PackageState.EQUIP_TABLE;
    },


    updateTableView(){
    	this.itemBase = Game.ItemModel.GetItems();
    	this.itemList = [];
    },
    selectTabView(selectTab){
        // cc.log(this.tableView.content);
		this.setEquipBtnHightLight(false);
		this.setItemBtnHightLight(false);
        this._selectTable = selectTab;
        switch (selectTab) {
            case PackageState.ITME_TABLE:
            	this.setItemBtnHightLight(true);
                this.updateTableView();
                this.itemList = Game.ItemModel.GetItemsByPackagetype(Game.ItemDefine.PACKAGETYPE.PACKAGE_COMMON);
                this.itemList = Game._.sortBy(this.itemList, function (info) {
                    return info.baseid;
                });
                this.tableView.initTableView(this.itemList.length, { array: this.itemList, target: this });
                break;
            case PackageState.EQUIP_TABLE:
            	this.setEquipBtnHightLight(true);
                this.updateTableView();
                this.itemList = Game.ItemModel.GetItemsByPackagetype(Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP);
                this.itemList = Game._.sortBy(this.itemList, function (info) {
                    let scoreCount = 0;
                    let soul = Game._.get(info, 'equipdata.godnormal', null);
                    let soulLv = Game._.get(soul, 'level', 0);
                    if (soul && soulLv > 0) {
                        scoreCount = 100000000 * soul.level;
                    } else {
                        scoreCount = (1000000 * info.equipdata.color) + Game.EquipModel.GetBasicScore(info.equipdata);
                    }
                    return -scoreCount;
                });
                this.tableView.initTableView(this.itemList.length, { array: this.itemList, target: this });

                this.Label_num.setText(`${this.itemList.length}/${200}`);
                break;
            default:
                break;
        }
        this.Node_itemNum.active = selectTab == PackageState.EQUIP_TABLE;
    },
    setItemBtnHightLight(bool){
    	this.Item_btn_bg_press.node.active = bool;
    	this.Item_btn_bg.node.active = !bool;

        this.Button_to_smelting.active = false;
        this.Button_to_tiejiang.active = false;
    },
    setEquipBtnHightLight(bool){
    	this.Equip_btn_bg_press.node.active = bool;
    	this.Equip_btn_bg.node.active = !bool;
        this.Button_to_smelting.active = true;
        this.Button_to_tiejiang.active = true;
    },

    onOpenItem() {
        if (this._selectTable != PackageState.ITME_TABLE){
            this.selectTabView(PackageState.ITME_TABLE);
        }
    },

    onOpenEquip() {
        if (this._selectTable != PackageState.EQUIP_TABLE){
    	   this.selectTabView(PackageState.EQUIP_TABLE);
        }
    },
    onOpenSmelting() {
        this.openView(Game.UIName.UI_EQUIP_SMELTING_SELECT_VIEW);
    },
    onOpenTiejiang() {
        this.openView(Game.UIName.UI_FORGEVIEW);
    },
    
    itemClickedCallback(thisid){
        var item = Game.ItemModel.GetItemById(thisid);
        if (item) {
            this.openView(Game.UIName.UI_ITEMTIPSNODE,item);
        }
    },

    onRetLuckDraw: function (data) {
        Game.ViewController.OpenView(Game.UIName.UI_FAIRY_SHOW, 'MaskLayer', data);
    },
    
});