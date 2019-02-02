const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Node_equipModule: { default: null, type: cc.Node },
        TableView_equips: { default: null, type: cc.tableView },
        Widget_equips: { default: null, type: cc.Widget },
        Node_selectColor: { default: [], type: [cc.Node] },
    },

    onLoad() {
        this.initData();
        this.initView();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GET_SEL_EQUIP, this, this.updateSelectView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GET_SEL_EQUIP, this, this.updateSelectView);
    },

    initData() {
        this._selectEquips = [];
        this._selectEquipColor = [1,2,3,4,5];
        this._equipModuleComponet = null;
    },

    initView() {
        this._equipModuleComponet = this.Node_equipModule.getComponent('EquipModuleNode');
    },

    updateView() {
        this._selectEquips = this.getEquips();
        this.TableView_equips.initTableView(this._selectEquips.length, { array: this._selectEquips, target: this });
    },

    updateSelectView() {
        this.TableView_equips.reloadTableView(this._selectEquips.length, { array: this._selectEquips, target: this });
    },

    getEquips() {
        switch (this._data.selectType) {
            case Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_CHANGE: 
                this._selectEquips = this.getChangeEquips();
                break;
            case Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_SOUL: 
                this._selectEquips = this.getSoulEquips();
                break;
            case Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_TRANSFERSOUL:
                this._selectEquips = this.getTransferSoulEquips();
                break;
        }
        Game.EquipModel.SetSelectEquipsType(this._data.selectType);
        
        this._selectEquips = Game._.sortBy(this._selectEquips, function (info) {
            let result = Game.EquipModel.GetBasicScore(info.equipdata);
            return -result;
        });

        return this._selectEquips;
    },

    getChangeEquips() {
        let equipInfo = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, this._data.equipType);
        if (equipInfo) {
            this.Widget_equips.top = 314;
            this.Widget_equips.updateAlignment();
            if (this._equipModuleComponet) {
                this._equipModuleComponet.updateView(equipInfo);
            }
        } else {
            this.Widget_equips.top = 0;
            this.Widget_equips.updateAlignment();
        }
        this.Node_equipModule.active = equipInfo != null;

        let equips = [];
        for (let i = 0; i < Game.ItemModel.GetItems().length; i ++) {
            let itemInfo = Game.ItemModel.GetItems()[i];

            if (itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP 
                && itemInfo.type == this._data.equipType && Game.UserModel.GetLevel() >= itemInfo.level) {
                for (let b = 0; b < this._selectEquipColor.length; b ++) {
                    if (itemInfo.equipdata.color == this._selectEquipColor[b]) {
                        equips.push(itemInfo);
                        break;
                    }
                }
            }
        }
        return equips;
    },

    getSoulEquips() {
        this.Widget_equips.top = 0;
        this.Widget_equips.updateAlignment();
        this.Node_equipModule.active = false;
        let equips = [];

        for (let i = 0; i < Game.ItemModel.GetItems().length; i ++) {
            let itemInfo = Game.ItemModel.GetItems()[i];

            if (itemInfo.type == Game.ItemDefine.ITEMTYPE.ItemType_Exp) {
                for (let b = 0; b < itemInfo.num; b ++) {
                    equips.push(Game._.cloneDeep(itemInfo));
                }
            }
        }

        for (let i = 0; i < Game.ItemModel.GetItems().length; i ++) {
            let itemInfo = Game.ItemModel.GetItems()[i];

            if (itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP 
                && itemInfo.thisid != this._data.targetid
                && Game.EquipModel.IsHaveSoul(itemInfo)) {
                for (let b = 0; b < this._selectEquipColor.length; b ++) {
                    if (itemInfo.equipdata.color == this._selectEquipColor[b]) {
                        equips.push(itemInfo);
                        break;
                    }
                }
            }
        }
        return equips;
    },

    getTransferSoulEquips() {
        this.Widget_equips.top = 0;
        this.Widget_equips.updateAlignment();
        this.Node_equipModule.active = false;
        let equips = [];
        for (let i = 0; i < Game.ItemModel.GetItems().length; i ++) {
            let itemInfo = Game.ItemModel.GetItems()[i];
            
            let isTypeTure = false;
            if (this._data.equipType == 101 || this._data.equipType == 103 || this._data.equipType == 105) {
                isTypeTure = itemInfo.type == 101 || itemInfo.type == 103 || itemInfo.type == 105;
            } else if (this._data.equipType == 102 || this._data.equipType == 104 || this._data.equipType == 106) {
                isTypeTure = itemInfo.type == 102 || itemInfo.type == 104 || itemInfo.type == 106;
            } else {
                isTypeTure = itemInfo.type == this._data.equipType;
            }
            if (itemInfo.thisid != this._data.targetid 
                && isTypeTure
                && !Game.EquipModel.IsHaveSoul(itemInfo)) {
                for (let b = 0; b < this._selectEquipColor.length; b ++) {
                    if (itemInfo.equipdata.color == this._selectEquipColor[b]) {
                        equips.push(itemInfo);
                        break;
                    }
                }
            }
        }
        return equips;
    },

    onClickCheckColor(event, customEventData) {
        let isPush = true;
        for (let i = 0; i < this._selectEquipColor.length; i ++) {
            if (this._selectEquipColor[i] == customEventData) {
                isPush = false;
                this._selectEquipColor.splice(i,1);
                break;
            }
        }

        if (isPush) {
            this._selectEquipColor.push(customEventData);
        }

        this.Node_selectColor[customEventData - 1].active = isPush;
        this.updateView();
    }
});
