// EquipSmeltingSelectView.js
const Game = require('../../Game');

cc.Class({

	extends: cc.GameComponent,

	properties: {
        node_select1:{default:null, type:cc.Node},
        node_select2:{default:null, type:cc.Node},
        node_select3:{default:null, type:cc.Node},
        node_select4:{default:null, type:cc.Node},
        node_select5:{default:null, type:cc.Node},
        node_select6:{default:null, type:cc.Node},
    },

    onLoad() {
    },
    
    onEnable() {
        this.initNotification();
        this._selectTable = 0;
        this.initData();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },
    initNotification() {

    },
    removeNotification() {

    },
    initData(){
    	this._items = [];
    	this.addModelNode(this.node_select1,1);
    	this.addModelNode(this.node_select2,2);
    	this.addModelNode(this.node_select3,3);
    	this.addModelNode(this.node_select4,4);
    	this.addModelNode(this.node_select5,5); 
    	this.addModelNode(this.node_select6,6); //标星装备

		this.itemList = Game.ItemModel.GetItemsByPackagetype(Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP);
		
    	for (var i = 0; i < this._items.length; i++) {
			var sp_arrow = this._items[i].modelNode.getChildByName('Sprite_di').getChildByName('Sprite_arrow');
			this._items[i].isSelect = true;
    		sp_arrow.active = this._items[i].isSelect;
    		var lab_have = this._items[i].modelNode.getChildByName('Label_have');
    		lab_have.getComponent('Label_').string = "当前拥有" + this._items[i].num + "件" ;
    	}
    },
    updateView(){

    },
    addModelNode(node,color){
    	var item = {};
		item.modelNode = node;
		if (color == Game.ItemDefine.ITEMCOLOR.Item_White) {
			item.isSelect = true;
		} else {
			item.isSelect = false;
		}
    	item.color = color;
        var starEquip = color == 6;
    	item.num = Game.EquipModel.GetUnusePackageEquipNumByColor(color,starEquip);
    	this._items.push(item);
    },

    selectArrow(index) {
    	if (this._items[index - 1] != null){
    		var sp_arrow = this._items[index - 1].modelNode.getChildByName('Sprite_di').getChildByName('Sprite_arrow');
    		this._items[index - 1].isSelect = !this._items[index - 1].isSelect;
    		sp_arrow.active = this._items[index - 1].isSelect;
    	}
    },
    onTouchSmelting() {
		let haveSelect = false;
		for (var i = 0; i < this._items.length; i++) {
    		if (this._items[i].isSelect){
				haveSelect = true;
				break;
			}
		}
		
		if (haveSelect) {
			let itemNum = 0;
			var msg = {};
			msg.colors = [];
			msg.star = false;
			for (var i = 0; i < this._items.length; i++) {
				if (this._items[i].isSelect) {
					if (this._items[i].color == 6) {
						msg.star = true;
					}
					msg.colors.push(this._items[i].color);
					itemNum += this._items[i].num;
				}
			}
			if (itemNum > 0) {
				let isSmelt = false;
				let isBetter = false;
				let equips = Game.ItemModel.GetItemsByPackagetype(Game.ItemDefine.PACKAGETYPE.PACKAGE_EQUIP);
				for (var b = 0; b < msg.colors.length; b ++) {
					let itemColor = msg.colors[b];
					for (var i = 0; i < equips.length; i ++) {
						let equipInfo = equips[i];
						let soul = Game._.get(equipInfo, 'equipdata.godnormal', null);
						let isSoul = false;
						if (soul) {
							isSoul = soul.level > 0;
						}
						if (!isSoul) {
							if (itemColor != 6) {
								if (equipInfo.equipdata.color == itemColor && equipInfo.equipdata.stronglevel == 0 && equipInfo.equipdata.stone.length == 0) {
									isSmelt = true;
									if(this._checkIsBetter(equipInfo)){
										isBetter = true;
										break;
									};
								}
							} else {
								if (equipInfo.equipdata.star > 1 && equipInfo.equipdata.stronglevel == 0 && equipInfo.equipdata.stone.length == 0) {
									isSmelt = true;
									if(this._checkIsBetter(equipInfo)){
										isBetter = true;
										break;
									};
								}
							}
						}
					}
				}
				if (isSmelt) {
					if(isBetter && !Game.GuideController.runningGuide){
						let title = '提示';
            			let desc = '熔炼列表中有比您身上更好的装备哦，是否前往穿戴？';
						Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_CONFIRM, title, desc, [
							{
								name: '继续熔炼',
								handler: function () {
									Game.NetWorkController.SendProto('msg.smeltEquipByColor', msg);
									this.onClose();
								}.bind(this),
							},
							{
								name: '前往装备',
								handler: function () {
									this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Equip);
									this.onClose();
								}.bind(this),
							}
						])
					}else{
						Game.NetWorkController.SendProto('msg.smeltEquipByColor', msg);
						this.onClose();
					}
					

					
				} else {
					this.showTips('无法熔炼已镶星或宝石的装备，请先拆星或拆宝石...');
					this.onClose();
				}
			} else {
				this.showTips('没有可以熔炼的装备!');
				this.onClose();
			}
			// this.onClose();
		} else {
			this.showTips('请选择需要熔炼的装备!');
		}
	},
	
	_checkIsBetter(equipInfo){
		let equipTypes = Game.EquipModel.FindUserEquipTypes();
		for (let i2 = 0; i2 < equipTypes.length; i2++) {
			let type = equipTypes[i2];
			if(equipInfo.type == type){
				let curEquip = Game.EquipModel.GetUseEquipByTypes(Game.ItemDefine.PACKAGETYPE.PACKAGE_USEREQUIP, type);
				if(curEquip == null){
					return true;
				}else{
					if (curEquip.level < equipInfo.level) {
						return equipInfo.level <= Game.UserModel.GetLevel();
					} else {
						if (curEquip.equipdata.color < equipInfo.equipdata.color && curEquip.level == equipInfo.level) {
							return true;
						};
					};
				};
			};
		};
		return false;
	},

    onTouchSmeltingAll() {
    	for (var i = 0; i < this._items.length; i++) {
    		var sp_arrow = this._items[i].modelNode.getChildByName('Sprite_di').getChildByName('Sprite_arrow');
			this._items[i].isSelect = true;
			sp_arrow.active = this._items[i].isSelect;
    	}
    },
    onTouchArrow1() {
    	this.selectArrow(1);
    },
    onTouchArrow2() {
    	this.selectArrow(2);
    },
    onTouchArrow3() {
    	this.selectArrow(3);
    },
    onTouchArrow4() {
    	this.selectArrow(4);
    },
    onTouchArrow5() {
    	this.selectArrow(5);
    },
    onTouchArrow6() {
    	this.selectArrow(6);
    },
});