const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        Label_equipname: { default: null, type: cc.Label_ },
        Label_putOrtake: { default: null, type: cc.Label_ },
        Label_isEquip: { default: null, type: cc.Label_ },
        Node_select: { default: null, type: cc.Node },
        Sprite_select: { default: null, type: cc.Sprite_ },
        Button_putOrtake: { default: null, type: cc.Button },
        Node_singleItem: { default: null, type: cc.Node },
        Node_equipPropertyNode: { default: null, type: cc.Node },
    },

    onLoad() {
        this.initData();
        this.initView();
    },

    initData() {
        this.itemInfo = null;
        this.itemConfig = null;
        this._singleItemComponent = null;
        this._equipPropertyComponent = null;
    },

    initView() {
        this._singleItemComponent = this.Node_singleItem.getComponent('SingleItemNode');
        this._equipPropertyComponent = this.Node_equipPropertyNode.getComponent('EquipPropertyNode');
    },

    updateView(t_object, idx=0) {
        this.itemInfo = t_object;
        this.index = idx;
        this.itemConfig = Game.ItemModel.GetItemConfig(this.itemInfo.baseid);
        let isEquip = Game.EquipModel.IsEquip(this.itemInfo.type);

        if (this.itemConfig) {
            if (isEquip) {      //装备列表
                this.Label_equipname.node.color = Game.ItemModel.GetItemLabelColor(this.itemInfo.equipdata.color);
                let newstronglevel = Game._.get(this, 'itemInfo.equipdata.newstronglevel', 0);
                if (newstronglevel > 0) {
                    this.Label_equipname.setText(Game.UserModel.GetLevelDesc(this.itemInfo.level) + this.itemConfig.name + '  +' + this.itemInfo.equipdata.newstronglevel);
                } else {
                    this.Label_equipname.setText(Game.UserModel.GetLevelDesc(this.itemInfo.level) + this.itemConfig.name);
                }

                let equipbase = null;
                switch (Game.EquipModel.GetSelectEquipsType()) {
                    case Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_CHANGE: 
                        // if(this.itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP) {
                        //     this.Label_putOrtake.setText('装备');
                        // } else {
                        //     this.Label_putOrtake.setText('卸下');    //暂时屏蔽
                        // }
                        this.Button_putOrtake.node.active = this.itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP;
                        this.Node_select.active = false;
                        break;
                    case Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_SOUL:
                        equipbase = Game._.find(Game.EquipModel.selectEquips, { 'thisid': this.itemInfo.thisid });
                        this.Sprite_select.node.active = equipbase != null;
                        this.Button_putOrtake.node.active = false; 
                        this.Node_select.active = true;
                        break;
                    case Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_TRANSFERSOUL:
                        equipbase = Game._.find(Game.EquipModel.selectEquips, { 'thisid': this.itemInfo.thisid });
                        this.Sprite_select.node.active = equipbase != null;
                        this.Button_putOrtake.node.active = false;
                        this.Node_select.active = true;
                        break;
                }

                if (this.itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP) {
                    this.Label_isEquip.setText('人物装备');
                    this.Label_isEquip.node.active = true;
                } else if (this.itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_PETEQUIP1 
                            || this.itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_PETEQUIP2 
                            || this.itemInfo.packagetype == Game.ItemDefine.PACKAGETYPE.PACKAGE_PETEQUIP3) {
                    this.Label_isEquip.setText('精灵装备');
                    this.Label_isEquip.node.active = true;
                } else {
                    this.Label_isEquip.node.active = false;
                }

                if (this._equipPropertyComponent) {     //装备属性详情
                    this._equipPropertyComponent.updateView(this.itemInfo);
                }
            } else {        //道具列表
                this.Label_equipname.node.color = Game.ItemModel.GetItemLabelColor(this.itemInfo.color);
                this.Label_equipname.setText(this.itemConfig.name);

                let itemBase = Game._.find(Game.EquipModel.selectEquips, { 'thisid': this.itemInfo.thisid, 'soulIndex': this.index });

                this.Sprite_select.node.active = itemBase != null;
                this.Button_putOrtake.node.active = false; 
                this.Node_select.active = true;
                this.Label_isEquip.node.active = false;
            }
        }

        if (this._singleItemComponent) {
            this._singleItemComponent.updateView(this.itemInfo, function(){});
            this._singleItemComponent.setNumVisible(false);
        }

        this.Node_equipPropertyNode.active = isEquip;
    },

    onClickPutOrTake() {
        if (this.itemInfo) {
            if (Game.EquipModel.IsUseEquip(this.itemInfo.packagetype)) {
                Game.NetWorkController.SendProto('msg.TakeOffEquip', {
                    thisid: this.itemInfo.thisid,
                    packtype: this.itemInfo.packagetype,
                });
            } else {
                Game.NetWorkController.SendProto('msg.PutOnEquip', {
                    thisid: this.itemInfo.thisid,
                    packtype: Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP,
                });
            }

            Game.ViewController.CloseAllView();
        }
    },

    onClickSelect() {
        switch (Game.EquipModel.GetSelectEquipsType()) {
            case Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_SOUL:
                if (Game.EquipModel.IsEquip(this.itemInfo.type)) {      //如果是装备 则走正常的流程 不能选择同样的装备
                    let equipbase = Game._.find(Game.EquipModel.selectEquips, { 'thisid': this.itemInfo.thisid });
                    if (equipbase) {
                        Game._.remove(Game.EquipModel.selectEquips, function (o) {
                            return o.thisid == this.itemInfo.thisid;
                        }.bind(this));
                    } else {
                        if (Game.EquipModel.selectEquips.length >= 6) {
                            this.showTips('最多只能选择6件灵魂道具');
                        } else {
                            Game.EquipModel.selectEquips.push(this.itemInfo);
                        }
                    }
                } else {        //如果是灵魂石 因为thisid是一样的 所以要加下标来标识
                    let itembase = Game._.find(Game.EquipModel.selectEquips, { 'thisid': this.itemInfo.thisid, 'soulIndex': this.index });
                    if (itembase) {
                        Game._.remove(Game.EquipModel.selectEquips, function (o) {
                            return o.thisid == this.itemInfo.thisid && o.soulIndex == this.index;
                        }.bind(this));
                    } else {
                        if (Game.EquipModel.selectEquips.length >= 6) {
                            this.showTips('最多只能选择6件灵魂道具');
                        } else {
                            this.itemInfo.soulIndex = this.index;
                            Game.EquipModel.selectEquips.push(this.itemInfo);
                        }
                    }
                }
                break;

            case Game.Define.EQUIP_SELECT_TYPE.EQUIP_SELECT_TRANSFERSOUL:
                if (Game.EquipModel.selectEquips.length > 0) {
                    if (this.itemInfo.thisid == Game.EquipModel.selectEquips[0].thisid) {
                        Game.EquipModel.selectEquips = [];
                    } else if (Game.EquipModel.selectEquips.length > 0) {
                        Game.EquipModel.selectEquips = [];
                        Game.EquipModel.selectEquips.push(this.itemInfo);
                    }
                } else {
                    Game.EquipModel.selectEquips.push(this.itemInfo);
                }
                break;
        }

        Game.NotificationController.Emit(Game.Define.EVENT_KEY.GET_SEL_EQUIP);
    }
});
