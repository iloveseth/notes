// FairyEquipNode.js
const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,
    properties: {
        equip_icon: { default: null, type: cc.Sprite_ },
        equip_quality: { default: null, type: cc.Sprite_ },
        sprite_star:{default:[],type:[cc.Sprite_]},
        sp_dot:{default: null,type: cc.Node},
    },

    onLoad() {
        this.initData();
    },
    onEnable() {
    },
    onDisable() {
    },
    initData() {
    	// this._target = null;
    	// this._itemInfo = null;
    },
    updateView(data,callback = null) {
     	this._equipInfo = data.equipInfo;
     	this._pos = data.pos;
     	this._callback = callback;
        if(this.sp_dot){
            this.sp_dot.active = data.dot;
        }
     	if(this._equipInfo){
     		var eid = this._equipInfo.weapon*10000+this._equipInfo.level;
        	var equipConfig = Game.FairyModel.GetFairyEquipConfigById(eid);
        	if(equipConfig){
        		this.equip_icon.node.active = true;
        		this.equip_icon.SetSprite(equipConfig.pic);
	            this.equip_quality.SetSprite(Game.ItemModel.GetItemQualityIcon(equipConfig.color));
	        	for (var i = 0; i < this.sprite_star.length; i++) {
	        		this.sprite_star[i].node.active = false;
	        		if(i < equipConfig.star){
	        			this.sprite_star[i].node.active = true;
	        			// this.sprite_star[i].SetSprite(Game.ItemModel.GetItemQualityStarIcon(equipConfig.color));
	        		}
	        	}
        	}
     	}else{
     		this.equip_icon.node.active = false;
     		this.equip_quality.SetSprite(Game.ItemModel.GetItemQualityIcon(1));
     		for (var i = 0; i < this.sprite_star.length; i++) {
        		this.sprite_star[i].node.active = false;
        	}
        	this._callback = null;
     	}
    },
    onTouchSelectEquip() {
    	if (Game._.isFunction(this._callback)) {
            Game.Tools.InvokeCallback(this._callback, Game._.get(this, '_pos', 0));
            return;
        }
    }
});
